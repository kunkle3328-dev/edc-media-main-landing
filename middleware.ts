import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { EDC_DOMAINS, normalizeHostname } from './lib/domain-config';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const normalizedHost = normalizeHostname(hostname);
  
  // Static/Internal routes: bypass
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/preview/')
  ) {
    return NextResponse.next();
  }

  // Case A/B: Corporate site
  if (normalizedHost === EDC_DOMAINS.corporate || normalizedHost === `www.${EDC_DOMAINS.corporate}`) {
    return NextResponse.next();
  }

  // Case C/D: Platform app
  if (normalizedHost === EDC_DOMAINS.platform || normalizedHost === `www.${EDC_DOMAINS.platform}`) {
    return NextResponse.next();
  }

  // Case E: Wildcard customer subdomain
  if (normalizedHost.endsWith(`.${EDC_DOMAINS.platform}`)) {
    const slug = normalizedHost.replace(`.${EDC_DOMAINS.platform}`, '');
    // Rewrite internal route without exposing URL
    return NextResponse.rewrite(new URL(`/site/${slug}${url.pathname}`, req.url));
  }

  // Local/Dev fallbacks
  if (normalizedHost === 'localhost' || normalizedHost.includes('127.0.0.1') || normalizedHost.includes('.run.app')) {
    if (url.pathname.startsWith('/p/')) return NextResponse.next();
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
