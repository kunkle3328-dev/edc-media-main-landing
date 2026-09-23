/**
 * EDC Media Landing Engine™ - Central Domain Architecture
 * Authoritative domain configuration and generation.
 */

export const EDC_DOMAINS = {
  corporate: 'edcmediahq.xyz',
  platform: 'edcmedia.club',
};

export interface DomainVerificationResult {
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'ACTIVE' | 'FAILED' | 'NOT_CONFIGURED';
  sslStatus: 'PENDING' | 'ACTIVE' | 'ERROR' | 'NOT_CONFIGURED';
  cnameTarget: string;
  txtRecordName: string;
  txtRecordValue: string;
  message: string;
  isInfrastructureConfigured: boolean;
}

export function getAppUrl(): string {
  // Use the environment variable if present (e.g. localhost during dev)
  return process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : `https://${EDC_DOMAINS.platform}/dashboard`);
}

export function getMarketingUrl(): string {
  return process.env.NEXT_PUBLIC_MARKETING_URL || (typeof window !== 'undefined' ? window.location.origin : `https://${EDC_DOMAINS.corporate}`);
}

export function getCustomerSubdomain(slug: string): string {
  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  if (!cleanSlug) return `https://${EDC_DOMAINS.platform}`;
  
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // In production on the edcmedia.club domain, return the real customer subdomain
    if (host === EDC_DOMAINS.platform || host.endsWith(`.${EDC_DOMAINS.platform}`)) {
      return `https://${cleanSlug}.${EDC_DOMAINS.platform}`;
    }
    // In any sandbox, preview, Cloud Run (*.run.app), AI Studio, or dev environment:
    // The active, working live endpoint is on the current running server at /p/[slug]
    return `${window.location.origin}/p/${cleanSlug}`;
  }
  
  // SSR fallback
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const base = process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
    return `${base}/p/${cleanSlug}`;
  }
  
  return `https://${cleanSlug}.${EDC_DOMAINS.platform}`;
}

export function getProductionSubdomain(slug: string): string {
  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  return `https://${cleanSlug}.${EDC_DOMAINS.platform}`;
}

export function getCanonicalPageUrl(slug: string, customDomain?: string | null): string {
  if (customDomain && customDomain.trim()) {
    const cleanDomain = customDomain.toLowerCase().trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .split('/')[0];
    return `https://${cleanDomain}`;
  }
  return getCustomerSubdomain(slug);
}

export function getPreviewUrl(projectIdOrPageId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/preview/${projectIdOrPageId}`;
  }
  return `/preview/${projectIdOrPageId}`;
}

/**
 * Normalizes hostnames for comparison (removes protocol, path, query, etc.)
 */
export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
}

/**
 * Provider-neutral domain verification abstraction.
 * Transparently reflects that DNS automated verification requires external Cloud DNS / CDN hookup.
 */
export function checkCustomDomainStatus(hostname: string): DomainVerificationResult {
  const cleanHost = normalizeHostname(hostname);
  
  // Explicitly truthful: In Google AI Studio preview sandbox, external DNS automation is NOT CONFIGURED
  return {
    status: 'NOT_CONFIGURED',
    sslStatus: 'NOT_CONFIGURED',
    cnameTarget: `cname.${EDC_DOMAINS.platform}`,
    txtRecordName: `_edc-verify.${cleanHost}`,
    txtRecordValue: `edc-site-verification=${Buffer.from(cleanHost).toString('base64').substring(0, 16)}`,
    message: 'DNS infrastructure not configured in current sandbox environment. Custom domains require external routing integration.',
    isInfrastructureConfigured: false,
  };
}

/**
 * Provider-neutral resolver for incoming requests.
 */
export function resolvePublishedRequest(host: string, path: string): {
  type: 'MARKETING' | 'APP' | 'EDC_HOSTED_PAGE' | 'CUSTOM_DOMAIN_PAGE' | 'PREVIEW' | 'UNKNOWN';
  slug?: string;
  projectId?: string;
} {
  const normalizedHost = normalizeHostname(host);
  const normalizedPath = path.toLowerCase();

  if (normalizedPath.startsWith('/preview/')) {
    const parts = normalizedPath.split('/');
    return { type: 'PREVIEW', projectId: parts[2] };
  }

  // Allow fallback /p/ slug routing temporarily if explicitly requested
  if (normalizedPath.startsWith('/p/')) {
    const parts = normalizedPath.split('/');
    return { type: 'EDC_HOSTED_PAGE', slug: parts[2] };
  }

  if (normalizedPath.startsWith('/dashboard') || normalizedHost === EDC_DOMAINS.platform) {
    return { type: 'APP' };
  }

  // Check if it's a customer subdomain on the platform domain
  if (normalizedHost.endsWith(`.${EDC_DOMAINS.platform}`)) {
    const slug = normalizedHost.replace(`.${EDC_DOMAINS.platform}`, '');
    return { type: 'EDC_HOSTED_PAGE', slug };
  }

  if (normalizedHost === EDC_DOMAINS.corporate) {
    return { type: 'MARKETING' };
  }

  // Assume any other host is a custom domain attempt
  // (In a real Edge middleware, you would lookup the host in your DB first)
  if (normalizedHost !== 'localhost' && !normalizedHost.includes('127.0.0.1')) {
     return { type: 'CUSTOM_DOMAIN_PAGE' };
  }
  
  return { type: 'MARKETING' };
}

