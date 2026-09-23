'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Terminal, Heart } from 'lucide-react';

export function EDCFooter() {
  return (
    <footer className="bg-[#05070B] border-t border-white/[0.08] pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F121A] border border-[#00E5FF]/40 flex items-center justify-center">
                <span className="text-[#00E5FF] font-mono text-xs font-bold">EDC</span>
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                EDC MEDIA
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              AI-powered applications, intelligent agents, and high-conversion digital revenue systems. Engineered to turn attention into business results.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.06] text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEMS OPERATIONAL • GEMINI 2.5 ACTIVE</span>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">
              PRODUCTS &amp; PLATFORM
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/builders/landing-pages" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Landing Engine™
                </Link>
              </li>
              <li>
                <Link href="/builders/agents" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Autonomous AI Agents
                </Link>
              </li>
              <li>
                <Link href="/builders/websites" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Multi-Page Websites
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  EDC Media Club Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Corporate */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">
              EDC HQ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Engineering Services
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Case Studies &amp; Outcomes
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Company Philosophy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#00E5FF] transition-colors touch-manipulation">
                  Direct Dispatch &amp; Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} EDC Media. All rights reserved. Built with precision in Google AI Studio.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Terminal className="w-3 h-3 text-[#00E5FF]" />
              <span>EDC_CORE_V1.4</span>
            </span>
            <span className="text-slate-400">Strict Privacy Assurance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
