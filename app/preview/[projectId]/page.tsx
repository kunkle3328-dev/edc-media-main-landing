'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectService } from '@/lib/services/project-service';
import { TenantPlatformStore } from '@/lib/tenant-platform';
import { PublicLandingPageView } from '@/components/PublicLandingPageView';
import { pageStorage } from '@/lib/storage';
import { Eye, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PreviewProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [isMounted, setIsMounted] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!projectId) return;

    // Load from universal project service
    const proj = ProjectService.getProjectById(projectId);
    setProject(proj);

    if (proj) {
      // Find tenant
      const t = TenantPlatformStore.getTenantById(proj.workspaceId || 'tenant_edc_default') ||
                TenantPlatformStore.getTenants()[0];
      setTenant(t);

      // Load draft landing page content
      const lp = pageStorage.getPage(projectId) || proj.landingPageData;
      if (lp) {
        setPageData(lp);
      } else {
        // Fallback default structure
        const defaultPage = {
          id: projectId,
          name: proj.name,
          slug: proj.slug,
          status: 'draft',
          businessProfile: {
            name: t?.businessName || proj.name,
            offer: proj.description,
            targetAudience: 'Local customers and high-intent buyers',
            primaryGoal: 'leads',
          },
          strategy: {
            businessName: t?.businessName || proj.name,
            businessType: 'Local Business / Service',
            offer: proj.description,
            targetAudience: 'In-market buyers',
            customerProblem: 'Urgent need for reliable local services',
            desiredOutcome: 'Fast professional resolution',
            primaryGoal: 'Book Consultation / Service',
            primaryCTA: { label: 'Get Free Quote', actionType: 'form' },
            secondaryCTA: { label: 'Call Us Now', actionType: 'call' },
            valueProposition: 'Guaranteed quality service delivered on schedule.',
            positioning: 'Industry leader',
            urgency: 'Limited availability this week',
            trustRequirements: ['Licensed & Insured', '5-Star Rated'],
            objectionHandling: [],
            recommendedSections: ['hero', 'services', 'social_proof', 'lead_capture'],
            recommendedTone: 'Professional & Authoritative',
            recommendedVisualDirection: 'High-contrast conversion layout',
            recommendedSEOKeywords: [proj.name.toLowerCase()],
            conversionRisks: [],
            missingInformation: [],
          },
          theme: {
            mode: 'obsidian',
            primaryAccent: t?.brandColor || '#00E5FF',
          },
          sections: [],
          seo: {
            title: `${proj.name} | Preview`,
            metaDescription: proj.description,
            keywords: [],
          },
          ctaConfig: {
            primaryText: 'Get Started',
            actionType: 'form',
          },
          leadCaptureConfig: {
            title: 'Request Your Free Quote',
            subtitle: 'Complete the form below for immediate response.',
            submitButtonText: 'Submit Inquiry',
            successHeadline: 'Request Received!',
            successMessage: 'We will be in touch shortly.',
            fields: [
              { name: 'name', label: 'Full Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
            ],
          },
          createdAt: proj.createdAt,
          updatedAt: proj.updatedAt,
        };
        setPageData(defaultPage);
      }
    }
  }, [projectId]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white">
        <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white p-6">
        <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Project Preview Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The requested project ID does not exist or has not been initialized yet.
          </p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] font-semibold text-sm rounded-xl transition-all inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E]">
      {/* Explicit Preview Mode Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-[#00E5FF]/20 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2.5 font-medium">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <span className="hidden sm:inline">
            <strong>PREVIEW MODE (Draft Version):</strong> This page has not been published to public production. Visitors continue seeing the live published version.
          </span>
          <span className="sm:hidden">
            <strong>PREVIEW (Draft):</strong> Unpublished changes.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {tenant && (
            <span className="font-mono text-xs text-slate-300 hidden md:inline">
              Tenant: {tenant.businessName}
            </span>
          )}
          <Link
            href="/dashboard"
            className="px-3 py-1 bg-white/10 hover:bg-white/25 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Render Page View */}
      <div className="flex-1">
        {pageData && (
          <PublicLandingPageView page={pageData} publicSlug={project.slug} />
        )}
      </div>
    </div>
  );
}
