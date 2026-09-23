'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  X,
  Sparkles,
  Cpu,
  CheckCircle2,
  Phone,
  Calendar,
  DollarSign,
  UserCheck,
  Scale,
  ShoppingBag,
  Briefcase,
} from 'lucide-react';
import { BusinessProfile } from '@/types/landing-engine';

interface BuiltByEDCSectionProps {
  onLoadProjectPreset?: (profile: BusinessProfile) => void;
}

interface IndustryArchitectureDemo {
  id: string;
  industry: string;
  icon: React.ElementType;
  exampleBusiness: string;
  offerInput: string;
  goal: string;
  buyerContext: string;
  primaryBarrier: string;
  recommendedCTA: string;
  architectureFlow: string[];
  mockHeadline: string;
  mockSubheadline: string;
  mockProofBadge: string;
  profile: BusinessProfile;
}

const INDUSTRY_DEMOS: IndustryArchitectureDemo[] = [
  {
    id: 'hvac',
    industry: 'HVAC & Home Services',
    icon: Phone,
    exampleBusiness: 'Apex Rapid Climate',
    offerInput: '24/7 emergency AC repair with 45-min arrival guarantee',
    goal: 'Urgent Phone Calls',
    buyerContext: 'Acute discomfort, extreme urgency, price gouging anxiety',
    primaryBarrier: 'Fear of unexpected midnight rates & unvetted strangers',
    recommendedCTA: 'Call Emergency Dispatch: (555) 019-2834',
    architectureFlow: ['Emergency Problem Banner', 'Guaranteed Arrival Time', 'Fixed Diagnostic Fee', 'Licensed & Insured Proof', 'Click-to-Call Sticky Bar'],
    mockHeadline: 'AC Broken in the Heat? Emergency Dispatch at Your Door in 45 Mins.',
    mockSubheadline: 'Upfront flat-rate pricing before our tech touches a tool. Zero overtime charges.',
    mockProofBadge: 'Licensed HVAC Techs • 1,400+ Emergency Repairs Completed',
    profile: {
      name: 'Apex Rapid Climate',
      offer: '24/7 emergency AC repair with guaranteed 45-min arrival',
      targetAudience: 'Homeowners experiencing system outages',
      primaryGoal: 'calls',
      serviceArea: 'Metro Region',
      uniqueHook: '45-minute guaranteed arrival or diagnostic is free.',
    },
  },
  {
    id: 'dental',
    industry: 'Cosmetic Dentistry',
    icon: Calendar,
    exampleBusiness: 'Aura Smile Studio',
    offerInput: 'Same-day porcelain veneer digital 3D preview & consultation',
    goal: 'Book Digital Smile Preview',
    buyerContext: 'High emotional investment, aesthetic fear, pain aversion',
    primaryBarrier: 'Fear of unnatural fake teeth or aggressive tooth shaving',
    recommendedCTA: 'Reserve 3D Smile Simulation',
    architectureFlow: ['Before / After Smile Gallery', 'Minimally-Invasive Method', 'AACD Accredited Credentials', 'Patient Video Testimonials', '0% Financing Calculator', 'Private Suite Booking'],
    mockHeadline: 'See Your New Natural Smile in 3D Before Any Procedure Begins.',
    mockSubheadline: 'Ultra-thin hand-layered porcelain veneers custom engineered for your unique facial profile.',
    mockProofBadge: 'Accredited Cosmetic Masters • 10-Year Craftsmanship Guarantee',
    profile: {
      name: 'Aura Smile Studio',
      offer: 'Same-day porcelain veneer 3D preview and custom smile design',
      targetAudience: 'Adults looking for natural cosmetic smile enhancement',
      primaryGoal: 'appointments',
      serviceArea: 'Financial District',
      uniqueHook: 'Virtual 3D preview of your smile before touching a tooth.',
    },
  },
  {
    id: 'legal',
    industry: 'Legal Services',
    icon: Scale,
    exampleBusiness: 'Vanguard Injury Counsel',
    offerInput: 'Free confidential case evaluation for commercial vehicle accident victims',
    goal: 'Confidential Case Intake Form',
    buyerContext: 'Distress, medical bills, aggressive insurance adjusters',
    primaryBarrier: 'Concern over upfront retainer fees & legal complexity',
    recommendedCTA: 'Request Free Case Assessment ($0 Upfront)',
    architectureFlow: ['Authority & Settlement Proof', 'Zero Out-of-Pocket Fee Guarantee', 'Case Qualification Form', 'Immediate Next Steps Checklist', 'Confidentiality Pledge'],
    mockHeadline: 'Injured in a Commercial Collision? We Take on the Insurance Giants.',
    mockSubheadline: 'No attorney fees unless we recover compensation for your medical expenses and damages.',
    mockProofBadge: '$48M+ Recovered for Injured Clients • Contingency Fee Only',
    profile: {
      name: 'Vanguard Injury Counsel',
      offer: 'Free confidential case evaluation for personal injury and accident victims',
      targetAudience: 'Accident victims seeking fair insurance settlements',
      primaryGoal: 'leads',
      serviceArea: 'Statewide',
      uniqueHook: '100% contingency fee model: No recovery, no fee.',
    },
  },
  {
    id: 'saas',
    industry: 'B2B SaaS / Security',
    icon: Zap,
    exampleBusiness: 'Fortress Key Compliance',
    offerInput: 'Automated continuous SOC 2 & ISO 27001 evidence collection platform',
    goal: 'Interactive Sandbox Demo',
    buyerContext: 'Enterprise deals stalled by 50-page security questionnaires',
    primaryBarrier: 'Audit fatigue, long setup times, hidden manual engineering labor',
    recommendedCTA: 'Run Instant 15-Minute Readiness Scan',
    architectureFlow: ['Unblock Revenue Pain Point', 'One-Click Cloud Integrations', 'Auditor-Approved Evidence Engine', 'Interactive Sandbox Walkthrough', 'Self-Serve Audit Scan'],
    mockHeadline: 'Unblock Enterprise Pipeline. Pass SOC 2 Type II in 14 Days.',
    mockSubheadline: 'Zero spreadsheets or manual screenshots. Continuous automated evidence collection with top auditor pre-approval.',
    mockProofBadge: 'Pre-Approved by Top 20 AICPA Audit Firms • 99.8% Pass Rate',
    profile: {
      name: 'Fortress Key Compliance',
      offer: 'Automated continuous SOC 2 and ISO 27001 compliance audit platform',
      targetAudience: 'CTOs, security engineers, and enterprise B2B founders',
      primaryGoal: 'signups',
      serviceArea: 'Global Cloud',
      uniqueHook: 'Audit readiness in 14 days without engineering disruption.',
    },
  },
  {
    id: 'agency',
    industry: 'Growth Marketing Agency',
    icon: Briefcase,
    exampleBusiness: 'Catalyst Direct Performance',
    offerInput: 'Paid media acquisition management with guaranteed ROAS benchmarks',
    goal: 'Book Strategy Architecture Call',
    buyerContext: 'Burned by previous agencies that delivered impressions instead of revenue',
    primaryBarrier: 'Skepticism of agency retainers with zero accountability',
    recommendedCTA: 'Claim Paid Media Funnel Audit',
    architectureFlow: ['Performance Guarantee Terms', 'Live Account Breakdowns', 'Creative Fatigue Solution', 'Senior Partner Delivery Model', 'Private Funnel Audit Form'],
    mockHeadline: 'Stop Burning Ad Spend on Agencies That Celebrate Impressions.',
    mockSubheadline: 'We engineer end-to-end paid acquisition funnels tied strictly to pipeline revenue and validated ROAS.',
    mockProofBadge: 'Performance-Guaranteed Contracts • Senior Operators Only',
    profile: {
      name: 'Catalyst Direct Performance',
      offer: 'Paid media performance acquisition management with ROAS guarantees',
      targetAudience: 'E-commerce & SaaS businesses scaling from $1M to $10M ARR',
      primaryGoal: 'appointments',
      serviceArea: 'North America',
      uniqueHook: 'ROAS performance-tied contracts with dedicated senior media buyers.',
    },
  },
  {
    id: 'ecommerce',
    industry: 'Direct-to-Consumer / E-commerce',
    icon: ShoppingBag,
    exampleBusiness: 'Solara Rest Ergonomics',
    offerInput: 'Therapeutic contoured cervical pillow with 100-night risk-free trial',
    goal: 'Direct Product Purchase',
    buyerContext: 'Chronic neck stiffness, tired of failed sleep products',
    primaryBarrier: 'Reluctance to buy an unfamiliar physical product online',
    recommendedCTA: 'Order With 100-Night Sleep Trial',
    architectureFlow: ['Anatomical Problem Illustration', 'Ergonomic Memory Core Technology', 'Orthopedic Endorsements', '100-Night Sleep Trial Pledge', 'Frictionless One-Click Checkout'],
    mockHeadline: 'Wake Up Free of Morning Neck Pain. Guaranteed in 10 Nights.',
    mockSubheadline: 'Engineered with dual-density orthopedic foam to align your cervical spine whether you sleep on your back or side.',
    mockProofBadge: '100-Night Risk-Free Sleep Trial • Free Return Shipping',
    profile: {
      name: 'Solara Rest Ergonomics',
      offer: 'Orthopedic cervical alignment sleep pillow with 100-night trial',
      targetAudience: 'Adults suffering from morning neck stiffness and poor posture',
      primaryGoal: 'sales',
      serviceArea: 'Direct Shipping Nationwide',
      uniqueHook: 'Try it for 100 nights in your own bed; full refund if not pain-free.',
    },
  },
];

