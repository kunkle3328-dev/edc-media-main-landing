'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  TrendingUp,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { LandingPage, ConversionScoreData } from '@/types/landing-engine';

interface ConversionScoreModalProps {
  page: LandingPage;
  onClose: () => void;
  onOptimize: () => Promise<void>;
  isOptimizing: boolean;
}

export function ConversionScoreModal({
  page,
  onClose,
  onOptimize,
  isOptimizing,
}: ConversionScoreModalProps) {
  const scoreData: ConversionScoreData = page.conversionScore || {
    overallScore: 88,
    label: 'Strong Conversion Baseline',
    assessmentSummary:
      'The page demonstrates strong visitor direction and low friction. Further gains are unlocked by sharpening urgency and reinforcing upfront price certainty.',
    metrics: [
      { name: 'Headline Clarity', score: 92, weight: 15, feedback: 'Communicates core offer in < 3 seconds.' },
      { name: 'Offer Clarity', score: 89, weight: 15, feedback: 'Specific and addresses core customer pain.' },
      { name: 'CTA Prominence', score: 94, weight: 15, feedback: 'Dominant visual contrast and consistent placement.' },
      { name: 'Audience Relevance', score: 86, weight: 10, feedback: 'Aligned with buyer expectations.' },
      { name: 'Trust Signals', score: 80, weight: 15, feedback: 'Trust placeholders ready for real proof.' },
      { name: 'Objection Handling', score: 85, weight: 10, feedback: 'Addresses timing and cost upfront.' },
      { name: 'Mobile Readiness', score: 96, weight: 10, feedback: 'Single column responsive architecture.' },
      { name: 'Form Friction', score: 90, weight: 10, feedback: 'Quick 3-step capture minimizes bounce.' },
    ],
    whatsWorking: [
      'High-contrast electric cyan call-to-action stands out instantly.',
      'Clear 3-step visitor pathway removes anxiety about what happens next.',
      'Transparent objection-handling FAQ reduces purchase hesitation.',
    ],
    whatsMissing: [
      'Specific service territory or radius mentions',
      'Verified customer proof quotes (placeholders provided)',
    ],
    topImprovements: [
      {
        id: 'imp_1',
        title: 'Inject High-Urgency Dispatch Badge',
        impact: 'high',
        action: 'Add a 45-Minute Emergency Response tag to the top hero bar.',
      },
      {
        id: 'imp_2',
        title: 'Reinforce Risk-Reversal Guarantee',
        impact: 'critical',
        action: 'Add a "100% Upfront Quote Before Work Begins" assurance badge.',
      },
    ],
  };

  const scoreColor =
    scoreData.overallScore >= 90
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
      : scoreData.overallScore >= 80
      ? 'text-[#00E5FF] border-[#00E5FF]/40 bg-[#00E5FF]/10'
      : 'text-amber-400 border-amber-500/40 bg-amber-950/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#0F121A] text-slate-400 hover:text-white border border-white/[0.08]"
          aria-label="Close conversion score modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF]">
              EDC CONVERSION SCORE™
            </div>
            <h3 className="text-xl font-bold text-white">
              AI Conversion Assessment
            </h3>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="p-5 rounded-xl bg-[#0F121A] border border-white/[0.08] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-5xl font-black font-mono tracking-tight text-white">
                {scoreData.overallScore}
              </span>
              <span className="text-lg font-mono text-slate-400">/ 100</span>
            </div>
            <p className="text-xs font-mono font-semibold text-[#00E5FF] mt-1">
              {scoreData.label}
            </p>
          </div>

          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all shrink-0"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>APPLYING AI OPTIMIZATIONS...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>OPTIMIZE MY PAGE (1-CLICK)</span>
              </>
            )}
          </button>
        </div>

        {/* Assessment Statement */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 p-4 rounded-xl bg-[#07090E] border border-white/[0.06]">
          {scoreData.assessmentSummary}
        </p>

        {/* Breakdown Metrics */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            METRIC BREAKDOWN
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scoreData.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.06]"
              >
                <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
                  <span className="text-white">{m.name}</span>
                  <span className="font-mono text-[#00E5FF]">{m.score}/100</span>
                </div>
                <div className="w-full h-1.5 bg-[#07090E] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 rounded-full"
                    style={{ width: `${m.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {m.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What's Working & What's Missing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Working */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <h5 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              WHAT&apos;S WORKING
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scoreData.whatsWorking.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
            <h5 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              WHAT&apos;S MISSING
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scoreData.whatsMissing.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Improvements */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
            RECOMMENDED HIGH-IMPACT REFINEMENTS
          </h4>
          <div className="space-y-2">
            {scoreData.topImprovements.map((imp) => (
              <div
                key={imp.id}
                className="p-3 rounded-xl bg-[#0F121A] border border-white/[0.08] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white">{imp.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${
                        imp.impact === 'critical'
                          ? 'bg-red-950/50 text-red-400 border border-red-500/30'
                          : 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {imp.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{imp.action}</p>
                </div>
                {imp.applied ? (
                  <span className="text-emerald-400 text-xs font-mono font-bold shrink-0">
                    APPLIED ✓
                  </span>
                ) : (
                  <button
                    onClick={onOptimize}
                    className="text-[#00E5FF] hover:underline font-mono text-xs shrink-0 flex items-center gap-1"
                  >
                    Apply &rarr;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
          <p className="text-[11px] font-mono text-slate-400">
            Assessment generated by EDC Media Conversion Intelligence Engine. Never claims arbitrary guarantees.
          </p>
        </div>
      </div>
    </div>
  );
}
