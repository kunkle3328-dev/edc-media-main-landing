'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Terminal,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Phone,
  Calendar,
  UserCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { BusinessProfile } from '@/types/landing-engine';

interface HeroSectionProps {
  onStartWithPreset: (profile: BusinessProfile) => void;
  onScrollToBuilder: () => void;
}

interface DemoScenario {
  id: string;
  name: string;
  category: string;
  inputOffer: string;
  targetAudience: string;
  goal: string;
  strategy: {
    intent: 'High / Emergency' | 'High / Scheduled' | 'Medium / Evaluation';
    buyingContext: string;
    primaryBarrier: string;
    recommendedCTA: string;
  };
  architecture: string[];
  mockPage: {
    badge: string;
    headline: string;
    subheadline: string;
    primaryCTA: string;
    proofTag: string;
    urgencyText: string;
  };
  profile: BusinessProfile;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'hvac',
    name: 'Apex Rapid HVAC',
    category: 'Home Services / Emergency',
    inputOffer: '24/7 emergency AC & heating repair with guaranteed 45-minute dispatch.',
    targetAudience: 'Homeowners in Greater Metro facing sudden system failures.',
    goal: 'Direct Phone Calls & Fast Estimate Requests',
    strategy: {
      intent: 'High / Emergency',
      buyingContext: 'Immediate discomfort, acute urgency, fear of being overcharged',
      primaryBarrier: 'Pricing uncertainty and technician unreliability',
      recommendedCTA: 'Dispatch Technician / Call Priority Line',
    },
    architecture: ['Urgent Problem Anchor', 'Guaranteed Arrival Time', 'Clear Pricing Model', 'Verified Local Licenses', 'FAQ / Warranty', 'Click-to-Call Emergency Bar'],
    mockPage: {
      badge: 'GUARANTEED 45-MIN DISPATCH • 24/7 ON-CALL',
      headline: 'Emergency AC Down? A Certified Tech at Your Door in 45 Mins.',
      subheadline: 'Upfront flat-rate pricing before work starts. No midnight surcharges, 100% satisfaction guarantee.',
      primaryCTA: 'DISPATCH ON-CALL TECH',
      proofTag: 'Licensed • Insured • 1,420+ 5-Star Homeowner Repairs',
      urgencyText: 'Current on-call dispatch delay: Under 40 minutes',
    },
    profile: {
      name: 'Apex Rapid HVAC',
      offer: '24/7 emergency AC & heating repair with guaranteed 45-minute dispatch.',
      targetAudience: 'Homeowners facing sudden heating/cooling system failures.',
      primaryGoal: 'calls',
      serviceArea: 'Greater Metropolitan Area',
      uniqueHook: '45-minute guaranteed dispatch or diagnosis fee waived.',
      pricingHint: 'Flat-rate transparent diagnostics, $0 dispatch fee with repair.',
    },
  },
  {
    id: 'dental',
    name: 'Aura Smile Studio',
    category: 'Healthcare / Elective',
    inputOffer: 'Same-day porcelain veneer consultations and full digital smile preview.',
    targetAudience: 'Professionals seeking natural aesthetic smile transformation.',
    goal: 'Book Smile Preview Appointment',
    strategy: {
      intent: 'High / Scheduled',
      buyingContext: 'High investment, self-image sensitivity, fear of unnatural results',
      primaryBarrier: 'Fear of pain, irreversible tooth shaving, or artificial appearance',
      recommendedCTA: 'Reserve 3D Digital Smile Simulation',
    },
    architecture: ['Visual Transformation Proof', 'Minimally-Invasive Method', 'Doctor Credentials', 'Patient Video Stories', 'Transparent Payment Options', 'Private Consultation Booking'],
    mockPage: {
      badge: 'CUSTOM DIGITAL SMILE PREVIEW • NO DRILL CONSULTATION',
      headline: 'See Your Final Smile in 3D Before Touching a Single Tooth.',
      subheadline: 'Bespoke hand-crafted ultra-thin porcelain veneers designed specifically for your facial geometry.',
      primaryCTA: 'RESERVE 3D SMILE PREVIEW',
      proofTag: 'Board Certified AACD Specialists • 0% Financing Available',
      urgencyText: 'Only 8 new patient consultation slots released weekly',
    },
    profile: {
      name: 'Aura Smile Studio',
      offer: 'Same-day porcelain veneer consultations and full digital smile preview.',
      targetAudience: 'Adults seeking natural cosmetic smile enhancements.',
      primaryGoal: 'appointments',
      serviceArea: 'Downtown Financial District',
      uniqueHook: 'See your real smile in photorealistic 3D before committing.',
      pricingHint: 'Flexible 0% interest monthly payment options from $189/mo.',
    },
  },
  {
    id: 'saas',
    name: 'Fortress Key',
    category: 'B2B Software / Security',
    inputOffer: 'Automated continuous SOC 2 & ISO 27001 compliance audit platform for startups.',
    targetAudience: 'CTOs, VP Engineering, and security leads closing enterprise deals.',
    goal: 'Interactive Sandbox Demo & Evidence Audit',
    strategy: {
      intent: 'Medium / Evaluation',
      buyingContext: 'Enterprise deals blocked by security questionnaires, high vendor fatigue',
      primaryBarrier: 'Audit fatigue, long engineering setup times, hidden manual work',
      recommendedCTA: 'Run Free 15-Minute Audit Readiness Scan',
    },
    architecture: ['Pain Point: Blocked Enterprise Deals', 'Automated Evidence Collection', 'Auditor Integration Proof', 'Interactive Dashboard Preview', 'Security FAQ', 'Self-Serve Audit Scan'],
    mockPage: {
      badge: 'FAST-TRACK SOC 2 TYPE II • ZERO SPREADSHEETS',
      headline: 'Unblock Enterprise Deals. Pass SOC 2 in Under 14 Days.',
      subheadline: 'Connect your AWS, GitHub, and Okta. Automated evidence collection with auditor pre-approval built in.',
      primaryCTA: 'RUN FREE AUDIT READINESS SCAN',
      proofTag: 'Pre-vetted by Top 20 AICPA Certified Auditor Firms',
      urgencyText: 'Average time to audit readiness: 11 business days',
    },
    profile: {
      name: 'Fortress Key',
      offer: 'Automated continuous SOC 2 & ISO 27001 compliance platform for tech startups.',
      targetAudience: 'CTOs, VP Engineering, and compliance officers.',
      primaryGoal: 'leads',
      serviceArea: 'Global Cloud (Remote)',
      uniqueHook: 'Pass SOC 2 Type II in 14 days with zero manual screenshotting.',
      pricingHint: 'Starts at $499/mo for seed-stage startups.',
    },
  },
];

