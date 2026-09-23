'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { EDCNavbar } from '@/components/EDCNavbar';
import { EDCFooter } from '@/components/EDCFooter';
import { EDC_BRAND } from '@/lib/brand-config';


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] font-sans antialiased">
      <EDCNavbar
        onOpenBuilder={() => {
          if (typeof window !== 'undefined') window.location.href = '/builders/landing-pages';
        }}
        onSelectSavedPage={() => {}}
        savedPages={[]}
      />

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
            {EDC_BRAND.corporateDomain} — COMPANY PHILOSOPHY
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Conversion Over Clutter. Code Over Slop.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            EDC Media was engineered to eliminate the high friction, slow turnaround, and mediocre conversion rates that plague traditional web development.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white">1. Real Revenue Focus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We treat web assets as direct-response instruments designed to acquire qualified leads and close pipeline, not generic art projects.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white">2. Pure Local-First & Zero Bloat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No brittle third-party plugin ecosystems or locked-in CMS traps. Clean Next.js 15, TypeScript, Tailwind CSS, and server-side AI reasoning.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white">3. Authoritative Truth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every status, domain record, and lead pipeline reflects reality with zero fake states or fabricated analytics.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0F121A] to-[#161B26] border border-white/10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Ready to Build With EDC Media?</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Access the EDC Media Club platform to launch direct-response landing engines and AI applications today.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
          >
            <span>LAUNCH PLATFORM WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <EDCFooter />
    </div>
  );
}
