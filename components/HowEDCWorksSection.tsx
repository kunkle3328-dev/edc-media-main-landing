'use client';

import React from 'react';
import {
  Target,
  Cpu,
  Layers,
  Award,
  Sparkles,
  Globe,
  Activity,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface ProductStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const PRODUCT_STEPS: ProductStep[] = [
  {
    step: '01',
    title: 'START WITH THE OFFER',
    subtitle: 'Input the raw business reality',
    description:
      'Tell EDC what you are selling, who your buyer is, and what action you need them to take. No design brief or wireframe required.',
    icon: Target,
    badge: 'OFFER MODELING',
  },
  {
    step: '02',
    title: 'EDC FIGURES OUT THE CONVERSION STRATEGY',
    subtitle: 'Strategic intelligence engine',
    description:
      'The engine models visitor intent, buying context, friction barriers, emotional urgency, and objection handling before placing a single word.',
    icon: Cpu,
    badge: 'STRATEGY SYNTHESIS',
  },
  {
    step: '03',
    title: 'BUILD THE PAGE',
    subtitle: 'Direct-response section architecture',
    description:
      'Assembles a high-contrast landing page with problem anchors, proof bars, value propositions, FAQ modules, and lead capture forms.',
    icon: Layers,
    badge: 'LAYOUT GENERATION',
  },
  {
    step: '04',
    title: 'SCORE IT',
    subtitle: '5-Dimension conversion readiness',
    description:
      'Evaluates the draft across Message Clarity, Persuasive Logic, Trust Evidence, UX Usability, and Conversion Friction before deployment.',
    icon: Award,
    badge: 'READINESS AUDIT',
  },
  {
    step: '05',
    title: 'OPTIMIZE IT',
    subtitle: 'Friction elimination & polish',
    description:
      'Highlights what is holding the page back and applies AI-guided optimizations to headlines, copy, trust cues, and CTA contrast.',
    icon: Sparkles,
    badge: 'AI FRICTION REMOVAL',
  },
  {
    step: '06',
    title: 'PUBLISH IT',
    subtitle: 'Private preview or live deployment',
    description:
      'Preview privately at /preview/[id], then push to live production at {slug}.edcmedia.club or your custom apex/subdomain with instant SSL.',
    icon: Globe,
    badge: 'EDGE PUBLISHING',
  },
  {
    step: '07',
    title: 'MEASURE IT',
    subtitle: 'Real conversion telemetry',
    description:
      'Directly tracks unique visitors, page views, CTA interaction heat, form completions, and qualified lead captures with zero cookie fatigue.',
    icon: Activity,
    badge: 'NATIVE TELEMETRY',
  },
  {
    step: '08',
    title: 'IMPROVE IT',
    subtitle: 'Continuous performance compounding',
    description:
      'Iterate draft versions, test new offers, snapshot revisions, and republish with zero downtime to continuously increase lead capture rate.',
    icon: TrendingUp,
    badge: 'CONTINUOUS COMPOUNDING',
  },
];

export function HowEDCWorksSection() {
  return (
    <section
      id="process-section"
      className="py-20 sm:py-28 bg-[#0A0D14] border-t border-b border-white/[0.06] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
            <Cpu className="w-3.5 h-3.5" />
            THE CONVERSION LIFECYCLE // 8-STEP ENGINE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            How EDC Media Turns Offers into High-Performing Pages.
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            A continuous loop: Create → Analyze → Score → Optimize → Preview → Publish → Capture → Measure → Improve.
          </p>
        </div>

        {/* 8-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-6 rounded-2xl bg-[#0F121A] border border-white/[0.08] flex flex-col justify-between relative group hover:border-[#00E5FF]/40 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-[#00E5FF]/40 group-hover:text-[#00E5FF] transition-colors">
                      {step.step}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 group-hover:text-[#00E5FF] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    {step.badge}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#00E5FF]/90 font-medium mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>STAGE {step.step} OF 08</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-[#00E5FF] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
