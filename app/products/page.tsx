'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Monitor, Code2, Bot, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { EDCNavbar } from '@/components/EDCNavbar';
import { EDCFooter } from '@/components/EDCFooter';
import { CAPABILITIES } from '@/lib/edc-data';
import { EDC_BRAND } from '@/lib/brand-config';


export default function ProductsPage() {
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
            {EDC_BRAND.corporateDomain} — PRODUCTS & ENGINES
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Precision AI Engines Engineered for Revenue
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Autonomous systems, direct-response conversion engines, and full-stack software built to monetize digital attention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.id}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-widest text-[#00E5FF] uppercase">
                  {cap.subtitle}
                </span>
                <h2 className="text-2xl font-bold text-white">{cap.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{cap.description}</p>
                <ul className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {cap.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-[#00E5FF] font-bold">›</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-3 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
              >
                <span>DEPLOY IN EDC MEDIA CLUB</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </main>

      <EDCFooter />
    </div>
  );
}
