/**
 * INTERNAL / FALLBACK / COMPATIBILITY ROUTE
 * The authoritative intended public architecture is: customer.edcmedia.club
 * NOT edcmedia.club/p/customer.
 * 
 * This route is retained exclusively as an internal fallback and local preview proxy
 * mechanism since local development environments cannot easily route subdomains.
 * The canonical customer URL remains the subdomain.
 */

import type { Metadata } from 'next';
import { serverStorage } from '@/lib/server-storage';
import { PublicLandingPageView } from '@/components/PublicLandingPageView';
import Link from 'next/link';
import { Globe } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = serverStorage.getPublishedPageBySlug(slug);

  if (!entry || entry.page.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white p-6">
        <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <Globe className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Page Not Published</h2>
          <p className="text-sm text-slate-400 mb-6">
            The requested landing page URL is currently offline or unpublished.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] font-semibold text-sm rounded-xl transition-all"
          >
            Visit EDC Media Homepage
          </Link>
        </div>
      </div>
    );
  }

  const publishedContent = entry.publishedVersion.content || entry.page;

  return (
    <PublicLandingPageView
      page={publishedContent}
      publicSlug={slug}
      versionId={entry.publishedVersion.id}
    />
  );
}
