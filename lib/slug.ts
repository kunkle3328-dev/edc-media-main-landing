/**
 * Slug generation and validation utility for public landing page URLs
 */

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generatePublicSlug(name: string, pageId?: string): string {
  const base = sanitizeSlug(name) || 'landing-page';
  const suffix = pageId ? pageId.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase() : Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

export function validatePublicSlug(slug: string): { isValid: boolean; error?: string } {
  if (!slug || slug.trim().length === 0) {
    return { isValid: false, error: 'Public slug cannot be empty.' };
  }
  const clean = slug.trim();
  if (clean.length < 3) {
    return { isValid: false, error: 'Public slug must be at least 3 characters.' };
  }
  if (clean.length > 64) {
    return { isValid: false, error: 'Public slug must be 64 characters or fewer.' };
  }
  const validPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!validPattern.test(clean)) {
    return {
      isValid: false,
      error: 'Slug can only contain lowercase alphanumeric characters and single hyphens (no spaces or special symbols).',
    };
  }
  return { isValid: true };
}
