import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { EDC_DOMAINS, normalizeHostname } from './lib/domain-config';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const normalizedHost = normalizeHostname(hostname);
  
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/static') || url.pathname.startsWith('/site') ||
    url.pathname.startsWith('/p/')
  ) {
    return NextResponse.next();
  }

  if (normalizedHost === EDC_DOMAINS.corporate || normalizedHost === `www.${EDC_DOMAINS.corporate}`) {
    return NextResponse.next();
  }

  if (normalizedHost === EDC_DOMAINS.platform || normalizedHost === `www.${EDC_DOMAINS.platform}`) {
    return NextResponse.next();
  }

  if (normalizedHost === 'localhost' || normalizedHost.includes('127.0.0.1') || normalizedHost.includes('.run.app')) {
     return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/site/${normalizedHost}${url.pathname}`, req.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
