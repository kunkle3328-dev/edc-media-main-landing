'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Zap,
  Sliders,
  Share2,
  Copy,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Database,
  Send,
  HelpCircle,
  ExternalLink,
  Save,
  Check,
  History,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import {
  LandingPage,
  ViewportMode,
  ConversionAnalysis,
  AnalysisStatus,
  OptimizationRun,
  PageVersion,
} from '@/types/landing-engine';
import { LandingPageRenderer } from './LandingPageRenderer';
import { ConversionScoreModal } from './ConversionScoreModal';
import { SectionEditorDrawer } from './SectionEditorDrawer';
import { PublishModal } from './PublishModal';
import { LeadsManagerModal } from './LeadsManagerModal';
import { ConversionAnalyticsModal } from './ConversionAnalyticsModal';
import { ConversionIntelligenceCommandCenter } from './ConversionIntelligenceCommandCenter';
import { OptimizationPreviewModal } from './OptimizationPreviewModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { evaluateConversionDeterministic } from '@/lib/conversion-intelligence';
import { analytics } from '@/lib/analytics';
import { pageStorage } from '@/lib/storage';
import { getCustomerSubdomain } from '@/lib/domain-config';

interface PagePreviewWorkspaceProps {
  page: LandingPage;
  onUpdatePage: (updatedPage: LandingPage) => void;
  onCloseWorkspace: () => void;
  onDuplicatePage: (page: LandingPage) => void;
}

const NATURAL_LANGUAGE_SUGGESTIONS = [
  'Make the headline more urgent and immediate',
  'Change CTA button to "Book My Free Estimate"',
  'Add a 45-minute emergency response guarantee',
  'Emphasize zero upfront costs before inspection',
];

