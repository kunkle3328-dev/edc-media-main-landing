'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Undo2,
  Eye,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { OptimizationRun, LandingPage } from '@/types/landing-engine';
import { LandingPageRenderer } from './LandingPageRenderer';

interface OptimizationPreviewModalProps {
  optimizationRun: OptimizationRun | null;
  currentPage: LandingPage;
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization: (proposedPage: LandingPage, changeReason: string, summary: string) => void;
}

export function OptimizationPreviewModal({
  optimizationRun,
  currentPage,
  isOpen,
  onClose,
  onApplyOptimization,
}: OptimizationPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'after' | 'before'>('changes');

  if (!isOpen || !optimizationRun) return null;

  const scoreBefore = optimizationRun.scoreBefore;
  const scoreAfter = optimizationRun.scoreAfter;
  const scoreDelta = scoreAfter - scoreBefore;

  const handleApply = () => {
    const summary = optimizationRun.proposedChanges
      .map((c) => c.changeDescription)
      .join('; ');
    onApplyOptimization(
      optimizationRun.proposedPage,
      'EDC AI Optimization Applied',
      summary || 'Applied conversion improvements across hero, CTA, and friction points.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0F121A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-wide">
                  OPTIMIZATION CANDIDATE PROPOSAL
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-semibold">
                  BEFORE/AFTER VERIFICATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verify AI improvements before committing changes to your active page.
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Delta Banner */}
        <div className="px-6 py-3 bg-[#07090E] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Current Score
                </span>
                <span className="text-lg font-mono font-bold text-slate-300">
                  {scoreBefore}/100
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-500" />

              <div className="text-center">
                <span className="text-[10px] font-mono text-[#00E5FF] uppercase block">
                  Optimized Score
                </span>
                <span className="text-lg font-mono font-bold text-[#00E5FF]">
                  {scoreAfter}/100
                </span>
              </div>

              {scoreDelta > 0 && (
                <div className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  +{scoreDelta} POINTS LIFT
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />

            <div className="text-xs text-slate-400 hidden md:block">
              <span className="text-white font-medium">
                {optimizationRun.proposedChanges.length} Targeted Improvements
              </span>{' '}
              ready to apply without breaking existing copy.
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#0F121A] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('changes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'changes'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Proposed Changes</span>
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'after'
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview After</span>
            </button>
            <button
              onClick={() => setActiveTab('before')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'before'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Current Before</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[380px] max-h-[55vh]">
          {activeTab === 'changes' && (
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Actionable Modifications Applied to Candidate:</span>
              </div>

              <div className="grid gap-3">
                {optimizationRun.proposedChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F121A] border border-white/[0.08] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          {change.sectionType.replace('_', ' ')} SECTION
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        HIGH CONVERSION IMPACT
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 font-medium">
                      {change.changeDescription}
                    </p>

                    {/* Diff Inspection */}
                    {change.before && change.after && (
                      <div className="mt-2 pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04]">
                          <span className="text-[10px] font-mono text-rose-400/80 uppercase block mb-1">
                            Before (Current State):
                          </span>
                          <p className="text-slate-400 font-sans line-clamp-2">
                            {typeof change.before === 'string'
                              ? change.before
                              : change.before.primaryCTA || change.before.headline || JSON.stringify(change.before)}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#00E5FF]/5 border border-[#00E5FF]/20">
                          <span className="text-[10px] font-mono text-[#00E5FF] uppercase block mb-1">
                            After (Optimized State):
                          </span>
                          <p className="text-white font-sans font-medium line-clamp-2">
                            {typeof change.after === 'string'
                              ? change.after
                              : change.after.primaryCTA || change.after.headline || JSON.stringify(change.after)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#0F121A]/60 border border-emerald-500/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">
                    Safe Versioning Commitment:
                  </span>
                  <span className="text-slate-400">
                    Clicking &ldquo;Apply & Create Version&rdquo; will automatically snapshot your current page as a historical version in local storage. You can rollback or compare at any time from Version History.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'after' && (
            <div className="rounded-xl border border-white/[0.1] bg-[#07090E] overflow-hidden p-2">
              <div className="text-[11px] font-mono text-[#00E5FF] px-4 py-2 border-b border-white/[0.08] flex items-center justify-between">
                <span>VIEWING CANDIDATE: OPTIMIZED VERSION ({scoreAfter}/100)</span>
                <span className="text-emerald-400">● LIVE PREVIEW READY</span>
              </div>
              <div className="max-h-[460px] overflow-y-auto">
                <LandingPageRenderer page={optimizationRun.proposedPage} />
              </div>
            </div>
          )}

          {activeTab === 'before' && (
            <div className="rounded-xl border border-white/[0.1] bg-[#07090E] overflow-hidden p-2">
              <div className="text-[11px] font-mono text-slate-400 px-4 py-2 border-b border-white/[0.08] flex items-center justify-between">
                <span>VIEWING BASELINE: CURRENT ACTIVE VERSION ({scoreBefore}/100)</span>
                <span>● CURRENT ACTIVE</span>
              </div>
              <div className="max-h-[460px] overflow-y-auto opacity-90">
                <LandingPageRenderer page={currentPage} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#0F121A]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Undo2 className="w-4 h-4" />
            <span>DISCARD / REVERT</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>APPLY & CREATE VERSION (+{scoreDelta} PTS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