const REAL_PORTFOLIO_SYSTEMS = [
  {
    id: 'landing-engine',
    title: 'EDC Media Landing Engine™',
    category: 'Flagship Core Product',
    tagline: 'Conversion-focused landing page creation, optimization, publishing, and lead intelligence platform.',
    architecture: 'Multi-tenant engine with draft/published versioning, 5-dimension readiness scoring, and sub-second edge hosting.',
  },
  {
    id: 'opportunity-engine',
    title: 'EDC Opportunity Engine',
    category: 'Market Intelligence & Outreach',
    tagline: 'High-intent prospect identification, market gap auditing, and automated opportunity scoring.',
    architecture: 'Algorithmic prospect filtering, lead prioritization queue, and personalized multi-channel outreach dispatch.',
  },
  {
    id: 'revenue-factory',
    title: 'Revenue Factory',
    category: 'Monetization Architecture',
    tagline: 'Integrated digital revenue pipeline connecting paid traffic, pricing models, and automated upsell systems.',
    architecture: 'Dynamic checkout pipelines, revenue attribution telemetry, and automated customer lifetime value loops.',
  },
  {
    id: 'aura-receptionist',
    title: 'AURA AI Receptionist',
    category: 'Autonomous Voice & Inbound Ops',
    tagline: 'Intelligent conversational voice agent handling phone bookings, emergency triage, and qualification.',
    architecture: 'Sub-second speech-to-speech processing, real-time calendar synchronization, and CRM lead capture.',
  },
  {
    id: 'voice-agent-os',
    title: 'EDC Voice Agent OS',
    category: 'Voice Infrastructure Platform',
    tagline: 'Operating system for deploying, tuning, and monitoring domain-specific autonomous voice representatives.',
    architecture: 'Low-latency streaming audio pipelines, custom intent routing trees, and telephone telephony bridge.',
  },
  {
    id: 'subscription-manager',
    title: 'AI Subscription Manager',
    category: 'SaaS Finance & Retention',
    tagline: 'Automated recurring revenue monitoring, churn prediction, and subscription lifecycle orchestration.',
    architecture: 'Stripe/billing webhook ingest, churn risk scoring models, and retention win-back sequences.',
  },
  {
    id: 'wonderworld',
    title: 'WONDERWORLD',
    category: 'Interactive Consumer Experience',
    tagline: 'High-engagement interactive digital brand universe designed for customer retention and immersion.',
    architecture: 'Canvas-rendered interactive UI, dynamic character states, and gamified engagement telemetry.',
  },
  {
    id: 'publishing-engine',
    title: 'EDC Publishing Engine',
    category: 'Edge Content & Distribution',
    tagline: 'Multi-channel publication framework distributing high-intent programmatic content across web properties.',
    architecture: 'Dynamic static site generation, automated meta generation, and distributed CDN edge caching.',
  },
  {
    id: 'pocket-ai',
    title: 'EDC Pocket AI / J.A.R.V.I.S. / NEXUS',
    category: 'Internal Autonomous Operating Intelligence',
    tagline: 'Local-first AI executive intelligence powering research, architecture, systems design, and operations for EDC Media.',
    architecture: 'Local memory continuity, multi-model routing, and tool-assisted autonomous development.',
  },
];

