'use client';

import React from 'react';
import { Cpu, Bot, Layout, DollarSign, ArrowRight } from 'lucide-react';
import { CAPABILITIES } from '@/lib/edc-data';

export function WhatEDCDoesSection() {
  const iconMap: Record<string, React.ElementType> = {
    Cpu,
    Bot,
    Layout,
    DollarSign,
  };

  return (
    <section
      id="capabilities-section"
      className="py-20 sm:py-28 bg-[#07090E] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
            <Cpu className="w-3 h-3" />
            CORE CAPABILITIES // EDC ENGINEERING
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            We don&apos;t build AI because AI is trendy.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-slate-200">
              We build AI when it solves a real problem.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Every product, agent, and landing system is architected to perform in the wild, capture customer demand, and generate business value.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CAPABILITIES.map((cap) => {
            const Icon = iconMap[cap.iconName] || Cpu;
            return (
              <div
                key={cap.id}
                className="p-8 rounded-2xl bg-[#0A0D14] border border-white/[0.08] hover:border-[#00E5FF]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs font-mono text-[#00E5FF] mb-4">
                    {cap.subtitle}
                  </p>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    {cap.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      CORE DELIVERABLES:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                      {cap.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#00E5FF]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>PROVEN DEPLOYMENT READY</span>
                  <span className="text-[#00E5FF]">SPEC 0{cap.id.slice(-1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
