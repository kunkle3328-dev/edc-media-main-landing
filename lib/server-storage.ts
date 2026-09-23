/**
 * EDC MEDIA — SERVER STORAGE
 * 
 * PRODUCTION LIMITATIONS DOCUMENTATION:
 * This module uses an in-memory database backed by a local \`.data/edc_engine_data.json\` file.
 * DO NOT pretend this filesystem persistence is a production-ready database.
 * 
 * In serverless environments (e.g. Vercel, Cloud Run without persistent volumes),
 * this storage is ephemeral. Modifications (such as published pages or new leads) will be lost
 * when the container restarts or spins down.
 * 
 * For a true production deployment, this layer MUST be replaced with a real database
 * (e.g. PostgreSQL, Supabase, or Firestore). As per architectural guidelines, we are maintaining
 * this current architecture for development/sandbox while explicitly documenting its limitations.
 */
import fs from 'fs';
import path from 'path';
import {
  LandingPage,
  LandingPageVersion,
  CapturedLead,
  AnalyticsEvent,
  LeadStatus,
} from '@/types/landing-engine';
import { UniversalProject, ProjectVersion, Workspace, DomainConnection } from '@/types/platform';
import { LUMINA_DENTAL_PAGE, LUMINA_DENTAL_VERSION } from '@/lib/seed-pages';

const DATA_DIR = path.join(process.cwd(), '.data');

interface ServerStorageSchema {
  workspaces: Record<string, Workspace>;
  domainConnections: Record<string, DomainConnection>; // id -> DomainConnection
  domainIndex: Record<string, string>; // hostname (e.g., custom.com, or slug) -> domainConnectionId
  
  projects: Record<string, UniversalProject>; // All server-known projects
  projectVersions: Record<string, ProjectVersion>; // All server-known versions
  
  // Legacy / Hybrid Support
  publishedPages: Record<string, { page: LandingPage; publishedVersion: LandingPageVersion }>;
  slugIndex: Record<string, string>; // legacy slug -> pageId
  leads: CapturedLead[];
  events: AnalyticsEvent[];
}

const memoryStore: ServerStorageSchema = {
  workspaces: {},
  domainConnections: {},
  domainIndex: {},
  projects: {},
  projectVersions: {},
  publishedPages: {},
  slugIndex: {},
  leads: [],
  events: [],
};

let isInitialized = false;

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore in read-only sandbox environments
  }
}

function loadFromFile() {
  if (isInitialized) return;
  isInitialized = true;
  try {
    ensureDataDirectory();
    const filePath = path.join(DATA_DIR, 'edc_engine_data.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (data.workspaces) memoryStore.workspaces = data.workspaces;
      if (data.domainConnections) memoryStore.domainConnections = data.domainConnections;
      if (data.domainIndex) memoryStore.domainIndex = data.domainIndex;
      if (data.projects) memoryStore.projects = data.projects;
      if (data.projectVersions) memoryStore.projectVersions = data.projectVersions;
      if (data.publishedPages) memoryStore.publishedPages = data.publishedPages;
      if (data.slugIndex) memoryStore.slugIndex = data.slugIndex;
      if (data.leads) memoryStore.leads = data.leads;
      if (data.events) memoryStore.events = data.events;
    }
    
    // Ensure production seed page
    if (!memoryStore.slugIndex['lumina-modern-dental-implants-tybo0'] || !memoryStore.publishedPages['page_cttybo0']) {
      memoryStore.publishedPages['page_cttybo0'] = {
        page: LUMINA_DENTAL_PAGE,
        publishedVersion: LUMINA_DENTAL_VERSION,
      };
      memoryStore.slugIndex['lumina-modern-dental-implants-tybo0'] = 'page_cttybo0';
      persistToFile();
    }
  } catch (err) {
    console.warn('Server storage file load warning (using in-memory store):', err);
    if (!memoryStore.slugIndex['lumina-modern-dental-implants-tybo0']) {
      memoryStore.publishedPages['page_cttybo0'] = {
        page: LUMINA_DENTAL_PAGE,
        publishedVersion: LUMINA_DENTAL_VERSION,
      };
      memoryStore.slugIndex['lumina-modern-dental-implants-tybo0'] = 'page_cttybo0';
    }
  }
}

