'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Calendar,
  DollarSign,
  UserCheck,
  Package,
  Layers,
  Flame,
  Globe,
  Compass,
} from 'lucide-react';
import { BusinessProfile, GoalType, LandingPage } from '@/types/landing-engine';
import { analytics } from '@/lib/analytics';
import { PRESET_EXAMPLES } from '@/lib/edc-data';

interface LandingPageBuilderProps {
  onPageGenerated: (page: LandingPage) => void;
  presetProfile?: BusinessProfile | null;
}

const GOAL_OPTIONS: { id: GoalType; label: string; icon: React.ElementType }[] = [
  { id: 'calls', label: 'Get Calls', icon: Phone },
  { id: 'leads', label: 'Get Leads', icon: UserCheck },
  { id: 'appointments', label: 'Book Appointments', icon: Calendar },
  { id: 'sales', label: 'Make Sales', icon: DollarSign },
  { id: 'signups', label: 'Collect Signups', icon: Sparkles },
  { id: 'product', label: 'Promote a Product', icon: Package },
  { id: 'service', label: 'Promote a Service', icon: Layers },
  { id: 'other', label: 'Other Action', icon: ArrowRight },
];

const GENERATION_STEPS = [
  { id: '01', title: 'UNDERSTANDING BUSINESS', desc: 'Business identified & categorized' },
  { id: '02', title: 'DEFINING CUSTOMER', desc: 'Target audience intent modeled' },
  { id: '03', title: 'BUILDING OFFER', desc: 'Value proposition & positioning established' },
  { id: '04', title: 'ARCHITECTING PAGE', desc: 'Conversion structure & section hierarchy created' },
  { id: '05', title: 'WRITING COPY', desc: 'Direct-response messaging generated' },
  { id: '06', title: 'OPTIMIZING CTA', desc: 'Action anchors & friction removal tuned' },
  { id: '07', title: 'FINAL QUALITY CHECK', desc: 'Conversion readiness verified' },
];

