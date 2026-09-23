/**
 * EDC MEDIA — OFFICIAL BRAND & DOMAIN ARCHITECTURE
 * Single source of truth for all corporate and platform URLs, domains, and brand metadata.
 * 
 * DOMAIN RESPONSIBILITY:
 * - Corporate / Main Site: https://edcmediahq.xyz (Marketing, Identity, Products, Services, Case Studies)
 * - Platform: https://edcmedia.club (Customer Platform, Workspaces, Projects, Builders, AI Tools, Billing)
 * - Customer Subdomains: https://{slug}.edcmedia.club
 * - Customer Owned Domains: https://{custom-domain}.com
 */

export interface BrandConfig {
  name: string;
  corporateDomain: string;
  platformDomain: string;
  corporateUrl: string;
  platformUrl: string;
  brandDescription: string;
  supportEmail: string;
  version: string;
  tagline: string;
}

export const EDC_BRAND: BrandConfig = {
  name: "EDC Media",
  corporateDomain: "edcmediahq.xyz",
  platformDomain: "edcmedia.club",
  corporateUrl: "https://edcmediahq.xyz",
  platformUrl: "https://edcmedia.club",
  brandDescription: "AI-powered systems for building, launching, and growing digital businesses.",
  supportEmail: "info.edcmedia@gmail.com",
  version: "Build 01 (Foundation)",
  tagline: "Autonomous Direct Response & Revenue Engineering",
};

/**
 * Resolves the absolute or relative corporate URL for a given path.
 */
export function getCorporateUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${EDC_BRAND.corporateUrl}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Resolves the absolute or relative platform URL for a given path.
 */
export function getPlatformUrl(path: string = '/dashboard'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    return cleanPath;
  }
  return `${EDC_BRAND.platformUrl}${cleanPath}`;
}

/**
 * Centralized public URL resolver for projects.
 * Follows strict authoritative rules:
 * 1. If custom domain exists & is verified & live -> return custom domain
 * 2. If project has an EDC slug & is published -> return absolute live URL (with origin in preview, or EDC subdomain in prod)
 * 3. If preview -> return preview URL
 * 4. Otherwise return null (no fake live URLs)
 */
export interface ResolvedProjectUrl {
  url: string | null;
  type: 'CUSTOM_DOMAIN' | 'EDC_SUBDOMAIN' | 'PREVIEW' | 'NOT_DEPLOYED';
  isLive: boolean;
  label: string;
}

export function resolveProjectUrl(project: {
  id?: string;
  projectId?: string;
  slug?: string;
  publicSlug?: string;
  customDomain?: string | null;
  status?: string;
  deploymentStatus?: string;
}): ResolvedProjectUrl {
  const isPublished = project.status === 'published' || project.status === 'LIVE' || project.status === 'ACTIVE';
  const slug = project.publicSlug || project.slug || '';
  const customDomain = project.customDomain?.trim();

  // Rule 1: Verified Custom Domain
  if (customDomain && isPublished) {
    const cleanDomain = customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return {
      url: `https://${cleanDomain}`,
      type: 'CUSTOM_DOMAIN',
      isLive: true,
      label: cleanDomain,
    };
  }

  // Rule 2: EDC Subdomain / Live Public Endpoint
  if (slug && isPublished) {
    const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isProd = host === EDC_BRAND.platformDomain || host.endsWith(`.${EDC_BRAND.platformDomain}`);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    // In dev/preview/Cloud Run, return the full absolute URL with origin so target="_blank" never resolves to aistudio.google.com
    const url = isProd
      ? `https://${slug}.${EDC_BRAND.platformDomain}`
      : (origin ? `${origin}/p/${slug}` : `/p/${slug}`);

    return {
      url,
      type: 'EDC_SUBDOMAIN',
      isLive: true,
      label: isProd ? `${slug}.${EDC_BRAND.platformDomain}` : `${slug} (Live)`,
    };
  }

  // Rule 3: Preview Only
  const projId = project.id || project.projectId;
  if (projId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return {
      url: origin ? `${origin}/preview/${projId}` : `/preview/${projId}`,
      type: 'PREVIEW',
      isLive: false,
      label: 'Draft Preview',
    };
  }

  return {
    url: null,
    type: 'NOT_DEPLOYED',
    isLive: false,
    label: 'Not Deployed',
  };
}
