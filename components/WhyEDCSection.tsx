'use client';

import React from 'react';
import { Check, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComparisonDimension {
  dimension: string;
  genericBuilder: string;
  traditionalAgency: string;
  edcEngine: string;
}

const COMPARISON_DATA: ComparisonDimension[] = [
  {
    dimension: 'Starting Point',
    genericBuilder: 'Blank page or decorative aesthetic template',
    traditionalAgency: 'Weeks of subjective briefing meetings & wireframes',
    edcEngine: 'The core business offer, buyer intent, and conversion goal',
  },
  {
    dimension: 'Strategic Process',
    genericBuilder: 'Template → User types copy → Publish',
    traditionalAgency: 'Months of redesign cycles & committee reviews',
    edcEngine: 'Offer → Intent → Objections → Architecture → Page → Score → Optimize → Publish → Measure',
  },
  {
    dimension: 'Conversion Scoring',
    genericBuilder: 'None. Only generic SEO keywords',
    traditionalAgency: 'Subjective internal feedback without data',
    edcEngine: 'Algorithmic 5-dimension readiness score (Message, Persuasion, Trust, UX, Conversion)',
  },
  {
    dimension: 'Copywriting Quality',
    genericBuilder: 'Generic placeholder text or generic AI fluff',
    traditionalAgency: 'Copywriter writing in a silo disconnected from code',
    edcEngine: 'Direct-response messaging anchored in buyer context & objection handling',
  },
  {
    dimension: 'Lead Capture & CRM',
    genericBuilder: 'Requires installing 3rd party plugins & Webhooks',
    traditionalAgency: 'Custom integration charged as hourly add-on',
    edcEngine: 'Native conversion-optimized lead capture with instant CRM & CSV export',
  },
  {
    dimension: 'Publishing Architecture',
    genericBuilder: 'Messy subdomains or complex DNS management',
    traditionalAgency: 'Slow staging servers requiring developer deployment',
    edcEngine: 'Private preview (/preview/[id]) + EDC-hosted ({slug}.edcmedia.club) + custom domain with instant SSL',
  },
  {
    dimension: 'Time to Deployment',
    genericBuilder: 'Hours of manual dragging, dropping, and alignment',
    traditionalAgency: '4 to 12 weeks of billing and agency delays',
    edcEngine: '60 seconds to working conversion engine, ready for live traffic',
  },
];

export function WhyEDCSection() {
  return (
    <section id="differentiation-section" className="py-20 sm:py-28 bg-[#07090E] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Specification 22 */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            ARCHITECTURAL DIFFERENTIATION
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            A WEBSITE BUILDER STARTS WITH A PAGE.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-slate-200">
              EDC STARTS WITH THE CONVERSION.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl">
            Most tools sell you empty canvases and expect you to be a copywriter, direct-response strategist, and UX psychologist. EDC handles the conversion intelligence first, then generates the page around it.
          </p>
        </div>

        {/* Linear Workflow Contrast Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Generic Builder Flow */}
          <div className="p-6 rounded-2xl bg-[#0F121A] border border-white/[0.08]">
            <div className="text-xs font-mono uppercase tracking-wider text-red-400 mb-2 font-bold flex items-center gap-1.5">
              <X className="w-4 h-4" />
              <span>GENERIC WEBSITE BUILDER WORKFLOW</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-slate-400 py-3">
              <span className="px-2.5 py-1 rounded bg-white/[0.05]">Template</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 rounded bg-white/[0.05]">Random Content</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="px-2.5 py-1 rounded bg-white/[0.05]">Publish</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-red-400">Zero Strategic Context</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assembles decorative shapes with generic copy. Nobody knows what the page is supposed to achieve or why visitors bounce.
            </p>
          </div>

          {/* EDC Workflow */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F121A] to-[#121824] border border-[#00E5FF]/30 shadow-[0_0_25px_rgba(0,229,255,0.08)]">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00E5FF] mb-2 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
              <span>EDC MEDIA LANDING ENGINE WORKFLOW</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-white py-3">
              <span className="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-bold">Business</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-bold">Offer</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.08]">Audience</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.08]">Intent</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.08]">Architecture</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.08]">Score</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Publish</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Measure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every section, headline, proof point, and button is mathematically and psychologically aligned to the target buyer action.
            </p>
          </div>
        </div>

        {/* Detailed Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.1] bg-[#0A0D14] shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0F121A]">
                <th className="p-4 sm:p-5 text-xs font-mono uppercase tracking-wider text-slate-400 w-1/4">
                  CAPABILITY CRITERIA
                </th>
                <th className="p-4 sm:p-5 text-xs font-mono uppercase tracking-wider text-slate-400 w-1/4">
                  GENERIC BUILDERS
                </th>
                <th className="p-4 sm:p-5 text-xs font-mono uppercase tracking-wider text-slate-400 w-1/4">
                  TRADITIONAL AGENCIES
                </th>
                <th className="p-4 sm:p-5 text-xs font-mono uppercase tracking-wider text-[#00E5FF] w-1/4 bg-[#00E5FF]/[0.06] border-l border-r border-[#00E5FF]/20">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                    EDC MEDIA
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
              {COMPARISON_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-white font-mono text-xs">
                    {row.dimension}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">
                    <div className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{row.genericBuilder}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">
                    <div className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{row.traditionalAgency}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 text-emerald-200 font-medium bg-[#00E5FF]/[0.03] border-l border-r border-[#00E5FF]/20">
                    <div className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 font-bold" />
                      <span>{row.edcEngine}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