export function PagePreviewWorkspace({
  page,
  onUpdatePage,
  onCloseWorkspace,
  onDuplicatePage,
}: PagePreviewWorkspaceProps) {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showSectionDrawer, setShowSectionDrawer] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [standaloneMode, setStandaloneMode] = useState(false);

  // BUILD 02: Conversion Intelligence State
  const currentFingerprint = useMemo(() => pageStorage.computeFingerprint(page), [page]);
  const [manualAnalysis, setManualAnalysis] = useState<ConversionAnalysis | null>(null);
  const [userMarkedStale, setUserMarkedStale] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIntelligenceCenter, setShowIntelligenceCenter] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [currentOptimizationRun, setCurrentOptimizationRun] = useState<OptimizationRun | null>(null);

  // Derived analysis: uses manualAnalysis if matching current fingerprint, else cached, else instant deterministic baseline
  const analysis: ConversionAnalysis = useMemo(() => {
    if (manualAnalysis && manualAnalysis.inputFingerprint === currentFingerprint) {
      return manualAnalysis;
    }
    const cached = pageStorage.getAnalysisCache(page.id, currentFingerprint);
    if (cached) {
      return cached;
    }
    return evaluateConversionDeterministic(page);
  }, [page, currentFingerprint, manualAnalysis]);

  const analysisStatus: AnalysisStatus = isAnalyzing
    ? 'ANALYZING'
    : userMarkedStale
    ? 'STALE'
    : 'ANALYSIS_READY';

  // Derived versions count - memoized to prevent redundant storage access on key strokes
  const versionsCount = useMemo(() => {
    return Math.max(1, pageStorage.getVersions(page.id).length);
  }, [page.id, page.updatedAt]);

  // Natural Language AI Edit State
  const [editInstruction, setEditInstruction] = useState('');
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Leads count for this specific page - memoized
  const pageLeads = useMemo(() => {
    return pageStorage.getLeadsForPage(page.id);
  }, [page.id]);

  const handleManualReanalyze = async () => {
    setIsAnalyzing(true);
    setUserMarkedStale(false);
    try {
      const res = await fetch('/api/landing-engine/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, forceFresh: true }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setManualAnalysis(data.analysis);
        pageStorage.saveAnalysisCache(data.analysis);
      }
    } catch (err) {
      console.info('Re-analysis completed with deterministic fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyNLEdit = async (instructionText?: string) => {
    const textToApply = instructionText || editInstruction;
    if (!textToApply.trim()) return;

    setIsApplyingEdit(true);
    setEditError(null);
    analytics.track('edit_requested', { pageId: page.id, instruction: textToApply });

    try {
      const res = await fetch('/api/landing-engine/edit-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, instruction: textToApply }),
      });

      const data = await res.json();
      if (!res.ok || !data.page) {
        throw new Error(data.error || 'Failed to update page');
      }

      // Snapshot version before and after
      pageStorage.createVersionSnapshot(
        data.page,
        'Natural Language Edit',
        `Instruction: "${textToApply}"`
      );

      onUpdatePage(data.page);
      setEditInstruction('');
      analytics.track('edit_applied', { pageId: page.id });
      setUserMarkedStale(true);
    } catch (err: any) {
      setEditError(err.message || 'Could not process edit instruction.');
    } finally {
      setIsApplyingEdit(false);
    }
  };

  // One-Click Optimization Trigger: Requests candidate proposal and opens Before/After verification modal
  const handleTriggerOptimizationRun = async () => {
    setIsOptimizing(true);
    analytics.track('optimization_requested', { pageId: page.id });

    try {
      const res = await fetch('/api/landing-engine/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page }),
      });

      const data = await res.json();
      if (res.ok && data.optimizationRun) {
        setCurrentOptimizationRun(data.optimizationRun);
        setShowOptimizationModal(true);
      } else if (res.ok && data.page) {
        // Fallback if optimizationRun object wasn't generated
        onUpdatePage(data.page);
        analytics.track('optimization_applied', { pageId: page.id });
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Commit optimization proposal
  const handleApplyOptimization = (
    proposedPage: LandingPage,
    changeReason: string,
    summary: string
  ) => {
    // 1. Snapshot previous baseline
    pageStorage.createVersionSnapshot(
      page,
      'Pre-Optimization Baseline',
      'Saved prior to applying conversion improvements'
    );

    // 2. Snapshot new optimized version
    pageStorage.createVersionSnapshot(proposedPage, changeReason, summary);

    pageStorage.savePage(proposedPage);
    onUpdatePage(proposedPage);
    analytics.track('optimization_applied', { pageId: proposedPage.id });
  };

  // General page update handler (from Command Center or Section Drawer)
  const handleGeneralUpdate = (
    updatedPage: LandingPage,
    changeReason?: string,
    summary?: string
  ) => {
    if (changeReason) {
      pageStorage.createVersionSnapshot(
        updatedPage,
        changeReason,
        summary || 'Targeted conversion fix applied'
      );
    }

    pageStorage.savePage(updatedPage);
    onUpdatePage(updatedPage);
    setUserMarkedStale(true);
  };

  // Restore historical version
  const handleRestoreVersion = (restoredPage: LandingPage) => {
    pageStorage.createVersionSnapshot(
      restoredPage,
      'Restored Prior Version',
      'Reverted active state to historical snapshot'
    );

    pageStorage.savePage(restoredPage);
    onUpdatePage(restoredPage);
  };

  const handleManualSave = () => {
    pageStorage.savePage(page);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  // If in standalone mode, render only the page renderer with a small floating exit button
  if (standaloneMode) {
    return (
      <div className="relative min-h-screen bg-[#07090E]">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setStandaloneMode(false)}
            className="px-4 py-2 rounded-lg bg-[#0F121A]/90 backdrop-blur-md border border-white/[0.15] text-xs font-mono text-white hover:text-[#00E5FF] shadow-2xl flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Editor Workspace</span>
          </button>
        </div>
        <LandingPageRenderer
          page={page}
          isStandalone
          onLeadCaptured={() => {
            // refresh
          }}
        />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#07090E] flex flex-col pt-16">
      {/* Top Workspace Toolbar */}
      <header className="sticky top-16 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Back button & Page title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={onCloseWorkspace}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.08]"
              id="workspace-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EXIT WORKSPACE</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-[240px]">
                {page.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 uppercase">
                {page.businessProfile.primaryGoal}
              </span>
            </div>
          </div>

          {/* Center: Device Viewport Switcher */}
          <div className="flex items-center gap-1 bg-[#0F121A] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => {
                setViewport('desktop');
                analytics.track('viewport_changed', { mode: 'desktop' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewport === 'desktop'
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => {
                setViewport('tablet');
                analytics.track('viewport_changed', { mode: 'tablet' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewport === 'tablet'
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => {
                setViewport('mobile');
                analytics.track('viewport_changed', { mode: 'mobile' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewport === 'mobile'
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Right: Conversion Intelligence, Optimize, Versions, Leads, Publish, Section Editor */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* EDC CONVERSION SCORE™ BUTTON */}
            <button
              onClick={() => {
                setShowIntelligenceCenter(true);
                analytics.track('conversion_intelligence_opened', { pageId: page.id });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F121A] border border-[#00E5FF]/40 text-xs font-mono text-white hover:bg-[#00E5FF]/10 transition-all shadow-[0_0_12px_rgba(0,229,255,0.12)]"
              id="conversion-score-btn"
              title="Open EDC Conversion Intelligence Command Center"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="text-slate-400 font-medium">EDC SCORE:</span>
              <span className="text-[#00E5FF] font-bold">
                {analysis?.score || page.conversionScore?.overallScore || 85}/100
              </span>
              {analysisStatus === 'STALE' ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Page changed — click to review" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Analysis ready" />
              )}
            </button>

            {/* ONE-CLICK OPTIMIZATION TRIGGER */}
            <button
              onClick={handleTriggerOptimizationRun}
              disabled={isOptimizing}
              className="px-3 py-1.5 rounded-lg bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
              id="workspace-optimize-btn"
              title="Run One-Click Optimization with Before/After Verification"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>OPTIMIZING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>OPTIMIZE</span>
                </>
              )}
            </button>

            {/* VERSION HISTORY BUTTON */}
            <button
              onClick={() => {
                setShowVersionHistory(true);
                analytics.track('version_history_opened', { pageId: page.id });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-colors"
              title="View revision snapshots and restore prior versions"
            >
              <History className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>VERSIONS ({versionsCount})</span>
            </button>

            {/* Leads Button */}
            <button
              onClick={() => setShowLeadsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-400 hover:bg-emerald-900/40 transition-colors"
              title="Open EDC Lead Center"
            >
              <Database className="w-3.5 h-3.5" />
              <span>LEADS ({pageLeads.length})</span>
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => {
                setShowAnalyticsModal(true);
                analytics.track('analytics_modal_opened', { pageId: page.id });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors"
              title="View Real-Time Conversion Funnel & Behavioral Intelligence"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">ANALYTICS</span>
            </button>

            {/* Section Editor Drawer Toggle */}
            <button
              onClick={() => setShowSectionDrawer(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">SECTIONS</span>
            </button>

            {/* Publish Button */}
            <button
              onClick={() => {
                setShowPublishModal(true);
                analytics.track('publish_modal_opened', { pageId: page.id });
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                page.status === 'published'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border-white/[0.1]'
              }`}
              id="workspace-publish-btn"
              title={page.status === 'published' ? `Live at ${getCustomerSubdomain(page.publicSlug || '')}` : 'Publish landing page'}
            >
              <Share2 className={`w-3.5 h-3.5 ${page.status === 'published' ? 'text-emerald-400' : 'text-slate-300'}`} />
              <span>{page.status === 'published' ? 'LIVE' : 'PUBLISH'}</span>
              {page.status === 'published' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Save indicator button */}
            <button
              onClick={handleManualSave}
              className="p-1.5 rounded-lg bg-[#0F121A] border border-white/[0.08] text-slate-400 hover:text-white"
              title="Save to local storage"
            >
              {saveIndicator ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* AI Natural Language Edit Bar */}
        <div className="max-w-7xl mx-auto pt-2 mt-2 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#00E5FF] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI PAGE EDITOR:</span>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder='Describe any edit (e.g. "Make headline more aggressive", "Change CTA to Book My Free Estimate")...'
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyNLEdit();
                }}
                disabled={isApplyingEdit}
                className="flex-1 px-3.5 py-1.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] font-sans"
              />

              <button
                type="button"
                onClick={() => handleApplyNLEdit()}
                disabled={isApplyingEdit || !editInstruction.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all shrink-0"
              >
                {isApplyingEdit ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>APPLYING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>UPDATE PAGE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Edit Suggestion Pills */}
          <div className="hidden lg:flex items-center gap-2 mt-2 overflow-x-auto text-[10px] font-mono text-slate-400">
            <span className="shrink-0 text-slate-400">TRY:</span>
            {NATURAL_LANGUAGE_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleApplyNLEdit(sug)}
                disabled={isApplyingEdit}
                className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] hover:text-[#00E5FF] transition-colors truncate shrink-0 text-slate-300"
              >
                &ldquo;{sug}&rdquo;
              </button>
            ))}
          </div>

          {editError && (
            <p className="text-[11px] text-red-400 mt-1 font-mono">{editError}</p>
          )}
        </div>
      </header>

      {/* Main Preview Canvas Area */}
      <main className="flex-1 bg-[#04060A] p-4 sm:p-8 flex flex-col items-center justify-start overflow-x-auto min-h-[calc(100vh-140px)]">
        {/* Mobile Viewport Contextual Conversion Ribbon */}
        {viewport === 'mobile' && (
          <div className="w-[390px] mb-3 px-4 py-2 rounded-xl bg-[#0F121A] border border-white/[0.1] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>MOBILE READINESS:</span>
              <span className="text-emerald-400 font-bold">
                {analysis?.mobileAnalysis.readinessScore || 90}/100
              </span>
            </div>
            <button
              onClick={() => setShowIntelligenceCenter(true)}
              className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1"
            >
              <span>Inspect</span>
              <TrendingUp className="w-3 h-3" />
            </button>
          </div>
        )}

        <div
          className={`transition-all duration-300 relative ${
            viewport === 'desktop'
              ? 'w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden border border-white/[0.1]'
              : viewport === 'tablet'
              ? 'w-[768px] shadow-2xl rounded-2xl overflow-hidden border border-white/[0.15]'
              : 'w-[390px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-[40px] overflow-hidden border-8 border-[#161B26]'
          }`}
        >
          {/* Mobile phone camera notch simulation when in mobile viewport */}
          {viewport === 'mobile' && (
            <div className="bg-[#161B26] pt-2 pb-1 px-4 flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
              <span>9:41</span>
              <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
              <span>5G</span>
            </div>
          )}

          {/* Render Actual Page Inside Frame */}
          <LandingPageRenderer
            page={page}
            onLeadCaptured={() => {
              // Update state so leads button counter updates
              onUpdatePage({ ...page, updatedAt: new Date().toISOString() });
            }}
          />
        </div>
      </main>

      {/* EDC Conversion Intelligence Command Center */}
      <ConversionIntelligenceCommandCenter
        page={page}
        analysis={analysis}
        status={analysisStatus}
        isOpen={showIntelligenceCenter}
        onClose={() => setShowIntelligenceCenter(false)}
        onUpdatePage={(up, reason, summary) => handleGeneralUpdate(up, reason, summary)}
        onTriggerOptimization={() => {
          setShowIntelligenceCenter(false);
          handleTriggerOptimizationRun();
        }}
        onReanalyze={handleManualReanalyze}
        isAnalyzing={isAnalyzing}
        isOptimizing={isOptimizing}
      />

      {/* Optimization Proposal Before/After Verification Modal */}
      <OptimizationPreviewModal
        optimizationRun={currentOptimizationRun}
        currentPage={page}
        isOpen={showOptimizationModal}
        onClose={() => setShowOptimizationModal(false)}
        onApplyOptimization={handleApplyOptimization}
      />

      {/* Version History & Rollback Modal */}
      <VersionHistoryModal
        page={page}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Legacy/Quick Score Modal */}
      {showScoreModal && (
        <ConversionScoreModal
          page={page}
          onClose={() => setShowScoreModal(false)}
          onOptimize={handleTriggerOptimizationRun}
          isOptimizing={isOptimizing}
        />
      )}

      {/* Section Architecture Drawer */}
      {showSectionDrawer && (
        <SectionEditorDrawer
          page={page}
          onClose={() => setShowSectionDrawer(false)}
          onSavePage={(up) => {
            handleGeneralUpdate(up, 'Manual Section Reconfiguration', 'Sections reordered/modified via Architect Drawer');
          }}
        />
      )}

      {/* Publish & Share Modal */}
      {showPublishModal && (
        <PublishModal
          page={page}
          onClose={() => setShowPublishModal(false)}
          onOpenStandalone={() => setStandaloneMode(true)}
          onOpenAnalytics={() => setShowAnalyticsModal(true)}
          onPageUpdated={(up) => {
            handleGeneralUpdate(up, 'Production Publish', 'Published new production version to edge');
          }}
        />
      )}

      {/* Leads Management Modal */}
      {showLeadsModal && (
        <LeadsManagerModal
          leads={pageStorage.getAllLeads()}
          currentPageId={page.id}
          onClose={() => setShowLeadsModal(false)}
          onLeadsUpdated={() => {
            onUpdatePage({ ...page });
          }}
        />
      )}

      {/* Conversion Analytics & Behavioral Diagnostics Modal */}
      {showAnalyticsModal && (
        <ConversionAnalyticsModal
          page={page}
          onClose={() => setShowAnalyticsModal(false)}
          onApplyOptimization={(action) => {
            setShowAnalyticsModal(false);
            handleApplyNLEdit(action);
          }}
        />
      )}
    </section>
  );
}
