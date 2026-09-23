/**
 * EDC Landing Engine - Multi-Tenant Platform Foundation
 * Provides robust tenant, project, domain, and publishing state management.
 */

export type TenantPlan = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface Tenant {
  tenantId: string;
  ownerId: string;
  businessName: string;
  slug: string;
  status: TenantStatus;
  plan: TenantPlan;
  logoUrl?: string;
  brandColor?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Project {
  projectId: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DomainType = 'EDC_SUBDOMAIN' | 'CUSTOM_DOMAIN';
export type DomainStatus = 'NOT_CONNECTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'ACTIVE' | 'FAILED' | 'REMOVED';

export interface DomainRecord {
  domainId: string;
  tenantId: string;
  projectId: string;
  hostname: string; // e.g. joes-hvac.edcmedia.club or joeshvac.com
  type: DomainType;
  status: DomainStatus;
  isPrimary: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export type PublishingState =
  | 'DRAFT'
  | 'PREVIEW'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'FAILED'
  | 'ARCHIVED';

export interface PublishingRecord {
  pageId: string;
  projectId: string;
  tenantId: string;
  version: number;
  state: PublishingState;
  contentSnapshot: any;
  publishedAt?: string;
  error?: string;
}

// Reserved platform hostnames / subdomains that cannot be claimed by customer tenants
export const RESERVED_PLATFORM_SLUGS = new Set([
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'build',
  'preview',
  'login',
  'signup',
  'auth',
  'assets',
  'static',
  'help',
  'support',
  'status',
  'edcmedia',
  'edc',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_PLATFORM_SLUGS.has(slug.toLowerCase().trim());
}

export function sanitizeTenantSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (isReservedSlug(base)) {
    return `${base}-biz`;
  }
  return base || 'tenant-business';
}

// Initial Test Tenants as requested in SPEC 31 & 32
export const INITIAL_TENANTS: Tenant[] = [
  {
    tenantId: 'tenant_edc_test',
    ownerId: 'user_edc_admin',
    businessName: 'EDC Test Business',
    slug: 'edc-test-business',
    status: 'ACTIVE',
    plan: 'PRO',
    brandColor: '#00E5FF',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    tenantId: 'tenant_apex_hvac',
    ownerId: 'user_joe_hvac',
    businessName: "Joe's HVAC & Emergency Repair",
    slug: 'apex-hvac',
    status: 'ACTIVE',
    plan: 'STARTER',
    brandColor: '#3B82F6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    projectId: 'proj_edc_test_1',
    tenantId: 'tenant_edc_test',
    name: 'EDC Test Landing Page',
    slug: 'edc-test-landing-page',
    description: 'Primary conversion-optimized landing page for EDC Test Business.',
    status: 'ACTIVE',
    publishedVersionId: 'ver_edc_test_pub_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    projectId: 'proj_apex_1',
    tenantId: 'tenant_apex_hvac',
    name: 'Summer HVAC Campaign',
    slug: 'summer-hvac-campaign',
    description: 'Emergency AC repair and tune-up landing page.',
    status: 'ACTIVE',
    publishedVersionId: 'ver_apex_pub_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_DOMAINS: DomainRecord[] = [
  {
    domainId: 'dom_edc_test',
    tenantId: 'tenant_edc_test',
    projectId: 'proj_edc_test_1',
    hostname: 'edc-test-business.edcmedia.club',
    type: 'EDC_SUBDOMAIN',
    status: 'ACTIVE',
    isPrimary: true,
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
  },
  {
    domainId: 'dom_apex',
    tenantId: 'tenant_apex_hvac',
    projectId: 'proj_apex_1',
    hostname: 'apex-hvac.edcmedia.club',
    type: 'EDC_SUBDOMAIN',
    status: 'ACTIVE',
    isPrimary: true,
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
  },
];

// Tenant platform memory/persistent store manager
export class TenantPlatformStore {
  private static tenants: Tenant[] = [...INITIAL_TENANTS];
  private static projects: Project[] = [...INITIAL_PROJECTS];
  private static domains: DomainRecord[] = [...INITIAL_DOMAINS];

  static getTenants(): Tenant[] {
    return this.tenants;
  }

  static getTenantById(tenantId: string): Tenant | null {
    return this.tenants.find((t) => t.tenantId === tenantId) || null;
  }

  static getTenantBySlug(slug: string): Tenant | null {
    return this.tenants.find((t) => t.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  static getProjectsForTenant(tenantId: string): Project[] {
    return this.projects.filter((p) => p.tenantId === tenantId);
  }

  static getProjectById(projectId: string): Project | null {
    return this.projects.find((p) => p.projectId === projectId) || null;
  }

  static getDomainsForTenant(tenantId: string): DomainRecord[] {
    return this.domains.filter((d) => d.tenantId === tenantId);
  }

  static getDomainByHostname(hostname: string): DomainRecord | null {
    const clean = hostname.toLowerCase().trim();
    return this.domains.find((d) => d.hostname.toLowerCase() === clean && d.status === 'ACTIVE') || null;
  }

  static createTenant(data: { businessName: string; ownerId?: string; plan?: TenantPlan }): Tenant {
    const baseSlug = sanitizeTenantSlug(data.businessName);
    let slug = baseSlug;
    let counter = 1;
    while (this.getTenantBySlug(slug) || isReservedSlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newTenant: Tenant = {
      tenantId: 'tenant_' + Math.random().toString(36).substring(2, 9),
      ownerId: data.ownerId || 'user_default',
      businessName: data.businessName,
      slug,
      status: 'ACTIVE',
      plan: data.plan || 'STARTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tenants.push(newTenant);

    // Create default EDC subdomain
    const defaultDomain: DomainRecord = {
      domainId: 'dom_' + Math.random().toString(36).substring(2, 9),
      tenantId: newTenant.tenantId,
      projectId: '',
      hostname: `${slug}.edcmedia.club`,
      type: 'EDC_SUBDOMAIN',
      status: 'ACTIVE',
      isPrimary: true,
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };
    this.domains.push(defaultDomain);

    return newTenant;
  }

  static createProject(data: { tenantId: string; name: string; description?: string }): Project {
    const tenant = this.getTenantById(data.tenantId);
    const baseSlug = sanitizeTenantSlug(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (this.projects.some((p) => p.tenantId === data.tenantId && p.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProj: Project = {
      projectId: 'proj_' + Math.random().toString(36).substring(2, 9),
      tenantId: data.tenantId,
      name: data.name,
      slug,
      description: data.description || `Landing page project for ${tenant?.businessName || data.name}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.push(newProj);
    return newProj;
  }

  static verifyTenantAccess(tenantId: string, requestTenantId: string): boolean {
    if (!tenantId || !requestTenantId) return false;
    return tenantId === requestTenantId;
  }
}