export function HeroSection({
  onStartWithPreset,
  onScrollToBuilder,
}: HeroSectionProps) {
  const [selectedDemo, setSelectedDemo] = useState<DemoScenario>(DEMO_SCENARIOS[0]);

  return (
    <section
      id="hero-section"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden border-b border-white/[0.06]"
    >
      {/* Subtle Background Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#161B26_1px,transparent_1px)] [background-size:32px_32px] opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-[#00E5FF]/[0.035] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Core Hero Text */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0F121A] border border-white/[0.1] mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-300">
              EDC MEDIA LANDING ENGINE™ • BUILD 04.2
            </span>
          </div>

          {/* Headline - Specification 14 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            BUILD LANDING PAGES THAT KNOW WHAT THEY&apos;RE SUPPOSED TO DO.
          </h1>

          {/* Supporting Copy - Specification 14 */}
          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto mb-8">
            EDC Media analyzes your offer, audience, buying context, objections, and conversion goal — then builds, scores, publishes, and helps optimize the page around the action you actually want visitors to take.
          </p>

          {/* Primary & Secondary Action CTAs - Specification 14 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onScrollToBuilder}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-200 hover:shadow-[0_0_35px_rgba(0,229,255,0.45)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer touch-manipulation"
              id="hero-primary-cta"
            >
              <Sparkles className="w-4 h-4" />
              <span>BUILD MY LANDING PAGE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('hero-demo-section');
                if (el) {
                  const navbar = document.getElementById('edc-navbar');
                  const navHeight = navbar ? navbar.getBoundingClientRect().height : 70;
                  const targetTop = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
                  window.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#0F121A] border border-white/[0.12] text-slate-200 font-semibold text-sm tracking-wider uppercase hover:border-white/[0.25] hover:text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              id="hero-secondary-cta"
            >
              <span>SEE IT IN ACTION</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* HERO PRODUCT DEMO - Specification 15 */}
        <div id="hero-demo-section" className="pt-6">
          <div className="rounded-2xl border border-white/[0.12] bg-[#0A0D14] shadow-2xl overflow-hidden">
            {/* Top Bar / Scenario Switcher */}
            <div className="p-4 sm:p-5 bg-[#0F121A] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300 ml-2">
                  LIVE CONVERSION STRATEGY DEMONSTRATION
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {DEMO_SCENARIOS.map((scenario) => {
                  const isActive = selectedDemo.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setSelectedDemo(scenario)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer touch-manipulation ${
                        isActive
                          ? 'bg-[#00E5FF] text-[#07090E] font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                          : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white'
                      }`}
                    >
                      {scenario.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo Body Grid: Strategy & Architecture (Left) vs Rendered Page Output (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
              {/* Left Column: Input, Strategy, Architecture (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 space-y-5 bg-[#0A0D14]">
                {/* 1. INPUT */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    <span>01. BUSINESS OFFER INPUT</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08]">
                    <div className="text-sm font-semibold text-white mb-1">
                      {selectedDemo.inputOffer}
                    </div>
                    <div className="text-xs text-slate-400">
                      Target Audience: <span className="text-slate-200">{selectedDemo.targetAudience}</span>
                    </div>
                  </div>
                </div>

                {/* 2. STRATEGY REVEAL */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3" />
                    <span>02. CONVERSION STRATEGY</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08] space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Primary Goal:</span>
                      <span className="font-semibold text-white">{selectedDemo.goal}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Visitor Intent:</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedDemo.strategy.intent}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Buying Context:</span>
                      <span className="text-slate-200 text-right max-w-[200px]">{selectedDemo.strategy.buyingContext}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Primary Barrier:</span>
                      <span className="text-amber-300 text-right max-w-[200px]">{selectedDemo.strategy.primaryBarrier}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Recommended CTA:</span>
                      <span className="text-[#00E5FF] font-semibold text-right max-w-[200px]">{selectedDemo.strategy.recommendedCTA}</span>
                    </div>
                  </div>
                </div>

                {/* 3. ARCHITECTURE FLOW */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    <span>03. SECTION CONVERSION ARCHITECTURE</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDemo.architecture.map((sec, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                      >
                        <span className="text-[#00E5FF] text-[9px] font-bold">{idx + 1}</span>
                        <span>{sec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pre-fill Action */}
                <div className="pt-2">
                  <button
                    onClick={() => onStartWithPreset(selectedDemo.profile)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-emerald-500/20 hover:from-[#00E5FF]/30 hover:to-emerald-500/30 border border-[#00E5FF]/40 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Use This {selectedDemo.name} Model</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Real Rendered Landing Page Preview (7 cols) */}
              <div className="lg:col-span-7 p-5 sm:p-7 bg-[#07090E] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>RENDERED PAGE PREVIEW</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Viewport: 100% Responsive
                    </span>
                  </div>

                  {/* Rendered Mock Page Card */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0F121A] to-[#0A0D14] border border-white/[0.12] shadow-xl">
                    {/* Badge */}
                    <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] font-mono font-bold tracking-wider text-[#00E5FF] mb-4">
                      {selectedDemo.mockPage.badge}
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
                      {selectedDemo.mockPage.headline}
                    </h3>

                    {/* Subheadline */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      {selectedDemo.mockPage.subheadline}
                    </p>

                    {/* Primary CTA + Urgency Notice */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                      <button
                        onClick={() => onStartWithPreset(selectedDemo.profile)}
                        className="px-6 py-3 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2"
                      >
                        <span>{selectedDemo.mockPage.primaryCTA}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>{selectedDemo.mockPage.urgencyText}</span>
                      </span>
                    </div>

                    {/* Trust Proof Bar */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{selectedDemo.mockPage.proofTag}</span>
                    </div>
                  </div>
                </div>

                {/* Score Teaser */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Readiness Score:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      94/100 CONVERSION READY
                    </span>
                  </div>
                  <button
                    onClick={() => onStartWithPreset(selectedDemo.profile)}
                    className="text-[#00E5FF] hover:underline font-mono text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Generate full version for this model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
