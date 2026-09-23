/**
 * EDC Media Landing Engine™ - Page Repository Abstraction
 * Decouples the UI from localStorage and provides a unified interface
 * for Drafts, Published Versions, Workspaces, and Publishing lifecycle.
 * Backward-compatible with client-side demo persistence while preparing
 * for multi-tenant SaaS cloud persistence.
 */

import {
  LandingPage,
  PageVersion,
  LandingPageVersion,
} from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';

export interface PageRepositoryInterface {
  getPage(id: string): Promise<LandingPage | null>;
  createPage(page: LandingPage): Promise<LandingPage>;
  updateDraft(page: LandingPage): Promise<LandingPage>;
  getPublishedVersion(pageId: string): Promise<PageVersion | LandingPageVersion | null>;
  publish(
    page: LandingPage,
    slug: string,
    version?: PageVersion
  ): Promise<{ success: boolean; publicSlug: string; publishedAt: string; error?: string }>;
  unpublish(pageId: string): Promise<{ success: boolean; unpublishedAt: string; error?: string }>;
  listWorkspacePages(workspaceId?: string): Promise<LandingPage[]>;
  duplicatePage(id: string): Promise<LandingPage | null>;
  deletePage(id: string): Promise<boolean>;
}

export class ClientPageRepository implements PageRepositoryInterface {
  async getPage(id: string): Promise<LandingPage | null> {
    return pageStorage.getPageById(id);
  }

  async createPage(page: LandingPage): Promise<LandingPage> {
    pageStorage.savePage(page);
    return page;
  }

  async updateDraft(page: LandingPage): Promise<LandingPage> {
    const updated = {
      ...page,
      updatedAt: new Date().toISOString(),
    };
    pageStorage.savePage(updated);
    return updated;
  }

  async getPublishedVersion(pageId: string): Promise<PageVersion | null> {
    const versions = pageStorage.getVersions(pageId);
    const page = pageStorage.getPageById(pageId);
    if (!page || !page.publishedVersionId) return null;
    return versions.find((v) => v.id === page.publishedVersionId) || null;
  }

  async publish(
    page: LandingPage,
    slug: string,
    version?: PageVersion
  ): Promise<{ success: boolean; publicSlug: string; publishedAt: string; error?: string }> {
    try {
      // 1. Snapshot version if not provided
      const versions = pageStorage.getVersions(page.id);
      const targetVersion =
        version ||
        versions[0] ||
        pageStorage.createVersionSnapshot(page, 'Publish Snapshot', 'Snapshot for live deployment');

      // 2. Call server publishing endpoint to update server state and slug index
      const res = await fetch('/api/landing-engine/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          version: targetVersion,
          publicSlug: slug,
          workspaceId: page.workspaceId || 'workspace_edc_default',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          publicSlug: slug,
          publishedAt: '',
          error: data.error || 'Server publishing failed.',
        };
      }

      // 3. Persist published status in client storage
      pageStorage.publishPage(page, targetVersion, slug);

      return {
        success: true,
        publicSlug: data.publicSlug || slug,
        publishedAt: data.publishedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        publicSlug: slug,
        publishedAt: '',
        error: err.message || 'Network error while publishing.',
      };
    }
  }

  async unpublish(
    pageId: string
  ): Promise<{ success: boolean; unpublishedAt: string; error?: string }> {
    try {
      const res = await fetch('/api/landing-engine/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          unpublishedAt: '',
          error: data.error || 'Server unpublishing failed.',
        };
      }

      pageStorage.unpublishPage(pageId);
      return {
        success: true,
        unpublishedAt: data.unpublishedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        unpublishedAt: '',
        error: err.message || 'Network error while unpublishing.',
      };
    }
  }

  async listWorkspacePages(workspaceId?: string): Promise<LandingPage[]> {
    const pages = pageStorage.getAllPages();
    if (workspaceId) {
      return pages.filter((p) => (p.workspaceId || 'workspace_edc_default') === workspaceId);
    }
    return pages;
  }

  async duplicatePage(id: string): Promise<LandingPage | null> {
    return pageStorage.duplicatePage(id);
  }

  async deletePage(id: string): Promise<boolean> {
    pageStorage.deletePage(id);
    return true;
  }
}

export const pageRepository = new ClientPageRepository();