function persistToFile() {
  try {
    ensureDataDirectory();
    const filePath = path.join(DATA_DIR, 'edc_engine_data.json');
    fs.writeFileSync(filePath, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // In read-only serverless filesystems, in-memory store continues safely
  }
}

export const serverStorage = {
  // WORKSPACES
  saveWorkspace(workspace: Workspace) {
    loadFromFile();
    memoryStore.workspaces[workspace.id] = workspace;
    persistToFile();
  },
  getWorkspace(id: string) {
    loadFromFile();
    return memoryStore.workspaces[id] || null;
  },
  
  // DOMAINS
  saveDomainConnection(conn: DomainConnection) {
    loadFromFile();
    memoryStore.domainConnections[conn.id] = conn;
    // Map normalized host to connection ID
    memoryStore.domainIndex[conn.domain.toLowerCase()] = conn.id;
    persistToFile();
  },
  getDomainConnection(hostname: string): DomainConnection | null {
    loadFromFile();
    const connId = memoryStore.domainIndex[hostname.toLowerCase()];
    if (!connId) return null;
    return memoryStore.domainConnections[connId] || null;
  },
  checkSlugAvailability(slug: string): boolean {
    loadFromFile();
    // In our architecture, the free subdomain slug acts as a hostname prefix.
    const exists = Object.values(memoryStore.workspaces).some(w => w.slug === slug);
    return !exists;
  },

  // PROJECTS & VERSIONS
  saveProject(project: UniversalProject) {
    loadFromFile();
    memoryStore.projects[project.id] = project;
    persistToFile();
  },
  getProject(id: string): UniversalProject | null {
    loadFromFile();
    return memoryStore.projects[id] || null;
  },
  saveProjectVersion(version: ProjectVersion) {
    loadFromFile();
    memoryStore.projectVersions[version.id] = version;
    persistToFile();
  },
  getProjectVersion(id: string): ProjectVersion | null {
    loadFromFile();
    return memoryStore.projectVersions[id] || null;
  },

  // PUBLISHING (Universal Project)
  publishProject(project: UniversalProject, version: ProjectVersion): { success: boolean; error?: string } {
    loadFromFile();
    
    // Create an immutable snapshot if not already done
    const publishedAt = new Date().toISOString();
    version.status = 'PUBLISHED';
    version.publishedAt = publishedAt;
    
    project.status = 'LIVE';
    project.currentVersionId = version.id;
    project.lastPublishedAt = publishedAt;
    project.deploymentStatus = 'DEPLOYED';

    memoryStore.projectVersions[version.id] = version;
    memoryStore.projects[project.id] = project;
    
    // If it has landingPageData, also sync it to legacy so existing components don't break
    if (project.landingPageData) {
      this.publishPage(project.landingPageData, version as any, project.slug || project.id, project.workspaceId);
    }
    
    persistToFile();
    return { success: true };
  },

  // LEGACY PUBLISHING
  publishPage(
    page: LandingPage,
    version: LandingPageVersion,
    publicSlug: string,
    workspaceId: string = 'workspace_edc_default'
  ): { success: boolean; publicSlug: string; publishedAt: string; error?: string } {
    loadFromFile();
    const normalizedSlug = publicSlug.toLowerCase().trim();
    
    const existingPageId = memoryStore.slugIndex[normalizedSlug];
    if (existingPageId && existingPageId !== page.id) {
      return { success: false, publicSlug, publishedAt: '', error: 'Slug is already claimed by another landing page.' };
    }
    
    const publishedAt = new Date().toISOString();
    const publishedVersion: LandingPageVersion = {
      ...version,
      isPublished: true,
      publishedAt,
      workspaceId,
      content: JSON.parse(JSON.stringify(page)),
      snapshot: JSON.parse(JSON.stringify(page)),
    };
    
    const publishedPageRecord: LandingPage = {
      ...page,
      status: 'published',
      publishedVersionId: version.id,
      publishedAt,
      publicSlug: normalizedSlug,
      workspaceId,
      updatedAt: publishedAt,
    };
    
    memoryStore.publishedPages[page.id] = {
      page: publishedPageRecord,
      publishedVersion,
    };
    memoryStore.slugIndex[normalizedSlug] = page.id;
    persistToFile();
    return { success: true, publicSlug: normalizedSlug, publishedAt };
  },
  unpublishPage(pageId: string): { success: boolean; unpublishedAt: string; error?: string } {
    loadFromFile();
    const entry = memoryStore.publishedPages[pageId];
    if (!entry) {
      return { success: false, unpublishedAt: '', error: 'Page is not currently published.' };
    }
    
    const unpublishedAt = new Date().toISOString();
    entry.page.status = 'unpublished';
    entry.page.unpublishedAt = unpublishedAt;
    entry.publishedVersion.isPublished = false;
    
    if (entry.page.publicSlug && memoryStore.slugIndex[entry.page.publicSlug] === pageId) {
      delete memoryStore.slugIndex[entry.page.publicSlug];
    }
    
    if (memoryStore.projects[pageId]) {
      memoryStore.projects[pageId].status = 'DRAFT';
      memoryStore.projects[pageId].deploymentStatus = 'NOT_CONFIGURED';
    }
    
    persistToFile();
    return { success: true, unpublishedAt };
  },
  getPublishedPageBySlug(slug: string): { page: LandingPage; publishedVersion: LandingPageVersion; version: LandingPageVersion } | null {
    loadFromFile();
    const normalized = slug.toLowerCase().trim();
    const pageId = memoryStore.slugIndex[normalized];
    if (!pageId) return null;
    const entry = memoryStore.publishedPages[pageId];
    if (!entry || entry.page.status !== 'published') return null;
    return {
      page: entry.page,
      publishedVersion: entry.publishedVersion,
      version: entry.publishedVersion,
    };
  },
  getPublishedPageById(pageId: string): { page: LandingPage; publishedVersion: LandingPageVersion; version: LandingPageVersion } | null {
    loadFromFile();
    const entry = memoryStore.publishedPages[pageId];
    if (!entry) return null;
    return {
      page: entry.page,
      publishedVersion: entry.publishedVersion,
      version: entry.publishedVersion,
    };
  },
  
  // LEADS
  saveLead(lead: CapturedLead): CapturedLead {
    loadFromFile();
    const existingRecent = memoryStore.leads.find(
      (l) =>
        l.landingPageId === lead.landingPageId &&
        l.email.toLowerCase() === lead.email.toLowerCase() &&
        Math.abs(new Date(lead.createdAt).getTime() - new Date(l.createdAt).getTime()) < 30000
    );
    if (existingRecent) return existingRecent;
    memoryStore.leads.unshift(lead);
    if (memoryStore.leads.length > 5000) memoryStore.leads.pop();
    persistToFile();
    return lead;
  },
  getLeads(pageId?: string, workspaceId?: string): CapturedLead[] {
    loadFromFile();
    let leads = memoryStore.leads;
    if (workspaceId) leads = leads.filter((l) => l.workspaceId === workspaceId);
    if (pageId) leads = leads.filter((l) => l.landingPageId === pageId || l.pageId === pageId);
    return leads;
  },
  updateLeadStatus(leadId: string, status: LeadStatus, note?: string): CapturedLead | null {
    loadFromFile();
    const lead = memoryStore.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const oldStatus = lead.status;
    lead.status = status;
    if (!lead.statusHistory) lead.statusHistory = [];
    lead.statusHistory.unshift({
      from: oldStatus,
      to: status,
      timestamp: new Date().toISOString(),
      note,
    });
    persistToFile();
    return lead;
  },
  addLeadNote(leadId: string, text: string, author: string = 'User'): CapturedLead | null {
    loadFromFile();
    const lead = memoryStore.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    if (!lead.notesHistory) lead.notesHistory = [];
    lead.notesHistory.unshift({
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      author,
    });
    lead.notes = text.trim();
    persistToFile();
    return lead;
  },
  
  // ANALYTICS
  recordEvent(event: AnalyticsEvent): AnalyticsEvent {
    loadFromFile();
    memoryStore.events.push(event);
    if (memoryStore.events.length > 50000) memoryStore.events.splice(0, 5000);
    persistToFile();
    return event;
  },
  getEvents(pageId?: string, workspaceId?: string): AnalyticsEvent[] {
    loadFromFile();
    let events = memoryStore.events;
    if (workspaceId) events = events.filter((e) => e.workspaceId === workspaceId);
    if (pageId) events = events.filter((e) => e.landingPageId === pageId);
    return events;
  },
};
