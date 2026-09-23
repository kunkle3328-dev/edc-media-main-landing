/**
 * EDC MEDIA — PUBLISH SERVICE
 * Authoritative lifecycle state machine for project publishing and domain routing.
 */

import { ProjectService } from './project-service';
import { VersionService } from './version-service';
import { ActivityService } from './activity-service';
import { resolveProjectUrl } from '@/lib/brand-config';
import { getCustomerSubdomain } from '@/lib/domain-config';
import { pageStorage } from '@/lib/storage';

import { auth } from '@/lib/firebase';

export interface PublishResult {
  success: boolean;
  publicSlug?: string;
  publicUrl?: string;
  publishedAt?: string;
  state: 'LIVE' | 'PUBLISHED' | 'NOT_CONFIGURED' | 'FAILED';
  error?: string;
  message?: string;
  isInfrastructureConfigured: boolean;
}

export class PublishService {
  static async publishProject(projectId: string, customSlug?: string, organizationId?: string): Promise<PublishResult> {
    const orgId = organizationId || 'org_edc_default';
    const p = await ProjectService.getProjectById(orgId, projectId);
    
    if (!p) {
      return {
        success: false,
        state: 'FAILED',
        error: 'Project not found.',
        isInfrastructureConfigured: false,
      };
    }

    ActivityService.recordActivity({
      workspaceId: p.workspaceId || 'ws_default',
      projectId: p.id,
      type: 'PUBLISH_STARTED',
      message: `Publish pipeline initiated for "${p.name}"`,
    });

    const finalSlug = customSlug?.trim() || p.slug || `page-${p.id}`;
    let publishedAt = new Date().toISOString();

    // If it's a Landing Page, we MUST publish authoritatively via the server
    if (p.type === 'LANDING_PAGE') {
      const lp = typeof window !== 'undefined' ? pageStorage.getPage(projectId) : p.landingPageData;
      
      if (lp) {
        const versions = typeof window !== 'undefined' ? pageStorage.getVersions(projectId) : [];
        let version = versions[0];
        if (!version) {
           version = pageStorage.createVersionSnapshot(lp, 'Pre-publish auto-save', 'Auto-generated snapshot prior to publishing');
        }

        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          
          // Add Auth Token if available
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
          }

          const res = await fetch('/api/landing-engine/publish', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              page: lp,
              version,
              publicSlug: finalSlug,
              workspaceId: p.workspaceId,
              organizationId: orgId
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Server rejected publication.');
          }
          publishedAt = data.publishedAt || publishedAt;
        } catch (e: any) {
           ActivityService.recordActivity({
             workspaceId: p.workspaceId || 'ws_default',
             projectId: p.id,
             type: 'PUBLISH_FAILED',
             message: `Publication failed: ${e.message}`,
           });
           return {
             success: false,
             state: 'FAILED',
             error: e.message,
             isInfrastructureConfigured: true,
           };
        }

        // Apply local state updates ONLY after successful server publish
        lp.status = 'published';
        lp.publicSlug = finalSlug;
        lp.publishedAt = publishedAt;
        lp.publishedVersionId = version.id;
        if (typeof window !== 'undefined') {
          pageStorage.savePage(lp);
        }
      }
    }

    // Update Universal Project state locally
    await ProjectService.updateProject(orgId, projectId, {
      status: 'LIVE',
      deploymentStatus: 'DEPLOYED',
      slug: finalSlug,
      lastPublishedAt: publishedAt,
    });

    // Resolve Canonical URL
    const resolved = resolveProjectUrl({
      ...p,
      status: 'LIVE',
      slug: finalSlug,
    });
    const finalUrl = resolved.url || getCustomerSubdomain(finalSlug);

    // Update public URL on local project state
    await ProjectService.updateProject(orgId, projectId, { publicUrl: finalUrl });

    ActivityService.recordActivity({
      workspaceId: p.workspaceId,
      projectId: p.id,
      type: 'PUBLISH_SUCCEEDED',
      message: `Project "${p.name}" successfully published.`,
      metadata: { publicSlug: finalSlug },
    });

    return {
      success: true,
      publicSlug: finalSlug,
      publicUrl: finalUrl,
      publishedAt,
      state: 'LIVE',
      message: 'Published successfully.',
      isInfrastructureConfigured: true,
    };
  }

  static async unpublishProject(projectId: string, organizationId?: string): Promise<{ success: boolean; message: string }> {
    const orgId = organizationId || 'org_edc_default';
    const p = await ProjectService.getProjectById(orgId, projectId);
      
    if (!p) return { success: false, message: 'Project not found' };

    if (p.type === 'LANDING_PAGE') {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/landing-engine/unpublish', {
          method: 'POST',
          headers,
          body: JSON.stringify({ pageId: projectId, organizationId: orgId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
           throw new Error(data.error || 'Server rejected unpublish.');
        }
      } catch (e: any) {
        return { success: false, message: `Failed to unpublish: ${e.message}` };
      }
    }

    await ProjectService.updateProject(orgId, projectId, {
      status: 'DRAFT',
      deploymentStatus: 'NOT_CONFIGURED',
      lastPublishedAt: undefined,
      publicUrl: undefined,
    });

    if (typeof window !== 'undefined') {
      const lp = pageStorage.getPage(projectId);
      if (lp) {
        lp.status = 'draft';
        pageStorage.savePage(lp);
      }
    }

    ActivityService.recordActivity({
      workspaceId: p.workspaceId,
      projectId: p.id,
      type: 'PROJECT_UPDATED',
      message: `Unpublished "${p.name}" — reverted to draft.`,
    });

    return { success: true, message: 'Project reverted to draft state.' };
  }

  static async getPublishingState(projectId: string, organizationId?: string) {
    const orgId = organizationId || 'org_edc_default';
    const project = await ProjectService.getProjectById(orgId, projectId);
    if (!project) return null;

    const resolved = resolveProjectUrl(project);
    return {
      status: project.status,
      deploymentStatus: project.deploymentStatus,
      lastPublishedAt: project.lastPublishedAt,
      publicUrl: resolved.url,
      urlType: resolved.type,
      isLive: resolved.isLive,
    };
  }
}
