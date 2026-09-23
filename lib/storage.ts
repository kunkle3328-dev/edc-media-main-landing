import {
  LandingPage,
  CapturedLead,
  PageVersion,
  ConversionAnalysis,
  OptimizationRun,
  LeadStatus,
  AnalyticsEvent,
} from '@/types/landing-engine';
import { notifyStorageChange } from '@/lib/useMounted';
import { computePageFingerprint } from '@/lib/conversion-intelligence';

/**
 * EDC MEDIA — UNIVERSAL STORAGE INTERFACE (USI)
 * Phase 15: Separate interface from implementation to support multi-provider sync.
 */
export interface StorageProvider {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

// Default provider is localStorage in browser, no-op on server
const browserProvider: StorageProvider = {
  getItem: (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key, val) => (typeof window !== 'undefined' ? localStorage.setItem(key, val) : undefined),
  removeItem: (key) => (typeof window !== 'undefined' ? localStorage.removeItem(key) : undefined),
};

const STORAGE_KEYS = {
  PAGES: 'edc_landing_engine_pages',
  CURRENT_ID: 'edc_landing_engine_active_id',
  LEADS: 'edc_landing_engine_leads',
  VERSIONS: 'edc_landing_engine_versions',
  ANALYSIS_CACHE: 'edc_landing_engine_analysis_cache',
  OPTIMIZATION_RUNS: 'edc_landing_engine_opt_runs',
  ANALYTICS_EVENTS: 'edc_landing_engine_analytics_events',
};

// In-Memory Read-Cache to eliminate redundant JSON.parse CPU blocking during rapid re-renders
let cachedPages: LandingPage[] | null = null;
let cachedLeads: CapturedLead[] | null = null;
let cachedActivePageId: string | null = null;
let cachedAnalyticsEvents: AnalyticsEvent[] | null = null;
let cachedOptimizationRuns: OptimizationRun[] | null = null;
const cachedVersions: Record<string, PageVersion[]> = {};
const cachedAnalysis: Record<string, ConversionAnalysis> = {};

// Asynchronous Persistence Queue for non-blocking IO
const writeQueue: Record<string, { timeout: any; data: any }> = {};

export function queuePersist(key: string, data: any): void {
  if (typeof window === 'undefined') return;

  if (writeQueue[key]) {
    if (writeQueue[key].timeout) {
      clearTimeout(writeQueue[key].timeout);
    }
  } else {
    writeQueue[key] = { timeout: null, data: null };
  }

  writeQueue[key].data = data;
  writeQueue[key].timeout = setTimeout(() => {
    try {
      const serialized = JSON.stringify(writeQueue[key].data);
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.error(`[EDC Storage Queue] Failed to persist key "${key}" asynchronously:`, err);
    } finally {
      writeQueue[key].timeout = null;
    }
  }, 200); // 200ms coalesce window to group rapid sequential writes
}

export function flushStorageQueue(): void {
  if (typeof window === 'undefined') return;
  for (const key of Object.keys(writeQueue)) {
    const item = writeQueue[key];
    if (item.timeout) {
      clearTimeout(item.timeout);
      item.timeout = null;
      try {
        localStorage.setItem(key, JSON.stringify(item.data));
      } catch (err) {
        console.error(`[EDC Storage Queue] Failed to flush key "${key}" synchronously:`, err);
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.PAGES) cachedPages = null;
    if (e.key === STORAGE_KEYS.LEADS) cachedLeads = null;
    if (e.key === STORAGE_KEYS.CURRENT_ID) cachedActivePageId = null;
    if (e.key === STORAGE_KEYS.ANALYTICS_EVENTS) cachedAnalyticsEvents = null;
    if (e.key === STORAGE_KEYS.OPTIMIZATION_RUNS) cachedOptimizationRuns = null;
    if (e.key && e.key.startsWith(STORAGE_KEYS.VERSIONS)) {
      const pageId = e.key.replace(`${STORAGE_KEYS.VERSIONS}_`, '');
      delete cachedVersions[pageId];
    }
  });

  window.addEventListener('edc_storage_updated', () => {
    // Dispatch local sync
  });

  // Ensure all dirty data is flushed on shutdown
  window.addEventListener('beforeunload', flushStorageQueue);
  window.addEventListener('pagehide', flushStorageQueue);
}

export const pageStorage = {
  provider: browserProvider,

  getAllPages(): LandingPage[] {
    if (cachedPages) return cachedPages;
    try {
      const data = this.provider.getItem(STORAGE_KEYS.PAGES);
      cachedPages = data ? JSON.parse(data) : [];
      return cachedPages || [];
    } catch (e) {
      console.error('Failed to load landing pages from storage', e);
      cachedPages = [];
      return [];
    }
  },

  getPageById(id: string): LandingPage | null {
    const pages = this.getAllPages();
    return pages.find((p) => p.id === id) || null;
  },

  getPage(id: string): LandingPage | null {
    return this.getPageById(id);
  },

  getActivePageId(): string | null {
    if (cachedActivePageId) return cachedActivePageId;
    try {
      cachedActivePageId = this.provider.getItem(STORAGE_KEYS.CURRENT_ID);
      return cachedActivePageId;
    } catch {
      return null;
    }
  },

  setActivePageId(id: string): void {
    cachedActivePageId = id;
    queuePersist(STORAGE_KEYS.CURRENT_ID, id);
    notifyStorageChange();
  },

  savePage(page: LandingPage): void {
    try {
      const pages = [...this.getAllPages()];
      const existingIdx = pages.findIndex((p) => p.id === page.id);
      const updatedPage = { ...page, updatedAt: new Date().toISOString() };
      
      if (existingIdx >= 0) {
        pages[existingIdx] = updatedPage;
      } else {
        pages.unshift(updatedPage);
      }
      
      cachedPages = pages;
      cachedActivePageId = page.id;
      
      queuePersist(STORAGE_KEYS.PAGES, pages);
      queuePersist(STORAGE_KEYS.CURRENT_ID, page.id);
      
      notifyStorageChange();
    } catch (e) {
      console.error('Failed to save landing page', e);
    }
  },

  deletePage(id: string): void {
    try {
      const pages = this.getAllPages().filter((p) => p.id !== id);
      cachedPages = pages;
      queuePersist(STORAGE_KEYS.PAGES, pages);
      
      if (this.getActivePageId() === id) {
        cachedActivePageId = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_ID);
        }
      }
      notifyStorageChange();
    } catch (e) {
      console.error('Failed to delete landing page', e);
    }
  },

  duplicatePage(id: string): LandingPage | null {
    const original = this.getPageById(id);
    if (!original) return null;

    const cloned: LandingPage = {
      ...original,
      id: 'page_' + Math.random().toString(36).substring(2, 9),
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.savePage(cloned);
    return cloned;
  },

  // Leads storage with pipeline support
  saveLead(leadInput: Partial<CapturedLead> & { businessName?: string; data?: Record<string, string> }): CapturedLead {
    const rawData = leadInput.data || {};
    const name = leadInput.name || rawData.fullName || rawData.name || 'Anonymous Visitor';
    const email = leadInput.email || rawData.email || '';
    const phone = leadInput.phone || rawData.phone || '';
    const message = leadInput.message || rawData.notes || rawData.message || '';
    const pageId = leadInput.landingPageId || leadInput.pageId || '';

    const newLead: CapturedLead = {
      id: leadInput.id || 'lead_' + Math.random().toString(36).substring(2, 9),
      landingPageId: pageId,
      pageId: pageId,
      workspaceId: leadInput.workspaceId || 'workspace_edc_default',
      businessName: leadInput.businessName || 'EDC Media Asset',
      createdAt: leadInput.createdAt || new Date().toISOString(),
      name,
      email,
      phone,
      message,
      data: {
        fullName: name,
        email,
        phone,
        notes: message,
        ...rawData,
      },
      source: leadInput.source || 'direct',
      medium: leadInput.medium,
      campaign: leadInput.campaign,
      content: leadInput.content,
      term: leadInput.term,
      landingPageVersionId: leadInput.landingPageVersionId,
      firstTouchTimestamp: leadInput.firstTouchTimestamp || new Date().toISOString(),
      ctaSource: leadInput.ctaSource || 'lead_capture',
      status: (leadInput.status as LeadStatus) || 'NEW',
      notes: leadInput.notes || '',
      notesHistory: leadInput.notesHistory || [],
      statusHistory: leadInput.statusHistory || [
        {
          from: 'NEW',
          to: 'NEW',
          timestamp: new Date().toISOString(),
          note: 'Lead captured via landing page form',
        },
      ],
      consentMetadata: leadInput.consentMetadata,
    };

    try {
      const leads = [...this.getLeads()];
      leads.unshift(newLead);
      if (leads.length > 2000) leads.pop();
      cachedLeads = leads;
      queuePersist(STORAGE_KEYS.LEADS, leads);
      notifyStorageChange();
    } catch (e) {
      console.error('Failed to save lead', e);
    }
    return newLead;
  },

  getLeads(pageId?: string): CapturedLead[] {
    if (cachedLeads) {
      if (pageId) {
        return cachedLeads.filter((l) => l.landingPageId === pageId || l.pageId === pageId);
      }
      return cachedLeads;
    }
    try {
      const stored = this.provider.getItem(STORAGE_KEYS.LEADS);
      cachedLeads = stored ? JSON.parse(stored) : [];
      const leads = cachedLeads || [];
      if (pageId) {
        return leads.filter((l) => l.landingPageId === pageId || l.pageId === pageId);
      }
      return leads;
    } catch {
      cachedLeads = [];
      return [];
    }
  },

  getAllLeads(): CapturedLead[] {
    return this.getLeads();
  },

  getLeadsForPage(pageId: string): CapturedLead[] {
    return this.getLeads(pageId);
  },

  updateLeadStatus(leadId: string, newStatus: LeadStatus, note?: string): CapturedLead | null {
    try {
      const leads = [...this.getLeads()];
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return null;

      const previousStatus = lead.status;
      lead.status = newStatus;
      if (!lead.statusHistory) lead.statusHistory = [];
      lead.statusHistory.unshift({
        from: previousStatus,
        to: newStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status changed from ${previousStatus} to ${newStatus}`,
      });

      cachedLeads = leads;
      queuePersist(STORAGE_KEYS.LEADS, leads);
      notifyStorageChange();
      return lead;
    } catch (e) {
      console.error('Failed to update lead status', e);
      return null;
    }
  },

  addLeadNote(leadId: string, text: string, author: string = 'User'): CapturedLead | null {
    try {
      const leads = [...this.getLeads()];
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return null;

      if (!lead.notesHistory) lead.notesHistory = [];
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        author,
      };
      lead.notesHistory.unshift(newNote);
      lead.notes = text.trim();

      cachedLeads = leads;
      queuePersist(STORAGE_KEYS.LEADS, leads);
      notifyStorageChange();
      return lead;
    } catch (e) {
      console.error('Failed to add note to lead', e);
      return null;
    }
  },

  deleteLead(leadId: string): boolean {
    try {
      const leads = this.getLeads().filter((l) => l.id !== leadId);
      cachedLeads = leads;
      queuePersist(STORAGE_KEYS.LEADS, leads);
      notifyStorageChange();
      return true;
    } catch {
      return false;
    }
  },

  clearAllLeads(): void {
    try {
      cachedLeads = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.LEADS);
      }
      notifyStorageChange();
    } catch (e) {
      console.error('Failed to clear leads', e);
    }
  },

  // ==========================================
  // PUBLISHING & UNPUBLISHING
  // ==========================================
  publishPage(
    page: LandingPage,
    version: PageVersion,
    publicSlug: string
  ): { updatedPage: LandingPage; updatedVersion: PageVersion } {
    const publishedAt = new Date().toISOString();
    const updatedVersion: PageVersion = {
      ...version,
      isPublished: true,
      publishedAt,
      content: JSON.parse(JSON.stringify(page)),
      snapshot: JSON.parse(JSON.stringify(page)),
    };
    this.saveVersion(updatedVersion);

    const updatedPage: LandingPage = {
      ...page,
      status: 'published',
      publishedVersionId: updatedVersion.id,
      publishedAt,
      publicSlug: publicSlug.toLowerCase().trim(),
      updatedAt: publishedAt,
    };
    this.savePage(updatedPage);

    return { updatedPage, updatedVersion };
  },

  unpublishPage(pageId: string): LandingPage | null {
    const page = this.getPage(pageId);
    if (!page) return null;

    const unpublishedAt = new Date().toISOString();
    const updatedPage: LandingPage = {
      ...page,
      status: 'unpublished',
      unpublishedAt,
      updatedAt: unpublishedAt,
    };
    this.savePage(updatedPage);

    const versions = this.getVersions(pageId);
    const updatedVersions = versions.map((v) =>
      v.id === page.publishedVersionId ? { ...v, isPublished: false } : v
    );
    cachedVersions[pageId] = updatedVersions;
    queuePersist(`${STORAGE_KEYS.VERSIONS}_${pageId}`, updatedVersions);
    notifyStorageChange();

    return updatedPage;
  },

  // ==========================================
  // CONVERSION ANALYTICS INGESTION & RETRIEVAL
  // ==========================================
  recordAnalyticsEvent(event: AnalyticsEvent): void {
    try {
      const events = [...this.getAnalyticsEvents()];
      events.push(event);
      if (events.length > 10000) events.splice(0, 1000);
      cachedAnalyticsEvents = events;
      queuePersist(STORAGE_KEYS.ANALYTICS_EVENTS, events);
    } catch (e) {
      console.error('Failed to store analytics event', e);
    }
  },

  getAnalyticsEvents(pageId?: string): AnalyticsEvent[] {
    if (cachedAnalyticsEvents) {
      if (pageId) {
        return cachedAnalyticsEvents.filter((e) => e.landingPageId === pageId);
      }
      return cachedAnalyticsEvents;
    }
    try {
      const stored = this.provider.getItem(STORAGE_KEYS.ANALYTICS_EVENTS);
      cachedAnalyticsEvents = stored ? JSON.parse(stored) : [];
      const events = cachedAnalyticsEvents || [];
      if (pageId) {
        return events.filter((e) => e.landingPageId === pageId);
      }
      return events;
    } catch {
      cachedAnalyticsEvents = [];
      return [];
    }
  },

  // ==========================================
  // PAGE VERSION HISTORY
  // ==========================================
  getVersions(pageId: string): PageVersion[] {
    if (cachedVersions[pageId]) return cachedVersions[pageId];
    try {
      const stored = this.provider.getItem(`${STORAGE_KEYS.VERSIONS}_${pageId}`);
      if (stored) {
        cachedVersions[pageId] = JSON.parse(stored);
        return cachedVersions[pageId];
      }
      return [];
    } catch {
      cachedVersions[pageId] = [];
      return [];
    }
  },

  saveVersion(version: PageVersion): void {
    try {
      const versions = [...this.getVersions(version.pageId)];
      const existingIdx = versions.findIndex((v) => v.id === version.id);
      if (existingIdx >= 0) {
        versions[existingIdx] = version;
      } else {
        versions.unshift(version);
      }
      if (versions.length > 20) versions.pop();
      cachedVersions[version.pageId] = versions;
      queuePersist(`${STORAGE_KEYS.VERSIONS}_${version.pageId}`, versions);
      notifyStorageChange();
    } catch (e) {
      console.error('Failed to save page version', e);
    }
  },

  createVersionSnapshot(
    page: LandingPage,
    changeReason: string,
    changeSummary: string
  ): PageVersion {
    const versions = this.getVersions(page.id);
    const versionNumber = versions.length + 1;
    const newVersion: PageVersion = {
      id: `v_${page.id}_${versionNumber}_${Math.random().toString(36).substring(2, 7)}`,
      pageId: page.id,
      workspaceId: page.workspaceId || 'workspace_edc_default',
      versionNumber,
      createdAt: new Date().toISOString(),
      changeReason,
      changeSummary,
      conversionScore: page.conversionScore?.overallScore || 85,
      mobileScore: page.conversionScore?.metrics?.find((m) => m.name.toLowerCase().includes('mobile'))?.score || 88,
      snapshot: JSON.parse(JSON.stringify(page)),
      content: JSON.parse(JSON.stringify(page)),
      isPublished: page.publishedVersionId ? page.publishedVersionId.includes(`_${versionNumber}_`) : false,
    };

    this.saveVersion(newVersion);
    return newVersion;
  },

  restoreVersion(pageId: string, versionId: string): LandingPage | null {
    const versions = this.getVersions(pageId);
    const target = versions.find((v) => v.id === versionId);
    if (!target) return null;

    const restoredPage: LandingPage = {
      ...JSON.parse(JSON.stringify(target.snapshot)),
      updatedAt: new Date().toISOString(),
    };

    this.savePage(restoredPage);

    this.createVersionSnapshot(
      restoredPage,
      `Restored Version 0${target.versionNumber}`,
      `Rolled back to state from ${new Date(target.createdAt).toLocaleDateString()}: ${target.changeSummary}`
    );

    return restoredPage;
  },

  // ==========================================
  // CONVERSION ANALYSIS CACHING & FINGERPRINT
  // ==========================================
  computeFingerprint(page: LandingPage): string {
    return computePageFingerprint(page);
  },

  getAnalysisCache(pageId: string, fingerprint: string): ConversionAnalysis | null {
    if (cachedAnalysis[pageId] && cachedAnalysis[pageId].inputFingerprint === fingerprint) {
      return cachedAnalysis[pageId];
    }
    try {
      const stored = this.provider.getItem(`${STORAGE_KEYS.ANALYSIS_CACHE}_${pageId}`);
      if (!stored) return null;
      const analysis: ConversionAnalysis = JSON.parse(stored);
      if (analysis.inputFingerprint === fingerprint) {
        cachedAnalysis[pageId] = analysis;
        return analysis;
      }
      return null;
    } catch {
      return null;
    }
  },

  saveAnalysisCache(analysis: ConversionAnalysis): void {
    try {
      cachedAnalysis[analysis.pageId] = analysis;
      queuePersist(`${STORAGE_KEYS.ANALYSIS_CACHE}_${analysis.pageId}`, analysis);
    } catch (e) {
      console.error('Failed to cache analysis', e);
    }
  },

  // ==========================================
  // OPTIMIZATION RUNS
  // ==========================================
  saveOptimizationRun(run: OptimizationRun): void {
    try {
      if (!cachedOptimizationRuns) {
        const stored = this.provider.getItem(STORAGE_KEYS.OPTIMIZATION_RUNS);
        cachedOptimizationRuns = stored ? JSON.parse(stored) : [];
      }
      const runs = [...(cachedOptimizationRuns || [])];
      const idx = runs.findIndex((r) => r.id === run.id);
      if (idx >= 0) {
        runs[idx] = run;
      } else {
        runs.unshift(run);
      }
      if (runs.length > 20) runs.pop();
      cachedOptimizationRuns = runs;
      queuePersist(STORAGE_KEYS.OPTIMIZATION_RUNS, runs);
    } catch (e) {
      console.error('Failed to save optimization run', e);
    }
  },

  getOptimizationRun(runId: string): OptimizationRun | null {
    try {
      if (!cachedOptimizationRuns) {
        const stored = this.provider.getItem(STORAGE_KEYS.OPTIMIZATION_RUNS);
        cachedOptimizationRuns = stored ? JSON.parse(stored) : [];
      }
      return (cachedOptimizationRuns || []).find((r) => r.id === runId) || null;
    } catch {
      return null;
    }
  },
};
