/**
 * EDC MEDIA — UNIVERSAL PROJECT SERVICE
 * Authoritative lifecycle, querying, and management for all 6 project types:
 * WEBSITE, LANDING_PAGE, AI_APP, AI_AGENT, AUTOMATION, BUSINESS_SYSTEM.
 */

import { UniversalProject, ProjectType } from '@/types/platform';
import { sanitizeSlug } from '@/lib/slug';
import { auth } from '@/lib/firebase';
import { FirebaseDataService } from './firebase-data-service';
import { ActivityService } from './activity-service';

export class ProjectService {
  static async getProjects(organizationId: string, typeFilter?: ProjectType): Promise<UniversalProject[]> {
    try {
      if (!organizationId) return [];
      return await FirebaseDataService.getProjects(organizationId, typeFilter);
    } catch (e) {
      console.error('Failed to fetch projects from Firestore', e);
      return [];
    }
  }

  static async getProjectById(organizationId: string, projectId: string): Promise<UniversalProject | null> {
    try {
      return await FirebaseDataService.getProjectById(organizationId, projectId);
    } catch (e) {
      console.error('Failed to fetch project from Firestore', e);
      return null;
    }
  }

  static async createProject(data: {
    organizationId: string;
    workspaceId?: string;
    name: string;
    type: ProjectType;
    description?: string;
    initialData?: any;
    metadata?: Record<string, any>;
  }): Promise<UniversalProject> {
    const cleanName = data.name.trim();
    const baseSlug = sanitizeSlug(cleanName) || 'project';
    const id = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newProj: UniversalProject = {
      id,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId || 'ws_default',
      name: cleanName,
      slug,
      type: data.type,
      status: 'DRAFT',
      deploymentStatus: 'NOT_CONFIGURED',
      description: data.description || `Autonomous ${data.type} project created in EDC Media.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {},
      createdBy: auth.currentUser?.uid || 'system',
    };

    // Save to Firestore
    await FirebaseDataService.createProject(data.organizationId, newProj);

    // If type is LANDING_PAGE, save initial draft
    if (data.type === 'LANDING_PAGE') {
      await FirebaseDataService.saveDraft(data.organizationId, id, data.initialData || { name: newProj.name });
    }

    ActivityService.recordActivity({
      workspaceId: data.workspaceId || 'ws_default',
      projectId: newProj.id,
      type: 'PROJECT_CREATED',
      message: `Created ${data.type} project "${newProj.name}" in Firestore`,
      metadata: { type: data.type, slug: newProj.slug },
    });

    return newProj;
  }

  static async updateProject(organizationId: string, projectId: string, updates: Partial<UniversalProject>): Promise<void> {
    try {
      await FirebaseDataService.updateProject(organizationId, projectId, updates);
      
      ActivityService.recordActivity({
        workspaceId: updates.workspaceId || 'ws_default',
        projectId,
        type: 'PROJECT_UPDATED',
        message: `Updated project "${updates.name || projectId}"`,
      });
    } catch (e) {
      console.error('Failed to update project in Firestore', e);
      throw e;
    }
  }

  static async deleteProject(organizationId: string, projectId: string): Promise<void> {
    try {
      await FirebaseDataService.deleteProject(organizationId, projectId);
      
      ActivityService.recordActivity({
        workspaceId: 'ws_default',
        projectId,
        type: 'PROJECT_UPDATED',
        message: `Deleted project ${projectId}`,
      });
    } catch (e) {
      console.error('Failed to delete project in Firestore', e);
      throw e;
    }
  }

  static async duplicateProject(organizationId: string, projectId: string): Promise<UniversalProject | null> {
    const target = await this.getProjectById(organizationId, projectId);
    if (!target) return null;

    const dup = await this.createProject({
      organizationId: target.organizationId,
      workspaceId: target.workspaceId,
      name: `${target.name} (Copy)`,
      type: target.type,
      description: target.description,
      initialData: target.landingPageData,
      metadata: target.metadata,
    });

    return dup;
  }
}
