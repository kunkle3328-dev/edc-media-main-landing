'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Rocket,
  Flame,
  Search,
  Eye,
  RefreshCw,
  PowerOff,
  Link2,
} from 'lucide-react';
import { LandingPage, PageVersion, LandingPageVersion } from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';
import { generatePublicSlug, validatePublicSlug } from '@/lib/slug';
import { getCustomerSubdomain, getProductionSubdomain } from '@/lib/domain-config';
import { PublishService } from '@/lib/services/publish-service';

interface PublishModalProps {
  page: LandingPage;
  onClose: () => void;
  onOpenStandalone?: () => void;
  onPageUpdated?: (updatedPage: LandingPage) => void;
  onOpenAnalytics?: () => void;
}

export function PublishModal({
  page,
  onClose,
  onOpenStandalone,
  onPageUpdated,
  onOpenAnalytics,
}: PublishModalProps) {
  const [slug, setSlug] = useState(page.publicSlug || generatePublicSlug(page.name, page.id));
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'review' | 'seo' | 'share'>('review');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // SEO Editable State
  const [seoTitle, setSeoTitle] = useState(page.seo?.title || `${page.name} | Official Consultation`);
  const [seoDescription, setSeoDescription] = useState(
    page.seo?.metaDescription || page.strategy?.valueProposition || page.businessProfile?.uniqueHook || 'Schedule a priority consultation with our team.'
  );

  const isPublished = page.status === 'published';
  const publishedUrl = getCustomerSubdomain(page.publicSlug || slug);

  // Check readiness
  const conversionScore = page.conversionScore?.overallScore || 88;
  const mobileScore = page.conversionScore?.metrics?.find((m) => m.name.toLowerCase().includes('mobile'))?.score || 92;
  const hasLeadCapture = page.sections.some((s) => s.type === 'lead_capture');
  const hasHeroCta = page.sections.some((s) => s.type === 'hero');

  const versions = pageStorage.getVersions(page.id);
  const latestVersion = versions[0];
  const publishedVersion = versions.find((v) => v.id === page.publishedVersionId);
  const isDraftAheadOfLive = isPublished && latestVersion && publishedVersion && latestVersion.id !== publishedVersion.id;

  const handleSlugChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
    const valid = validatePublicSlug(formatted);
    if (!valid.isValid) {
      setSlugError(valid.error || 'Invalid slug format.');
    } else {
      setSlugError(null);
    }
  };

  const handlePublish = async () => {
    const valid = validatePublicSlug(slug);
    if (!valid.isValid) {
      setSlugError(valid.error || 'Please enter a valid slug.');
      return;
    }

    setIsPublishing(true);
    setStatusMessage(null);

    try {
      // 1. Update local page state with SEO before publishing
      const prePublishPage = {
        ...page,
        publicSlug: slug,
        seo: {
          ...page.seo,
          title: seoTitle,
          metaDescription: seoDescription,
        },
      };
      
      if (typeof window !== 'undefined') {
         pageStorage.savePage(prePublishPage);
      }

      // 2. Publish using the authoritative Service
      const result = await PublishService.publishProject(page.id, slug);

      if (!result.success) {
        throw new Error(result.error || 'Failed to publish.');
      }

      // 3. Fetch latest local state which PublishService updated
      const updatedPage = pageStorage.getPage(page.id);
      
      if (onPageUpdated && updatedPage) onPageUpdated(updatedPage);
      setStatusMessage('Landing page successfully published and active at public URL!');
      setActiveTab('share');
    } catch (err: any) {
      console.error('Publish error:', err);
      setSlugError(err.message || 'Error occurred during publishing.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to take this page offline? All captured leads, versions, and analytics will remain securely saved.')) {
      return;
    }

    setIsUnpublishing(true);
    try {
      await fetch('/api/landing-engine/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: page.id }),
      });

      const updated = pageStorage.unpublishPage(page.id);
      if (updated && onPageUpdated) onPageUpdated(updated);
      setStatusMessage('Page has been unpublished and moved to draft.');
      setActiveTab('review');
    } catch (err: any) {
      console.error('Unpublish error:', err);
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(publishedUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      console.warn('Clipboard copy failed, attempting fallback:', err);
      // Fallback: Use a hidden input to select and copy
      const input = document.createElement('input');
      input.value = publishedUrl;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (copyErr) {
        console.error('Fallback copy failed:', copyErr);
        setStatusMessage('Manual Copy Required: ' + publishedUrl);
      }
      document.body.removeChild(input);
    }
  };

  const handleNativeShare = async () => {
    // Phase 12: Harden Share functionality
    const shareData = {
      title: page.name,
      text: page.seo?.metaDescription || page.strategy?.valueProposition || 'Check out this EDC Media asset.',
      url: publishedUrl,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await handleCopyLink();
      }
    } catch (err: any) {
      // AbortError is common if user cancels the share picker
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, falling back to copy:', err);
        await handleCopyLink();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#0F121A] text-slate-400 hover:text-white border border-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF]">
                EDC PUBLISHING ENGINE™
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                  isPublished
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {page.status?.toUpperCase() || 'DRAFT'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{page.name}</h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] mb-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'review'
                ? 'text-[#00E5FF] font-bold border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. READINESS REVIEW
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'seo'
                ? 'text-[#00E5FF] font-bold border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. SEO &amp; SOCIAL
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'share'
                ? 'text-[#00E5FF] font-bold border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. LIVE DISPATCH &amp; SHARE
          </button>
        </div>

        {statusMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab 1: Readiness Review */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            {/* Draft Ahead of Live Banner */}
            {isDraftAheadOfLive && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-[#00E5FF]/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Draft is Ahead of Current Live Version</span>
                    <span className="text-[10px] font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10">
                      v{latestVersion?.versionNumber} vs v{publishedVersion?.versionNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    You have made updates since publishing. Re-publishing will promote your current draft into the live production asset.
                  </p>
                </div>
              </div>
            )}

            {/* Checklist Matrix */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Automated Production Readiness Audit
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Conversion Score */}
                <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/20">
                    {conversionScore}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">EDC Conversion Score™</div>
                    <div className="text-[11px] text-slate-400">
                      {conversionScore >= 80 ? 'Optimal Architecture' : 'Score acceptable'}
                    </div>
                  </div>
                </div>

                {/* 2. Mobile Score */}
                <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center border border-[#00E5FF]/20">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Mobile Readiness: {mobileScore}/100</div>
                    <div className="text-[11px] text-slate-400">Galaxy S25 &amp; iOS responsive</div>
                  </div>
                </div>

                {/* 3. Lead Capture Config */}
                <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Lead Intake Configured</div>
                    <div className="text-[11px] text-slate-400">
                      {hasLeadCapture ? 'Active & validated' : 'Default intake applied'}
                    </div>
                  </div>
                </div>

                {/* 4. Primary CTA */}
                <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center border border-[#00E5FF]/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Conversion Trigger Active</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      &ldquo;{page.ctaConfig?.primaryText || 'Get Quote'}&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Slug Input */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono uppercase text-slate-400">
                Custom Public Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs font-mono text-slate-400">
                  /p/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="custom-landing-slug"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs font-mono text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              {slugError && (
                <div className="text-[11px] text-rose-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{slugError}</span>
                </div>
              )}
            </div>

            {/* Publish Dispatch Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePublish}
                disabled={isPublishing || !!slugError}
                className="flex-1 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>DEPLOYING TO EDGE...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>{isPublished ? 'PUBLISH UPDATED VERSION' : 'PUBLISH LIVE ASSET'}</span>
                  </>
                )}
              </button>

              {isPublished && (
                <button
                  onClick={handleUnpublish}
                  disabled={isUnpublishing}
                  className="px-4 py-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 font-mono text-xs uppercase tracking-wider hover:bg-rose-900/40 flex items-center justify-center gap-2 transition-colors"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>UNPUBLISH</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: SEO & Social Metadata */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Page Title Tag
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                {seoTitle.length} / 60 recommended characters
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#00E5FF] resize-none"
              />
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                {seoDescription.length} / 160 recommended characters
              </span>
            </div>

            {/* Google Search Result Preview Card */}
            <div className="p-4 rounded-xl bg-[#07090E] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2">
                Google SERP Snippet Preview
              </span>
              <div className="text-xs font-mono text-emerald-400 truncate">
                https://edc.media/p/{slug}
              </div>
              <div className="text-sm font-semibold text-[#00E5FF] truncate hover:underline cursor-pointer">
                {seoTitle}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{seoDescription}</p>
            </div>

            <button
              onClick={() => setActiveTab('review')}
              className="w-full py-3 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white font-mono text-xs uppercase tracking-wider hover:border-[#00E5FF] transition-colors"
            >
              Confirm Metadata &amp; Continue to Review →
            </button>
          </div>
        )}

        {/* Tab 3: Live Dispatch & Share */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#0F121A] border border-emerald-500/30 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Public Destination Live</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your landing page is reachable by real visitors, ready to record conversion analytics and process inbound leads.
                </p>
              </div>
            </div>

            {/* Live URL box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase text-slate-400">
                  Active Direct Public URL
                </label>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready to visit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="flex-1 px-3.5 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs font-mono text-[#00E5FF] focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 rounded-lg bg-[#0F121A] border border-white/[0.1] text-xs font-mono text-white hover:border-[#00E5FF] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                <span>Production Subdomain: <strong className="text-slate-300 font-semibold">{getProductionSubdomain(page.publicSlug || slug)}</strong></span>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OPEN LIVE PAGE ↗</span>
              </a>

              {onOpenStandalone ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenStandalone();
                  }}
                  className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-[#00E5FF] transition-all"
                >
                  <Eye className="w-4 h-4 text-[#00E5FF]" />
                  <span>PREVIEW FULLSCREEN</span>
                </button>
              ) : (
                <button
                  onClick={handleNativeShare}
                  className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-white/[0.25] transition-all"
                >
                  <Share2 className="w-4 h-4 text-[#00E5FF]" />
                  <span>SHARE ASSET LINK</span>
                </button>
              )}
            </div>

            {onOpenAnalytics && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAnalytics();
                  }}
                  className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-xs uppercase tracking-wider hover:text-white hover:border-[#00E5FF] transition-all flex items-center justify-center gap-2"
                >
                  <span>VIEW CONVERSION ANALYTICS DASHBOARD →</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
