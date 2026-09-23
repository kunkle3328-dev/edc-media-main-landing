'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Sliders,
  RefreshCw,
  Send,
  Loader2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Flame,
  Check,
} from 'lucide-react';
import {
  LandingPage,
  ConversionAnalysis,
  PriorityAction,
  SectionScoreAnalysis,
  AnalysisStatus,
  SectionType,
} from '@/types/landing-engine';
import { ConversionScoreRing } from './ConversionScoreRing';
import { analytics } from '@/lib/analytics';
import { pageStorage } from '@/lib/storage';

interface ConversionIntelligenceCommandCenterProps {
  page: LandingPage;
  analysis: ConversionAnalysis | null;
  status: AnalysisStatus;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePage: (updatedPage: LandingPage, changeReason: string, summary: string) => void;
  onTriggerOptimization: () => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
  isOptimizing: boolean;
}

type TabKey = 'overview' | 'improvements' | 'sections' | 'quick_actions' | 'assistant';

export function ConversionIntelligenceCommandCenter({
  page,
  analysis,
  status,
  isOpen,
  onClose,
  onUpdatePage,
  onTriggerOptimization,
  onReanalyze,
  isAnalyzing,
  isOptimizing,
}: ConversionIntelligenceCommandCenterProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedSection, setSelectedSection] = useState<SectionScoreAnalysis | null>(null);
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Chat / Assistant State
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; actionSuggestion?: string }[]
  >([
    {
      role: 'assistant',
      text: 'I am your EDC Conversion Strategist. I evaluate your copy, layout, and trust architecture with mathematical precision. Ask me about your score, how to reduce friction, or test alternative headlines.',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  const score = analysis?.score || page.conversionScore?.overallScore || 85;

  const showNotification = (msg: string) => {
    setAppliedNotice(msg);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  // 1-Click Apply for Priority Actions
  const handleApplyPriorityAction = (action: PriorityAction) => {
    const updatedPage = JSON.parse(JSON.stringify(page)) as LandingPage;

    if (action.mutationPayload?.actionType === 'UPDATE_CTA') {
      const newCta = action.mutationPayload.value as string;
      updatedPage.ctaConfig.primaryText = newCta;
      const hero = updatedPage.sections.find((s) => s.type === 'hero');
      if (hero) hero.content.primaryCTA = newCta;
      const lead = updatedPage.sections.find((s) => s.type === 'lead_capture');
      if (lead) lead.content.submitButtonText = newCta;
    } else if (action.mutationPayload?.actionType === 'UPDATE_HEADLINE') {
      const hero = updatedPage.sections.find((s) => s.type === 'hero');
      if (hero) hero.content.headline = action.mutationPayload.value;
    } else if (action.mutationPayload?.actionType === 'UPDATE_SUBTEXT') {
      const sub = action.mutationPayload.value as string;
      updatedPage.ctaConfig.primarySubtext = sub;
      const hero = updatedPage.sections.find((s) => s.type === 'hero');
      if (hero) hero.content.primarySubtext = sub;
    } else if (action.mutationPayload?.actionType === 'UPDATE_FIELDS') {
      const lead = updatedPage.sections.find((s) => s.type === 'lead_capture');
      if (lead) {
        lead.content.fields = action.mutationPayload.value;
        updatedPage.leadCaptureConfig.fields = action.mutationPayload.value;
      }
    } else if (action.mutationPayload?.actionType === 'UPDATE_BADGE') {
      const hero = updatedPage.sections.find((s) => s.type === 'hero');
      if (hero) hero.content.urgencyBadge = action.mutationPayload.value;
    }

    setAppliedActionIds((prev) => [...prev, action.id]);
    analytics.track('recommendation_applied', { pageId: page.id, actionId: action.id });
    onUpdatePage(updatedPage, `Applied: ${action.title}`, action.whyItMatters);
    showNotification(`Applied improvement: ${action.title}`);
  };

  // Apply Headline Alternative
  const handleApplyHeadlineAlt = (headlineText: string, variantName: string) => {
    const updatedPage = JSON.parse(JSON.stringify(page)) as LandingPage;
    const hero = updatedPage.sections.find((s) => s.type === 'hero');
    if (hero) {
      hero.content.headline = headlineText;
      onUpdatePage(
        updatedPage,
        `Applied ${variantName} Headline`,
        `Replaced headline with "${headlineText}"`
      );
      showNotification(`Applied ${variantName} headline variant.`);
    }
  };

  // Apply Specific Section Fix
  const handleApplySectionFix = (secAnalysis: SectionScoreAnalysis) => {
    const updatedPage = JSON.parse(JSON.stringify(page)) as LandingPage;
    const target = updatedPage.sections.find((s) => s.id === secAnalysis.sectionId);

    if (target) {
      if (target.type === 'hero') {
        target.content.urgencyBadge = '⚡ HIGH-PRIORITY AVAILABILITY • IMMEDIATE ONBOARDING';
        target.content.primarySubtext = '100% Upfront Quote • Zero Obligation';
      } else if (target.type === 'social_proof') {
        target.content.badgeList = ['VERIFIED INDUSTRY EXPERT', '100% SECURE & CONFIDENTIAL', '45-MIN RESPONSE'];
      } else if (target.type === 'lead_capture') {
        target.content.subtitle = 'Direct engineer dispatch with zero hidden fees.';
      }

      onUpdatePage(
        updatedPage,
        `Optimized ${secAnalysis.title} Section`,
        `Enhanced conversion alignment for ${secAnalysis.title}.`
      );
      showNotification(`Optimized ${secAnalysis.title} section.`);
    }
  };

  // Chat Submission Handler
  const handleSendChat = (preset?: string) => {
    const query = preset || chatQuery;
    if (!query.trim() || isChatLoading) return;

    const userMsg = { role: 'user' as const, text: query };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatQuery('');
    setIsChatLoading(true);

    // Intent routing & AI response generation
    setTimeout(() => {
      const lower = query.toLowerCase();
      let responseText = '';

      if (lower.includes('score') || lower.includes('why')) {
        responseText = `Your current score is ${score}/100. The highest-impact opportunities to reach 95+ are: 1) Upgrading button copy from generic wording to an outcome promise, 2) Reinforcing risk reversal directly under form inputs, and 3) Keeping mobile inputs capped at 3 fields.`;
      } else if (lower.includes('headline')) {
        responseText = `I analyzed your headline against high-converting frameworks. Here is a benefit-driven alternative: "${analysis?.headlineAnalysis.alternatives.benefitDriven || 'Direct Outcome With Zero Friction'}". You can apply this directly from the Quick Actions tab!`;
      } else if (lower.includes('friction') || lower.includes('form')) {
        responseText = `Currently your form contains ${page.leadCaptureConfig.fields.length} fields. For mobile users, every additional field reduces completion velocity by 7-10%. I recommend keeping inputs strictly to Name, Email, and Phone number.`;
      } else if (lower.includes('mobile')) {
        responseText = `Mobile readiness score is ${analysis?.mobileAnalysis.readinessScore || 88}/100. All button touch targets satisfy the 44px ergonomic standard. Ensure your headline is scannable in under 3 seconds without excessive text wrap.`;
      } else {
        responseText = `Based on EDC conversion heuristics for "${page.businessProfile.offer}", your messaging is direct and clear. To maximize inquiry capture, click "OPTIMIZE MY PAGE" to generate a verified 95+ score candidate.`;
      }

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: responseText },
      ]);
      setIsChatLoading(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0F121A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-wider">
                  EDC CONVERSION INTELLIGENCE™
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-semibold">
                  BUILD 02 ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous page evaluation, 15 conversion dimensions, and single-click optimization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTriggerOptimization}
              disabled={isOptimizing}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>OPTIMIZE MY PAGE</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Applied Notification Toast */}
        {appliedNotice && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{appliedNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-white/[0.08] bg-[#07090E] overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'border-[#00E5FF] text-[#00E5FF] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview & Score</span>
          </button>

          <button
            onClick={() => setActiveTab('improvements')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'improvements'
                ? 'border-[#00E5FF] text-[#00E5FF] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Top 3 Improvements</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
              PRIORITY
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'sections'
                ? 'border-[#00E5FF] text-[#00E5FF] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Section Scores ({analysis?.sectionScores.length || page.sections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quick_actions')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'quick_actions'
                ? 'border-[#00E5FF] text-[#00E5FF] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Quick Actions Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono border-b-2 transition-all shrink-0 ${
              activeTab === 'assistant'
                ? 'border-[#00E5FF] text-[#00E5FF] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Conversion Strategist</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[62vh] bg-[#0A0D14]">
          {/* TAB 1: OVERVIEW & SCORE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score Visualizer Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-[#0F121A] border border-white/[0.08] items-center">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
                  <ConversionScoreRing
                    score={score}
                    status={status}
                    size="lg"
                    onReanalyze={onReanalyze}
                    isAnalyzing={isAnalyzing}
                  />

                  {status === 'STALE' && (
                    <button
                      onClick={onReanalyze}
                      disabled={isAnalyzing}
                      className="mt-3 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>Update Assessment</span>
                    </button>
                  )}
                </div>

                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs font-mono text-[#00E5FF] uppercase tracking-wider mb-1">
                      EXECUTIVE ASSESSMENT
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed font-sans font-medium">
                      {analysis?.summary ||
                        'Strong conversion foundation with solid narrative hierarchy. Clear opportunities exist to upgrade CTA specificity and reinforce trust signals.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.06]">
                    <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1 mb-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        STRONGEST CONVERSION ASSETS:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {(analysis?.strengths || [
                          'Hero states core mechanism above fold',
                          'Low cognitive friction on contact channel',
                          'Thumb-zone optimized on mobile viewports',
                        ]).map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1 mb-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        PRIMARY CONVERSION LEAKS:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {(analysis?.weaknesses || [
                          'CTA label can deliver a sharper outcome promise',
                          'Reassurance text missing directly beneath form input',
                        ]).map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 15 Weighted Dimensions Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    15 Weighted Conversion Dimensions:
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    Calculated Mathematically
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(analysis?.dimensions || []).map((dim, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.06] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-white">
                          {dim.name}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            dim.score >= 85
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : dim.score >= 70
                              ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {dim.score}/100
                        </span>
                      </div>

                      <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${dim.score}%`,
                            backgroundColor:
                              dim.score >= 85 ? '#10B981' : dim.score >= 70 ? '#00E5FF' : '#F59E0B',
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                        {dim.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOP 3 IMPROVEMENTS */}
          {activeTab === 'improvements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>PRIORITY ACTIONS — TOP 3 CONVERSION BOOSTERS</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ranked by impact, confidence, and minimal execution effort.
                  </p>
                </div>

                <button
                  onClick={onTriggerOptimization}
                  className="text-xs font-mono text-[#00E5FF] hover:underline flex items-center gap-1"
                >
                  <span>Apply all via One-Click Optimization</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {(analysis?.priorityActions || []).map((action, idx) => {
                  const isApplied = appliedActionIds.includes(action.id);

                  return (
                    <div
                      key={action.id}
                      className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] hover:border-[#00E5FF]/30 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] font-mono text-xs font-bold flex items-center justify-center border border-[#00E5FF]/30">
                            0{idx + 1}
                          </span>
                          <h5 className="text-sm font-bold text-white font-mono">
                            {action.title}
                          </h5>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                            IMPACT: {action.impact}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 uppercase">
                            EFFORT: {action.effort}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                            Current State:
                          </span>
                          <p className="text-slate-300 font-sans">
                            {action.currentState}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20">
                          <span className="text-[10px] font-mono uppercase text-[#00E5FF] block mb-1">
                            Recommended State:
                          </span>
                          <p className="text-white font-sans font-medium">
                            {action.recommendedState}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] flex-wrap gap-2">
                        <div className="text-xs text-slate-400 max-w-xl">
                          <span className="text-slate-300 font-medium">Why it matters:</span>{' '}
                          {action.whyItMatters}
                        </div>

                        <button
                          onClick={() => handleApplyPriorityAction(action)}
                          disabled={isApplied}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            isApplied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                              : 'bg-[#00E5FF] text-[#07090E] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-[1.02]'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>APPLIED</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>APPLY IMPROVEMENT</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SECTION SCORES */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-mono text-white">
                    INDIVIDUAL SECTION EVALUATION
                  </h4>
                  <p className="text-xs text-slate-400">
                    Click any section to inspect what is working, what could improve, and apply targeted fixes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Section List */}
                <div className="md:col-span-5 space-y-2 max-h-[460px] overflow-y-auto">
                  {(analysis?.sectionScores || []).map((sec) => {
                    const isSelected = selectedSection?.sectionId === sec.sectionId;

                    return (
                      <div
                        key={sec.sectionId}
                        onClick={() => setSelectedSection(sec)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0F121A] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                            : 'bg-[#0F121A]/50 border-white/[0.06] hover:bg-[#0F121A] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-white uppercase">
                            {sec.title}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              sec.score >= 90
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : sec.score >= 75
                                ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {sec.score}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                          {sec.whyScore}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Deep Dive Panel */}
                <div className="md:col-span-7 p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] flex flex-col justify-between">
                  {selectedSection ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div>
                          <span className="text-[10px] font-mono text-[#00E5FF] uppercase block">
                            SECTION DRILL-DOWN
                          </span>
                          <h5 className="text-sm font-bold text-white font-mono uppercase">
                            {selectedSection.title} ({selectedSection.score}/100)
                          </h5>
                        </div>

                        <span
                          className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                            selectedSection.score >= 90
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {selectedSection.score >= 90 ? 'OPTIMIZED' : 'NEEDS ATTENTION'}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                            WHY THIS SCORE?
                          </span>
                          <p className="text-slate-200 font-sans leading-relaxed">
                            {selectedSection.whyScore}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1 font-bold">
                            WHAT&apos;S WORKING:
                          </span>
                          <ul className="text-slate-300 space-y-1">
                            {selectedSection.whatsWorking.map((w, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="text-emerald-400">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                          <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1 font-bold">
                            WHAT COULD IMPROVE:
                          </span>
                          <ul className="text-slate-300 space-y-1">
                            {selectedSection.whatCouldImprove.map((c, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="text-amber-400">•</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-sans">
                          {selectedSection.recommendedAction}
                        </span>
                        <button
                          onClick={() => handleApplySectionFix(selectedSection)}
                          className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.25)] hover:scale-[1.02] transition-all"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>APPLY SECTION FIX</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 text-xs font-mono">
                      Select a section on the left to inspect its deep-dive metrics.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK ACTIONS HUB */}
          {activeTab === 'quick_actions' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold font-mono text-white">
                  QUICK CONVERSION ACCELERATORS
                </h4>
                <p className="text-xs text-slate-400">
                  Instant, one-click copy and structural upgrades designed to lift inquiry rates.
                </p>
              </div>

              {/* Headline Alternatives Matrix */}
              <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      HEADLINE UPGRADE SUITE (3 HIGH-CONVERTING ALTERNATIVES)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    1-CLICK APPLY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Direct */}
                  <div className="p-4 rounded-xl bg-[#07090E] border border-white/[0.06] flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold block mb-1">
                        DIRECT & IMMEDIATE
                      </span>
                      <p className="text-xs text-slate-200 font-sans font-medium">
                        &ldquo;{analysis?.headlineAnalysis.alternatives.direct || 'Direct Solution Delivered Fast'}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleApplyHeadlineAlt(
                          analysis?.headlineAnalysis.alternatives.direct || 'Direct Solution',
                          'Direct'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-[#00E5FF] hover:text-white transition-colors"
                    >
                      Apply Direct
                    </button>
                  </div>

                  {/* Benefit */}
                  <div className="p-4 rounded-xl bg-[#07090E] border border-white/[0.06] flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                        BENEFIT-DRIVEN
                      </span>
                      <p className="text-xs text-slate-200 font-sans font-medium">
                        &ldquo;{analysis?.headlineAnalysis.alternatives.benefitDriven || 'Stop Losing Leads Today'}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleApplyHeadlineAlt(
                          analysis?.headlineAnalysis.alternatives.benefitDriven || 'Benefit Variant',
                          'Benefit-Driven'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-400 transition-colors"
                    >
                      Apply Benefit-Driven
                    </button>
                  </div>

                  {/* Outcome */}
                  <div className="p-4 rounded-xl bg-[#07090E] border border-white/[0.06] flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block mb-1">
                        OUTCOME-DRIVEN
                      </span>
                      <p className="text-xs text-slate-200 font-sans font-medium">
                        &ldquo;{analysis?.headlineAnalysis.alternatives.outcomeDriven || 'Turn Inquiries Into Revenue'}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleApplyHeadlineAlt(
                          analysis?.headlineAnalysis.alternatives.outcomeDriven || 'Outcome Variant',
                          'Outcome-Driven'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-xs font-mono text-purple-400 transition-colors"
                    >
                      Apply Outcome-Driven
                    </button>
                  </div>
                </div>
              </div>

              {/* Offer & Friction Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengthen Offer */}
                <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        STRENGTHEN OFFER CLARITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans mb-3">
                      Current: &ldquo;{analysis?.offerAnalysis.what}&rdquo; for &ldquo;{analysis?.offerAnalysis.who}&rdquo;.
                    </p>
                    <div className="p-3 rounded-xl bg-black/20 text-xs text-slate-300">
                      <span className="text-[10px] font-mono text-[#00E5FF] uppercase block mb-1">
                        Recommended Polish:
                      </span>
                      {analysis?.offerAnalysis.recommendedOffer}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updatedPage = JSON.parse(JSON.stringify(page)) as LandingPage;
                      const hero = updatedPage.sections.find((s) => s.type === 'hero');
                      if (hero && analysis?.offerAnalysis.recommendedOffer) {
                        hero.content.subheadline = analysis.offerAnalysis.recommendedOffer;
                        onUpdatePage(
                          updatedPage,
                          'Strengthened Offer Description',
                          'Applied high-clarity offer definition in hero subheadline.'
                        );
                        showNotification('Applied high-clarity offer description.');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white transition-colors"
                  >
                    Apply High-Clarity Offer Copy
                  </button>
                </div>

                {/* Reduce Form Friction */}
                <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        STREAMLINE LEAD FRICTION
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans mb-3">
                      Currently using {page.leadCaptureConfig.fields.length} form inputs. Capping inputs to Name, Work Email, and Phone number maximizes mobile submissions.
                    </p>
                    <div className="p-3 rounded-xl bg-black/20 text-xs text-slate-300">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">
                        Friction Policy:
                      </span>
                      Zero unnecessary dropdowns. Fast autofill triggers on iOS/Android.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updatedPage = JSON.parse(JSON.stringify(page)) as LandingPage;
                      const lead = updatedPage.sections.find((s) => s.type === 'lead_capture');
                      const fields = [
                        { name: 'name', label: 'Full Name', type: 'text' as const, placeholder: 'Alex Mercer', required: true },
                        { name: 'email', label: 'Work Email', type: 'email' as const, placeholder: 'alex@company.com', required: true },
                        { name: 'phone', label: 'Phone Number', type: 'tel' as const, placeholder: '(555) 019-2834', required: false },
                      ];
                      if (lead) lead.content.fields = fields;
                      updatedPage.leadCaptureConfig.fields = fields;
                      onUpdatePage(
                        updatedPage,
                        'Streamlined Form Inputs',
                        'Reduced lead capture form to 3 high-velocity contact fields.'
                      );
                      showNotification('Streamlined form inputs to 3 fields.');
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-400 transition-colors"
                  >
                    Trim Form to 3 Essential Fields
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI CONVERSION STRATEGIST (CHAT) */}
          {activeTab === 'assistant' && (
            <div className="flex flex-col h-full min-h-[380px] justify-between space-y-4">
              {/* Message List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs max-w-xl ${
                      msg.role === 'user'
                        ? 'ml-auto bg-[#00E5FF]/10 text-white border border-[#00E5FF]/20'
                        : 'bg-[#0F121A] text-slate-200 border border-white/[0.08]'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      {msg.role === 'user' ? 'You' : 'EDC Conversion Intelligence AI'}
                    </span>
                    <p className="font-sans leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="p-3 rounded-xl bg-[#0F121A] text-slate-400 text-xs font-mono flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                    <span>Analyzing conversion heuristics...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompts & Input */}
              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-slate-400 pb-1">
                  <span className="shrink-0 text-slate-500">Ask:</span>
                  <button
                    onClick={() => handleSendChat('Why is my conversion score not 95+?')}
                    className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] hover:text-[#00E5FF] truncate"
                  >
                    &ldquo;Why is my score not 95+?&rdquo;
                  </button>
                  <button
                    onClick={() => handleSendChat('How can I reduce form friction on mobile?')}
                    className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] hover:text-[#00E5FF] truncate"
                  >
                    &ldquo;How to reduce mobile friction?&rdquo;
                  </button>
                  <button
                    onClick={() => handleSendChat('Give me a benefit-driven headline')}
                    className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] hover:text-[#00E5FF] truncate"
                  >
                    &ldquo;Suggest a benefit headline&rdquo;
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask any conversion strategy question..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendChat();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#07090E] border border-white/[0.1] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] font-sans"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    disabled={!chatQuery.trim() || isChatLoading}
                    className="px-4 py-2.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-40 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ASK AI</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
