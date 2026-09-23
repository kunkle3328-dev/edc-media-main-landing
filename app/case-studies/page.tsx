'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Layers } from 'lucide-react';
import { EDCNavbar } from '@/components/EDCNavbar';
import { EDCFooter } from '@/components/EDCFooter';
import { PORTFOLIO_PROJECTS } from '@/lib/edc-data';
import { EDC_BRAND } from '@/lib/brand-config';


export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] font-sans antialiased">
      <EDCNavbar
        onOpenBuilder={() => {
          if (typeof window !== 'undefined') window.location.href = '/builders/landing-pages';
        }}
        onSelectSavedPage={() => {}}
        savedPages={[]}
      />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
            {EDC_BRAND.corporateDomain} — CASE STUDIES & BREAKDOWNS
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Architecture Breakdowns & Conversion Outcomes
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Real production architectures engineered by EDC Media across trades, B2B SaaS, and executive advisory.
          </p>
        </div>

        <div className="space-y-8">
          {PORTFOLIO_PROJECTS.map((proj) => (
            <div
              key={proj.id}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00E5FF]/40 transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-xs font-mono text-[#00E5FF] font-bold uppercase">{proj.category}</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{proj.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{proj.tagline}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">The Core Bottleneck</span>
                  <p className="text-slate-300">{proj.problem}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold">EDC Architecture</span>
                  <p className="text-slate-300">{proj.architecture}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Conversion Outcome</span>
                  <p className="text-slate-300">{proj.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link
            href="/builders/landing-pages"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,229,255,0.45)] transition-all"
          >
            <span>BUILD YOUR OWN CONVERSION ENGINE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <EDCFooter />
    </div>
  );
}
