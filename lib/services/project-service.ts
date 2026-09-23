/**
 * EDC MEDIA — UNIVERSAL PROJECT SERVICE
 * Authoritative lifecycle, querying, and management for all 6 project types:
 * WEBSITE, LANDING_PAGE, AI_APP, AI_AGENT, AUTOMATION, BUSINESS_SYSTEM.
 */

import { UniversalProject, ProjectType, ProjectLifecycleStatus } from '@/types/platform';
import { sanitizeSlug } from '@/lib/slug';
import { pageStorage } from '@/lib/storage';
import { LandingPage } from '@/types/landing-engine';
import { notifyStorageChange } from '@/lib/useMounted';
import { ActivityService } from './activity-service';
import { VersionService } from './version-service';
import { resolveProjectUrl } from '@/lib/brand-config';
import { auth } from '@/lib/firebase';
import { FirebaseDataService } from './firebase-data-service';

import { queuePersist } from '@/lib/storage';

const STORAGE_KEY_PROJECTS = 'edc_platform_universal_projects';

let cachedProjectsList: UniversalProject[] | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY_PROJECTS) {
      cachedProjectsList = null;
    }
  });
  window.addEventListener('edc_storage_updated', () => {
    cachedProjectsList = null;
  });
}

export const INITIAL_PROJECTS: UniversalProject[] = [
  {
    id: 'page_cttybo0',
    organizationId: 'org_edc_default',
    workspaceId: 'ws_edc_default',
    name: 'Lumina Modern Dental & Implants',
    slug: 'lumina-modern-dental-implants-tybo0',
    type: 'LANDING_PAGE',
    status: 'LIVE',
    deploymentStatus: 'DEPLOYED',
    description: 'High-converting implant special and 3D smile intake for cosmetic dental practice.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastPublishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    publicUrl: '/p/lumina-modern-dental-implants-tybo0',
    metadata: {
      niche: 'Dental Clinic',
      conversionScore: 94,
    },
  },
  {
    id: 'proj_apex_dispatch',
    organizationId: 'org_edc_default',
    workspaceId: 'ws_edc_default',
    name: 'Apex Emergency Dispatch Portal',
    slug: 'apex-emergency-dispatch',
    type: 'WEBSITE',
    status: 'PUBLISHED',
    deploymentStatus: 'DEPLOYED',
    description: '24/7 rapid incident response and localized quote engine for contractor operations.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastPublishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    publicUrl: '/p/apex-emergency-dispatch',
    metadata: {
      niche: 'Emergency Home Services',
    },
  },
  {
    id: 'proj_signalflow_ai',
    organizationId: 'org_edc_default',
    workspaceId: 'ws_edc_default',
    name: 'SignalFlow Intent Monitor',
    slug: 'signalflow-intent-monitor',
    type: 'AI_APP',
    status: 'BUILDING',
    deploymentStatus: 'NOT_CONFIGURED',
    description: 'Predictive B2B pipeline intent scanner with real-time Slack and CRM notifications.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      model: 'gemini-2.5-flash',
    },
  },
  {
    id: 'proj_lead_triage_agent',
    organizationId: 'org_edc_default',
    workspaceId: 'ws_edc_default',
    name: 'Autonomous Inbound Lead Qualifier',
    slug: 'inbound-lead-qualifier-agent',
    type: 'AI_AGENT',
    status: 'DRAFT',
    deploymentStatus: 'NOT_CONFIGURED',
    description: 'Voice & text agent qualifying high-ticket inbound prospects 24/7.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      agentType: 'Voice/Text Intake',
    },
  },
];

export class ProjectService {
  /**
   * Adapts a LandingPage instance into a UniversalProject
   */
  static adaptLandingPage(page: LandingPage, workspaceId: string = 'ws_edc_default'): UniversalProject {
    const isLive = page.status === 'published';
    const resolved = resolveProjectUrl(page);

    return {
      id: page.id,
      organizationId: 'org_edc_default', // Default fallback
      workspaceId: page.workspaceId || workspaceId,
      name: page.name || page.businessProfile?.name || 'Untitled Landing Engine',
      slug: page.publicSlug || sanitizeSlug(page.name) || page.id,
      type: 'LANDING_PAGE',
      status: isLive ? 'LIVE' : 'DRAFT',
      deploymentStatus: isLive ? 'DEPLOYED' : 'NOT_CONFIGURED',
      description: page.strategy?.positioning || 'High-converting direct-response landing engine.',
      createdAt: page.createdAt || new Date().toISOString(),
      updatedAt: page.updatedAt || new Date().toISOString(),
      lastPublishedAt: page.publishedAt,
      publicUrl: resolved.url || undefined,
      currentVersionId: page.publishedVersionId,
      metadata: {
        businessProfile: page.businessProfile,
        conversionScore: page.conversionScore?.overallScore,
      },
      landingPageData: page,
    };
  }

