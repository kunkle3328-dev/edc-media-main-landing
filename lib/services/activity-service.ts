/**
 * EDC MEDIA — ACTIVITY SERVICE
 * Authoritative activity and event recording for user actions and future AI Operator execution.
 */

import { PlatformActivity, ActivityType } from '@/types/platform';
import { notifyStorageChange } from '@/lib/useMounted';

const STORAGE_KEY_ACTIVITIES = 'edc_platform_activities';

export const INITIAL_ACTIVITIES: PlatformActivity[] = [
  {
    id: 'act_init_1',
    workspaceId: 'ws_edc_default',
    type: 'WORKSPACE_CREATED',
    message: 'EDC Media flagship workspace initialized.',
    actor: 'System Administrator',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'act_init_2',
    workspaceId: 'ws_edc_default',
    projectId: 'page_cttybo0',
    type: 'PROJECT_CREATED',
    message: 'Landing page project "Lumina Modern Dental & Implants" initialized.',
    actor: 'EDC Operator',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'act_init_3',
    workspaceId: 'ws_edc_default',
    projectId: 'page_cttybo0',
    type: 'PUBLISH_SUCCEEDED',
    message: 'Landing page published to public endpoint /p/lumina-modern-dental-implants-tybo0',
    actor: 'EDC Operator',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export class ActivityService {
  static getActivities(workspaceId?: string, limit: number = 20): PlatformActivity[] {
    if (typeof window === 'undefined') {
      return workspaceId
        ? INITIAL_ACTIVITIES.filter((a) => a.workspaceId === workspaceId)
        : INITIAL_ACTIVITIES;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      const list: PlatformActivity[] = stored ? JSON.parse(stored) : [...INITIAL_ACTIVITIES];
      const filtered = workspaceId ? list.filter((a) => a.workspaceId === workspaceId) : list;
      return filtered.slice(0, limit);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  }

  static recordActivity(activity: {
    workspaceId: string;
    projectId?: string;
    type: ActivityType;
    message: string;
    metadata?: Record<string, any>;
    actor?: string;
  }): PlatformActivity {
    const newAct: PlatformActivity = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      workspaceId: activity.workspaceId,
      projectId: activity.projectId,
      type: activity.type,
      message: activity.message,
      metadata: activity.metadata,
      actor: activity.actor || 'User',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
        const list: PlatformActivity[] = stored ? JSON.parse(stored) : [...INITIAL_ACTIVITIES];
        list.unshift(newAct);
        if (list.length > 500) list.pop();
        localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(list));
        notifyStorageChange();
      } catch (e) {
        console.error('Failed to record platform activity', e);
      }
    }

    return newAct;
  }
}