export function LandingPageBuilder({
  onPageGenerated,
  presetProfile,
}: LandingPageBuilderProps) {
  const [profile, setProfile] = useState<BusinessProfile>(() => presetProfile || {
    name: '',
    offer: '',
    targetAudience: '',
    primaryGoal: 'leads',
    websiteUrl: '',
    serviceArea: '',
    uniqueHook: '',
    pricingHint: '',
  });

  const [showOptionalFields, setShowOptionalFields] = useState(() =>
    Boolean(presetProfile?.serviceArea || presetProfile?.uniqueHook)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

  const handleGoalSelect = (goal: GoalType) => {
    setProfile((prev) => ({ ...prev, primaryGoal: goal }));
    analytics.track('builder_started', { selectedGoal: goal });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.offer.trim()) {
      setGenerationError('Please provide your business name and what you sell.');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    setCurrentStepIndex(0);
    analytics.track('generation_started', { businessName: profile.name });

    // Progress animation for telemetry
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    stepIntervalRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < GENERATION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 650);

    try {
      const res = await fetch('/api/landing-engine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      const data = await res.json();
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);

      if (!res.ok || !data.page) {
        throw new Error(data.error || 'Failed to generate landing page');
      }

      // Show completed step state briefly for UX satisfaction
      setCurrentStepIndex(GENERATION_STEPS.length);
      analytics.track('generation_completed', { pageId: data.page.id });

      setTimeout(() => {
        setIsGenerating(false);
        onPageGenerated(data.page);
      }, 700);
    } catch (err: any) {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      setIsGenerating(false);
      setGenerationError(
        err.message || 'Something interrupted page generation. Your information is safe. Try generating again.'
      );
      analytics.track('generation_failed', { error: err.message });
    }
  };

  return (
    <section
      id="builder-section"
      className="py-20 sm:py-28 relative scroll-mt-20 bg-[#07090E]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-[#00E5FF]/20 text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
            <Flame className="w-3 h-3 text-[#00E5FF]" />
            CONVERSION ENGINE // 60-SECOND GENERATOR
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            BUILD YOUR LANDING PAGE
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Tell us what you&apos;re selling. We&apos;ll build the conversion-focused foundation.
          </p>
        </div>

        {/* Builder Container */}
        <div className="rounded-2xl bg-[#0A0D14] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-10 relative overflow-hidden">
          {/* Subtle accent border at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

          {/* Quick presets pills */}
          <div className="mb-8 pb-6 border-b border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                QUICK LOAD VERIFIED EXAMPLES:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Click any preset to populate fields
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_EXAMPLES.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setProfile(preset.profile);
                    setShowOptionalFields(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.08] hover:border-[#00E5FF]/50 text-xs text-slate-300 hover:text-white transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Form or Generation State */}
          {!isGenerating ? (
            <form onSubmit={handleGenerate} className="space-y-7">
              {/* Row 1: Business Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  BUSINESS / PRODUCT NAME <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Emergency Plumbing, SignalFlow AI, or FounderScale"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all text-sm font-medium"
                />
              </div>

              {/* Row 2: What are you selling? */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  WHAT ARE YOU SELLING? <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24/7 burst pipe repair and emergency plumbing dispatch"
                  value={profile.offer}
                  onChange={(e) => setProfile({ ...profile, offer: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all text-sm font-medium"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Be direct and concrete. The clearer the offer, the sharper the generated copy.
                </p>
              </div>

              {/* Row 3: Who is it for? */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  WHO IS IT FOR? <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homeowners in panic with active leaks, or Series-A tech founders"
                  value={profile.targetAudience}
                  onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all text-sm font-medium"
                />
              </div>

              {/* Row 4: Primary Goal Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2.5">
                  WHAT DO YOU WANT VISITORS TO DO? (PRIMARY GOAL)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GOAL_OPTIONS.map((g) => {
                    const Icon = g.icon;
                    const isSelected = profile.primaryGoal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGoalSelect(g.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                            : 'bg-[#0F121A] border-white/[0.08] text-slate-400 hover:border-white/[0.2] hover:text-slate-200'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? 'text-[#00E5FF]' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-xs font-semibold">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Progressive Disclosure Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="text-xs font-mono text-slate-400 hover:text-[#00E5FF] flex items-center gap-2 py-1 transition-colors"
                >
                  {showOptionalFields ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {showOptionalFields
                      ? 'Hide additional strategy fields'
                      : '+ Add optional details (Service Area, Unique Hook, Pricing)'}
                  </span>
                </button>

                {showOptionalFields && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        SERVICE AREA / GEOGRAPHY (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Austin Metro Area or Remote Worldwide"
                        value={profile.serviceArea || ''}
                        onChange={(e) => setProfile({ ...profile, serviceArea: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F121A] border border-white/[0.08] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        UNIQUE HOOK OR GUARANTEE (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. On-site in 45 minutes or diagnostic is 100% free"
                        value={profile.uniqueHook || ''}
                        onChange={(e) => setProfile({ ...profile, uniqueHook: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F121A] border border-white/[0.08] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        PRICING HINT / STARTING PRICE (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Flat $99 diagnostic or Free Initial Audit"
                        value={profile.pricingHint || ''}
                        onChange={(e) => setProfile({ ...profile, pricingHint: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F121A] border border-white/[0.08] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        CURRENT WEBSITE URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={profile.websiteUrl || ''}
                        onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F121A] border border-white/[0.08] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Banner if any */}
              {generationError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200">
                    <p className="font-semibold mb-0.5">Generation Interrupted</p>
                    <p>{generationError}</p>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_35px_rgba(0,229,255,0.45)] hover:scale-[1.01] active:scale-[0.99]"
                  id="builder-generate-submit-btn"
                >
                  <Sparkles className="w-4 h-4" />
                  GENERATE CONVERSION-OPTIMIZED PAGE (~60 SEC)
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2.5 font-mono">
                  Engineered around the visitor journey: Attention → Clarity → Trust → Action
                </p>
              </div>
            </form>
          ) : (
            /* Real-Time Generation Experience */
            <div className="py-8 sm:py-12 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-[#00E5FF] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      EDC LANDING ENGINE IN PROGRESS
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Generating high-converting architecture for {profile.name}...
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-[#00E5FF]">
                  STAGE {Math.min(currentStepIndex + 1, GENERATION_STEPS.length)} / {GENERATION_STEPS.length}
                </div>
              </div>

              {/* Step by step telemetry rows */}
              <div className="space-y-3 font-mono">
                {GENERATION_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isPending = idx > currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : isCurrent
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF]/50 text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                          : 'bg-[#0F121A]/50 border-white/[0.04] text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold ${
                            isCompleted
                              ? 'text-emerald-400'
                              : isCurrent
                              ? 'text-[#00E5FF]'
                              : 'text-slate-600'
                          }`}
                        >
                          {step.id} /
                        </span>
                        <div>
                          <p className="text-xs font-semibold">{step.title}</p>
                          <p className="text-[11px] opacity-80">{step.desc}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-xs">
                        {isCompleted && (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                        {isCurrent && (
                          <span className="flex items-center gap-1.5 text-[#00E5FF] animate-pulse font-semibold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>PROCESSING</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="text-slate-600 text-[11px]">QUEUED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentStepIndex >= GENERATION_STEPS.length && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center animate-in fade-in">
                  <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
                    ✓ YOUR LANDING PAGE IS READY. REVEALING WORKSPACE...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