export function BuiltByEDCSection({ onLoadProjectPreset }: BuiltByEDCSectionProps) {
  const [activeIndustryId, setActiveIndustryId] = useState<string>('hvac');
  const selectedIndustry = INDUSTRY_DEMOS.find((d) => d.id === activeIndustryId) || INDUSTRY_DEMOS[0];

  return (
    <section id="portfolio-section" className="py-20 sm:py-28 bg-[#0A0D14] border-t border-b border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PART 1: INDUSTRY ARCHITECTURE DEMONSTRATIONS (Specification 23) */}
        <div className="mb-24">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
              <Target className="w-3.5 h-3.5" />
              INDUSTRY ARCHITECTURAL BLUEPRINTS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Different Offers Require Different Architectures.
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              An emergency plumber needs immediate call dispatch. An elective dentist needs visual proof and confidence. See how EDC adapts the conversion architecture to the specific buyer context.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              <span>SYNTHETIC DEMONSTRATION // EXAMPLE ARCHITECTURES</span>
            </div>
          </div>

          {/* Industry Switcher Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
            {INDUSTRY_DEMOS.map((ind) => {
              const Icon = ind.icon;
              const isActive = ind.id === activeIndustryId;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustryId(ind.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'bg-[#00E5FF] border-[#00E5FF] text-[#07090E] shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                      : 'bg-[#0F121A] border-white/[0.08] text-slate-300 hover:border-white/[0.2] hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#07090E]' : 'text-[#00E5FF]'}`} />
                  <span className="text-xs font-bold font-mono tracking-tight leading-tight">
                    {ind.industry}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Industry Demonstration Panel */}
          <div className="rounded-2xl border border-white/[0.12] bg-[#0F121A] p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Strategy & Architecture (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] block mb-1">
                    EXAMPLE BUSINESS OFFER
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedIndustry.exampleBusiness}
                  </h3>
                  <p className="text-xs text-slate-300 bg-[#07090E] p-3 rounded-lg border border-white/[0.06]">
                    &quot;{selectedIndustry.offerInput}&quot;
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.04]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                      BUYING CONTEXT & PSYCHOLOGY:
                    </span>
                    <p className="text-slate-200">{selectedIndustry.buyerContext}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.04]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 block mb-0.5">
                      PRIMARY FRICTION BARRIER:
                    </span>
                    <p className="text-amber-200">{selectedIndustry.primaryBarrier}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 block mb-0.5">
                      RECOMMENDED ACTION:
                    </span>
                    <p className="text-emerald-200 font-semibold">{selectedIndustry.recommendedCTA}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                    SECTION CONVERSION ARCHITECTURE:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIndustry.architectureFlow.map((step, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300"
                      >
                        {idx + 1}. {step}
                      </span>
                    ))}
                  </div>
                </div>

                {onLoadProjectPreset && (
                  <button
                    onClick={() => onLoadProjectPreset(selectedIndustry.profile)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/50 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Generate Page With This Architecture</span>
                  </button>
                )}
              </div>

              {/* Right Column: Rendered Example Page Output (7 cols) */}
              <div className="lg:col-span-7 bg-[#07090E] rounded-xl border border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SYNTHETIC ARCHITECTURE PREVIEW
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Goal: {selectedIndustry.goal}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-mono font-bold">
                      {selectedIndustry.mockProofBadge}
                    </span>

                    <h4 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                      {selectedIndustry.mockHeadline}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selectedIndustry.mockSubheadline}
                    </p>

                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider">
                        <span>{selectedIndustry.recommendedCTA}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Category: {selectedIndustry.industry}</span>
                  <span className="text-emerald-400">Status: Verified Model</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PART 2: REAL EDC MEDIA PORTFOLIO (Specification 24) */}
        <div>
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
              <Layers className="w-3.5 h-3.5" />
              SYSTEMS ARCHITECTURE & PRODUCTS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              BUILT BY EDC MEDIA
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              The internal applications, operating intelligence, and conversion platforms engineered by EDC Media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REAL_PORTFOLIO_SYSTEMS.map((system) => (
              <div
                key={system.id}
                className="p-6 rounded-2xl bg-[#0F121A] border border-white/[0.08] hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF] font-semibold mb-2">
                    {system.category}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00E5FF] transition-colors">
                    {system.title}
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {system.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.05] text-[11px] text-slate-400">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">
                    TECHNICAL ARCHITECTURE:
                  </span>
                  <p className="leading-snug text-slate-300">{system.architecture}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
