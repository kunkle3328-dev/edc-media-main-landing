/**
 * EDC MEDIA — PROJECT VERSION SERVICE
 * Authoritative snapshots and version control for platform projects.
 */

import { ProjectVersion } from '@/types/platform';
import { notifyStorageChange } from '@/lib/useMounted';

const STORAGE_KEY_VERSIONS = 'edc_platform_project_versions';

export class VersionService {
  static getVersions(projectId?: string): ProjectVersion[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERSIONS);
      const list: ProjectVersion[] = stored ? JSON.parse(stored) : [];
      return projectId ? list.filter((v) => v.projectId === projectId) : list;
    } catch {
      return [];
    }
  }

  static getVersionById(versionId: string): ProjectVersion | null {
    const list = this.getVersions();
    return list.find((v) => v.id === versionId) || null;
  }

  static createVersion(data: {
    projectId: string;
    workspaceId: string;
    content: any;
    createdBy?: string;
    changeReason?: string;
    changeSummary?: string;
    status?: 'DRAFT' | 'PREVIEW' | 'PUBLISHED';
  }): ProjectVersion {
    const existing = this.getVersions(data.projectId);
    const versionNumber = existing.length + 1;

    const newVer: ProjectVersion = {
      id: `ver_${data.projectId}_${versionNumber}_${Date.now().toString(36)}`,
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      versionNumber,
      status: data.status || 'DRAFT',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'User',
      changeReason: data.changeReason || 'Direct Edit',
      changeSummary: data.changeSummary || `Version ${versionNumber} snapshot`,
      content: data.content,
      publishedAt: data.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_VERSIONS);
        const list: ProjectVersion[] = stored ? JSON.parse(stored) : [];
        list.unshift(newVer);
        localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(list));
        notifyStorageChange();
      } catch (e) {
        console.error('Failed to create version', e);
      }
    }

    return newVer;
  }
}
