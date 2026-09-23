'use client';

import React from 'react';
import { Sparkles, ArrowRight, Terminal } from 'lucide-react';

interface FinalCTASectionProps {
  onScrollToBuilder: () => void;
}

export function FinalCTASection({ onScrollToBuilder }: FinalCTASectionProps) {
  return (
    <section className="py-20 sm:py-28 bg-[#07090E] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-[#0F121A] to-[#07090E] border border-white/[0.12] p-8 sm:p-16 shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0D14] border border-[#00E5FF]/30 text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-6">
            <Terminal className="w-3.5 h-3.5" />
            CONVERSION FIRST // ZERO BLATANT FLUFF
          </div>

          {/* Headline - Specification 38 */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
            YOUR NEXT LANDING PAGE SHOULD HAVE A JOB.
          </h2>

          {/* Supporting Copy - Specification 38 */}
          <p className="text-base sm:text-xl text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
            Not just a design. Not just a headline. A job. Build it with EDC.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onScrollToBuilder}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(0,229,255,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
              id="final-cta-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>BUILD MY LANDING PAGE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('portfolio-section');
                if (el) {
                  const navbar = document.getElementById('edc-navbar');
                  const navHeight = navbar ? navbar.getBoundingClientRect().height : 70;
                  const targetTop = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
                  window.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#0F121A] border border-white/[0.12] text-slate-200 font-semibold text-sm tracking-wider uppercase hover:border-white/[0.25] hover:text-white transition-all text-center cursor-pointer touch-manipulation"
            >
              EXPLORE ARCHITECTURES
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