  static async getProjectsAsync(organizationId: string, typeFilter?: ProjectType): Promise<UniversalProject[]> {
    try {
      let list = await FirebaseDataService.getProjects(organizationId);
      if (typeFilter) {
        list = list.filter((p) => p.type === typeFilter);
      }
      return list;
    } catch (e) {
      console.error('Failed to get projects from Firestore, falling back to local', e);
      return this.getProjects(undefined, typeFilter);
    }
  }

  static async createProjectAsync(data: {
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

  static getProjects(workspaceId?: string, typeFilter?: ProjectType): UniversalProject[] {
    let list: UniversalProject[] = [];

    if (typeof window === 'undefined') {
      list = [...INITIAL_PROJECTS];
    } else {
      if (cachedProjectsList) {
        list = cachedProjectsList;
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
          if (stored) {
            list = JSON.parse(stored);
          } else {
            list = [...INITIAL_PROJECTS];
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
          }
        } catch {
          list = [...INITIAL_PROJECTS];
        }
        cachedProjectsList = list;
      }

      // Merge any existing Landing Pages from pageStorage to prevent duplicate or lost data
      try {
        const localLandingPages = pageStorage.getAllPages();
        const mergedList = [...list];
        for (const lp of localLandingPages) {
          const existingIdx = mergedList.findIndex((p) => p.id === lp.id);
          const adapted = this.adaptLandingPage(lp, workspaceId || 'ws_edc_default');
          if (existingIdx >= 0) {
            mergedList[existingIdx] = {
              ...mergedList[existingIdx],
              ...adapted,
              landingPageData: lp,
            };
          } else {
            mergedList.unshift(adapted);
          }
        }
        list = mergedList;
      } catch (e) {
        console.error('Failed to sync landing pages into projects', e);
      }
    }

    if (workspaceId) {
      list = list.filter((p) => p.workspaceId === workspaceId || !p.workspaceId);
    }
    if (typeFilter) {
      list = list.filter((p) => p.type === typeFilter);
    }

    return list;
  }

  static getProjectById(projectId: string): UniversalProject | null {
    const list = this.getProjects();
    const found = list.find((p) => p.id === projectId);
    if (found) return found;

    // Check raw landing page storage
    if (typeof window !== 'undefined') {
      const lp = pageStorage.getPage(projectId);
      if (lp) {
        return this.adaptLandingPage(lp);
      }
    }
    return null;
  }

  static createProject(data: {
    organizationId: string;
    workspaceId: string;
    name: string;
    type: ProjectType;
    description?: string;
    initialData?: any;
    metadata?: Record<string, any>;
  }): UniversalProject {
    const cleanName = data.name.trim();
    const baseSlug = sanitizeSlug(cleanName) || 'project';
    const id = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newProj: UniversalProject = {
      id,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      name: cleanName,
      slug,
      type: data.type,
      status: 'DRAFT',
      deploymentStatus: 'NOT_CONFIGURED',
      description: data.description || `Autonomous ${data.type} project created in EDC Media.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: data.metadata || {},
    };

    // If type is LANDING_PAGE and initial data exists or needs default structure
    if (data.type === 'LANDING_PAGE') {
      // Create initial version snapshot
      VersionService.createVersion({
        projectId: newProj.id,
        workspaceId: data.workspaceId,
        content: data.initialData || { name: newProj.name },
        changeReason: 'Initial Creation',
      });
    }

    if (typeof window !== 'undefined') {
      try {
        const list = this.getProjects();
        list.unshift(newProj);
        cachedProjectsList = list;
        queuePersist(STORAGE_KEY_PROJECTS, list);
        notifyStorageChange();
      } catch (e) {
        console.error('Failed to save project', e);
      }
    }

    ActivityService.recordActivity({
      workspaceId: data.workspaceId,
      projectId: newProj.id,
      type: 'PROJECT_CREATED',
      message: `Created ${data.type} project "${newProj.name}"`,
      metadata: { type: data.type, slug: newProj.slug },
    });

    return newProj;
  }

  static updateProject(projectId: string, updates: Partial<UniversalProject>): UniversalProject | null {
    const list = this.getProjects();
    const idx = list.findIndex((p) => p.id === projectId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        cachedProjectsList = list;
        queuePersist(STORAGE_KEY_PROJECTS, list);
        notifyStorageChange();
      } catch (e) {
        console.error('Failed to update project', e);
      }
    }

    ActivityService.recordActivity({
      workspaceId: list[idx].workspaceId,
      projectId: list[idx].id,
      type: 'PROJECT_UPDATED',
      message: `Updated project "${list[idx].name}" (${updates.status || 'Details modified'})`,
    });

    return list[idx];
  }

  static deleteProject(projectId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const list = this.getProjects();
      const filtered = list.filter((p) => p.id !== projectId);
      cachedProjectsList = filtered;
      queuePersist(STORAGE_KEY_PROJECTS, filtered);

      // Also remove from landing page storage if present
      pageStorage.deletePage(projectId);
      notifyStorageChange();
      return true;
    } catch {
      return false;
    }
  }

  static duplicateProject(projectId: string): UniversalProject | null {
    const target = this.getProjectById(projectId);
    if (!target) return null;

    const dup = this.createProject({
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
