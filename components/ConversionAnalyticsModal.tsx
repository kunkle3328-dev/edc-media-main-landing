'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  FileCheck2,
  Smartphone,
  Monitor,
  Share2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import {
  ConversionFunnelMetrics,
  AIAnalyticsRecommendation,
  LandingPage,
} from '@/types/landing-engine';
import { analytics } from '@/lib/analytics';
import { evaluateBehavioralIntelligence } from '@/lib/behavioral-intelligence';

interface ConversionAnalyticsModalProps {
  page: LandingPage;
  onClose: () => void;
  onApplyOptimization?: (action: string) => void;
}

export function ConversionAnalyticsModal({
  page,
  onClose,
  onApplyOptimization,
}: ConversionAnalyticsModalProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [metrics, setMetrics] = useState<ConversionFunnelMetrics>(() =>
    analytics.getFunnelMetrics(page.id, '30d')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'funnel' | 'behavioral' | 'sources'>('funnel');

  const refreshTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/landing-engine/analytics?pageId=${page.id}&dateRange=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.metrics && data.metrics.totalEventsCount > 0) {
          setMetrics(data.metrics);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // client fallback below
    }
    setMetrics(analytics.getFunnelMetrics(page.id, dateRange));
    setIsLoading(false);
  }, [page.id, dateRange]);

  useEffect(() => {
    let cancelled = false;
    const fetchAsync = async () => {
      try {
        const res = await fetch(`/api/landing-engine/analytics?pageId=${page.id}&dateRange=${dateRange}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.success && data.metrics && data.metrics.totalEventsCount > 0) {
            setMetrics(data.metrics);
            return;
          }
        }
      } catch {
        // Fallback already in place
      }
      if (!cancelled) {
        setMetrics(analytics.getFunnelMetrics(page.id, dateRange));
      }
    };

    fetchAsync();

    return () => {
      cancelled = true;
    };
  }, [page.id, dateRange]);

  const intelligence = useMemo(() => {
    if (!metrics) {
      return {
        recommendations: [],
        summary: 'NOT ENOUGH DATA YET — Loading behavioral intelligence...',
        hasSufficientData: false,
      };
    }
    return evaluateBehavioralIntelligence(metrics, page);
  }, [metrics, page]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#0F121A] text-slate-400 hover:text-white border border-white/[0.08]"
          aria-label="Close analytics modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF] font-semibold">
                EDC CONVERSION INTELLIGENCE™ • REAL-TIME TELEMETRY
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Conversion Funnel &amp; Behavioral Diagnostics
              </h3>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-[#0F121A] p-1 border border-white/[0.08] text-xs font-mono">
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded uppercase tracking-wider transition-all ${
                    dateRange === r
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={refreshTelemetry}
              className="p-2 rounded-lg bg-[#0F121A] text-slate-400 hover:text-white border border-white/[0.08]"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pt-3 pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('funnel')}
            className={`pb-2 px-3 transition-colors ${
              activeSubTab === 'funnel'
                ? 'text-[#00E5FF] font-bold border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CONVERSION FUNNEL
          </button>
          <button
            onClick={() => setActiveSubTab('behavioral')}
            className={`pb-2 px-3 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'behavioral'
                ? 'text-[#00E5FF] font-bold border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>AI BEHAVIORAL DIAGNOSTICS</span>
            {intelligence.hasSufficientData && intelligence.recommendations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-[10px]">
                {intelligence.recommendations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('sources')}
            className={`pb-2 px-3 transition-colors ${
              activeSubTab === 'sources'
                ? 'text-[#00E5FF] font-bold border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SOURCES &amp; DEVICES
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Top High-Level KPI Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Visitors */}
            <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08]">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                <span>UNIQUE VISITORS</span>
                <Users className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {metrics?.visitors || 0}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {metrics?.uniqueSessions || 0} total sessions
              </div>
            </div>

            {/* CTA Clicks */}
            <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08]">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                <span>CTA ENGAGEMENT</span>
                <MousePointerClick className="w-3.5 h-3.5 text-[#00E5FF]" />
              </div>
              <div className="text-2xl font-extrabold text-[#00E5FF] font-mono">
                {metrics?.ctaClickRate || 0}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {metrics?.ctaInteractions || 0} CTA clicks
              </div>
            </div>

            {/* Form Starts */}
            <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08]">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                <span>FORM INTAKES</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-300 font-mono">
                {metrics?.formStarts || 0}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {metrics?.formStartRate || 0}% start rate
              </div>
            </div>

            {/* Leads / Conversion Rate */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-mono mb-1">
                <span>CONVERSION RATE</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {metrics?.conversionRate || 0}%
              </div>
              <div className="text-[10px] font-mono text-emerald-300/70 mt-1">
                {metrics?.leads || 0} verified leads
              </div>
            </div>
          </div>

          {/* TAB 1: CONVERSION FUNNEL */}
          {activeSubTab === 'funnel' && (
            <div className="space-y-5">
              {/* Funnel Progress Bars */}
              <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Visitor-to-Lead Drop-off Pipeline
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {metrics?.totalEventsCount || 0} telemetry events
                  </span>
                </div>

                {metrics?.visitors === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-mono text-xs">
                    <p className="font-bold text-slate-300">NO VISITOR EVENTS LOGGED YET</p>
                    <p className="mt-1">
                      Publish your landing page or open it in preview to generate real behavioral signals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {/* Stage 1: Visitors */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300">1. PAGE VISITORS</span>
                        <span className="text-white font-bold">{metrics?.visitors} (100%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#07090E] overflow-hidden border border-white/[0.06]">
                        <div className="h-full bg-slate-400 rounded-full w-full" />
                      </div>
                    </div>

                    {/* Stage 2: CTA Clicked */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300">2. CTA CLICKED</span>
                        <span className="text-[#00E5FF] font-bold">
                          {metrics?.ctaInteractions} ({metrics?.ctaClickRate}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#07090E] overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full bg-[#00E5FF] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, metrics?.ctaClickRate || 0))}%` }}
                        />
                      </div>
                    </div>

                    {/* Stage 3: Form Started */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300">3. FORM STARTED</span>
                        <span className="text-amber-400 font-bold">
                          {metrics?.formStarts} ({metrics?.formStartRate}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#07090E] overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, metrics?.formStartRate || 0))}%` }}
                        />
                      </div>
                    </div>

                    {/* Stage 4: Form Completed / Lead Captured */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300">4. COMPLETED LEADS</span>
                        <span className="text-emerald-400 font-bold">
                          {metrics?.leads} ({metrics?.conversionRate}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#07090E] overflow-hidden border border-white/[0.06]">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, metrics?.conversionRate || 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Source Breakdown */}
              <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] space-y-3">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  CTA Trigger Performance
                </h4>

                {(!metrics?.topCtaSources || metrics.topCtaSources.length === 0) ? (
                  <div className="text-xs font-mono text-slate-500 py-4 text-center">
                    No CTA clicks recorded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {metrics.topCtaSources.map((cta, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#07090E] border border-white/[0.06]">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          {cta.source}
                        </div>
                        <div className="text-lg font-bold text-white font-mono mt-0.5">
                          {cta.clicks} clicks
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          {cta.leads} leads generated
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI BEHAVIORAL DIAGNOSTICS */}
          {activeSubTab === 'behavioral' && (
            <div className="space-y-4">
              {!intelligence.hasSufficientData ? (
                <div className="p-8 rounded-2xl bg-[#0F121A] border border-amber-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                      NOT ENOUGH DATA YET
                    </h4>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                      {intelligence.summary}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-3 py-1 rounded-full bg-[#07090E] border border-white/[0.06]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>Zero hallucinated conclusions • Requires real session evidence</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0F121A] border border-[#00E5FF]/30 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white font-mono uppercase">
                        EDC Behavioral Engine Assessment
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{intelligence.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {intelligence.recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-[10px] font-mono font-bold uppercase">
                              {rec.epistemicType}
                            </span>
                            <span className="text-sm font-bold text-white">{rec.title}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="text-slate-400">IMPACT:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              {rec.expectedImpact}
                            </span>
                            <span className="text-slate-400">CONFIDENCE:</span>
                            <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                              {rec.confidence}
                            </span>
                          </div>
                        </div>

                        {/* Observed Signal & Evidence */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.04]">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                              Observed Signal
                            </span>
                            <p className="text-slate-300">{rec.observedSignal}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.04]">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                              Telemetry Evidence
                            </span>
                            <p className="text-slate-300 font-mono text-[11px]">{rec.evidence}</p>
                          </div>
                        </div>

                        {/* Root Cause & Prescriptive Recommendation */}
                        <div className="text-xs space-y-1.5 pt-1">
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 uppercase">
                              Likely Root Cause:{' '}
                            </span>
                            <span className="text-slate-300">{rec.likelyCause}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#00E5FF] uppercase">
                              Prescription:{' '}
                            </span>
                            <span className="text-slate-200 font-medium">{rec.recommendation}</span>
                          </div>
                        </div>

                        {rec.nextAction && onApplyOptimization && (
                          <div className="pt-2">
                            <button
                              onClick={() => onApplyOptimization(rec.nextAction)}
                              className="px-4 py-2 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/25 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{rec.nextAction}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOURCES & DEVICES */}
          {activeSubTab === 'sources' && (
            <div className="space-y-5">
              {/* Devices Breakdown */}
              <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Device Split &amp; Conversion Parity
                  </h4>
                  <span className="text-[10px] font-mono text-[#00E5FF]">
                    Mobile vs Desktop Diagnostics
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {(metrics?.deviceBreakdown || []).map((dev, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#07090E] border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                          {dev.device === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-[#00E5FF]" />
                          ) : (
                            <Monitor className="w-4 h-4 text-purple-400" />
                          )}
                          <span>{dev.device}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {dev.conversionRate}% CVR
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        <div>VISITORS: <span className="text-white">{dev.visitors}</span></div>
                        <div>LEADS: <span className="text-[#00E5FF]">{dev.leads}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Sources Breakdown */}
              <div className="p-5 rounded-2xl bg-[#0F121A] border border-white/[0.08] space-y-3">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Traffic Acquisition Channels
                </h4>

                {(!metrics?.trafficSources || metrics.trafficSources.length === 0) ? (
                  <div className="text-xs font-mono text-slate-500 py-4 text-center">
                    No acquisition source data logged yet.
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {metrics.trafficSources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#07090E] border border-white/[0.06] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span className="text-white font-bold uppercase">{src.source}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                          <span>{src.visitors} visitors</span>
                          <span className="text-white">{src.leads} leads</span>
                          <span className="text-emerald-400 font-bold">{src.conversionRate}% CVR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>
            EDC Engine Telemetry • Aggregated real-time metrics
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.08] text-slate-300 hover:text-white"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
