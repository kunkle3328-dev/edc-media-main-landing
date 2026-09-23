'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, ShieldCheck, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EDCNavbar } from '@/components/EDCNavbar';
import { EDCFooter } from '@/components/EDCFooter';
import { PROCESS_STEPS, COMPARISON_ROWS } from '@/lib/edc-data';
import { EDC_BRAND } from '@/lib/brand-config';


export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] font-sans antialiased">
      <EDCNavbar
        onOpenBuilder={() => {
          if (typeof window !== 'undefined') window.location.href = '/builders/landing-pages';
        }}
        onSelectSavedPage={() => {}}
        savedPages={[]}
      />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
            {EDC_BRAND.corporateDomain} — ENGINEERING SERVICES
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Bespoke AI Engineering & Conversion Systems
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            We partner with operators to design, architect, and deploy production digital infrastructure.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white text-center">The 5-Step Direct Response Methodology</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-xs font-mono text-[#00E5FF] font-bold">STEP {s.step}</span>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400">{s.description}</p>
                <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400">
                  Deliverable: {s.deliverable}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architectural Comparison */}
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-white">EDC Media vs. Traditional Alternatives</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Traditional Agency</th>
                  <th className="py-3 px-4">Generic Page Builders</th>
                  <th className="py-3 px-4 text-[#00E5FF]">EDC Media Engineering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-4 font-bold text-white">{row.feature}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.traditionalAgency}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.genericBuilders}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">{row.edcMedia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,229,255,0.45)] transition-all"
          >
            <span>ENTER PLATFORM WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <EDCFooter />
    </div>
  );
}
