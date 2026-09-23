/**
 * EDC MEDIA — WORKSPACE SERVICE
 * Universal multi-workspace abstraction and authorization boundaries.
 */

import { Workspace, WorkspacePlan } from '@/types/platform';
import { sanitizeSlug } from '@/lib/slug';
import { notifyStorageChange } from '@/lib/useMounted';
import { ActivityService } from './activity-service';

const STORAGE_KEY_WORKSPACES = 'edc_platform_workspaces';
const STORAGE_KEY_ACTIVE_WS = 'edc_platform_active_workspace_id';

export const DEFAULT_WORKSPACE: Workspace = {
  id: 'ws_edc_default',
  ownerId: 'user_edc_founder',
  name: 'EDC Media Flagship',
  slug: 'edc-media-flagship',
  plan: 'PRO',
  status: 'ACTIVE',
  createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    brandColor: '#00E5FF',
    notificationEmail: 'info.edcmedia@gmail.com',
    onboardingCompleted: true,
    primaryBuildingGoal: 'LANDING_PAGE',
  },
};

export class WorkspaceService {
  static getWorkspaces(): Workspace[] {
    if (typeof window === 'undefined') {
      return [DEFAULT_WORKSPACE];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORKSPACES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify([DEFAULT_WORKSPACE]));
        return [DEFAULT_WORKSPACE];
      }
      return JSON.parse(stored);
    } catch {
      return [DEFAULT_WORKSPACE];
    }
  }

  static getActiveWorkspaceId(): string {
    if (typeof window === 'undefined') return DEFAULT_WORKSPACE.id;
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE_WS) || DEFAULT_WORKSPACE.id;
    } catch {
      return DEFAULT_WORKSPACE.id;
    }
  }

  static getActiveWorkspace(): Workspace {
    const list = this.getWorkspaces();
    const activeId = this.getActiveWorkspaceId();
    return list.find((w) => w.id === activeId) || list[0] || DEFAULT_WORKSPACE;
  }

  static setActiveWorkspace(workspaceId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_WS, workspaceId);
      notifyStorageChange();
    } catch (e) {
      console.error('Failed to set active workspace', e);
    }
  }

  static getWorkspaceById(id: string): Workspace | null {
    const list = this.getWorkspaces();
    return list.find((w) => w.id === id) || null;
  }

  static async createWorkspace(data: {
    name: string;
    ownerId?: string;
    plan?: WorkspacePlan;
    primaryBuildingGoal?: string;
  }): Promise<Workspace> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success && result.workspace) {
          const list = this.getWorkspaces();
          list.push(result.workspace);
          localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(list));
          localStorage.setItem(STORAGE_KEY_ACTIVE_WS, result.workspace.id);
          const domainConn = result.domainConnection;
          if (domainConn) {
            const storedDomains = localStorage.getItem('edc_platform_domain_connections');
            const dList = storedDomains ? JSON.parse(storedDomains) : [];
            dList.push(domainConn);
            localStorage.setItem('edc_platform_domain_connections', JSON.stringify(dList));
          }
          notifyStorageChange();
          ActivityService.recordActivity({
            workspaceId: result.workspace.id,
            type: 'WORKSPACE_CREATED',
            message: `Workspace "${result.workspace.name}" (${result.workspace.plan} tier) created.`,
            metadata: { plan: result.workspace.plan, slug: result.workspace.slug },
          });
          return result.workspace;
        }
      } catch (err) {
        console.error('API createWorkspace failed', err);
      }
    }

    // Fallback if API fails or server-side (shouldn't happen on server-side though)
    const cleanName = data.name.trim();
    const baseSlug = sanitizeSlug(cleanName) || 'my-workspace';
    const list = this.getWorkspaces();
    let slug = baseSlug;
    let counter = 1;
    while (list.some((w) => w.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newWs: Workspace = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      ownerId: data.ownerId || 'user_edc_founder',
      name: cleanName,
      slug,
      plan: data.plan || 'STARTER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        brandColor: '#00E5FF',
        onboardingCompleted: true,
        primaryBuildingGoal: data.primaryBuildingGoal,
      },
    };

    list.push(newWs);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(list));
        localStorage.setItem(STORAGE_KEY_ACTIVE_WS, newWs.id);
        notifyStorageChange();
      } catch (e) {
        console.error('Failed to save workspace', e);
      }
    }

    ActivityService.recordActivity({
      workspaceId: newWs.id,
      type: 'WORKSPACE_CREATED',
      message: `Workspace "${newWs.name}" (${newWs.plan} tier) created.`,
      metadata: { plan: newWs.plan, slug: newWs.slug },
    });

    return newWs;
  }

  static updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Workspace | null {
    const list = this.getWorkspaces();
    const idx = list.findIndex((w) => w.id === workspaceId);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(list));
        notifyStorageChange();
      } catch (e) {
        console.error('Failed to update workspace', e);
      }
    }
    return list[idx];
  }
}
