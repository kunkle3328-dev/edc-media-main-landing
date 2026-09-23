'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  DollarSign,
  Layers,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';


const MARKET_OPPORTUNITIES = [
  {
    id: 'opp_1',
    title: 'Emergency Storm & Roof Restoration',
    category: 'High-Urgency Local Trades',
    ticketSize: '$8,000 – $25,000',
    conversionAngle: 'Sub-60s insurance deductible intake & immediate drone inspection dispatch.',
    recommendedType: 'LANDING_PAGE',
    demandScore: 98,
    actionLabel: 'Launch Restoration Landing Engine',
    link: '/builders/landing-pages',
  },
  {
    id: 'opp_2',
    title: 'Private Wealth & RIA Advisory Intake',
    category: 'High-Ticket Financial Services',
    ticketSize: '$50,000+ AUM Retainer',
    conversionAngle: 'Confidential tax-drag diagnostic and fiduciary fee comparison report.',
    recommendedType: 'LANDING_PAGE',
    demandScore: 94,
    actionLabel: 'Launch Wealth Advisory Portal',
    link: '/builders/landing-pages',
  },
  {
    id: 'opp_3',
    title: 'B2B SaaS Sales Intent Triage Bot',
    category: 'Enterprise Software',
    ticketSize: '$12,000 / yr ARR',
    conversionAngle: 'Slack-native account visitor alerts paired with instant calendar routing.',
    recommendedType: 'AI_AGENT',
    demandScore: 91,
    actionLabel: 'Deploy Intent Qualifier Agent',
    link: '/builders/agents',
  },
  {
    id: 'opp_4',
    title: 'Dental Implant & Cosmetic Smile Simulator',
    category: 'Local Healthcare & Aesthetics',
    ticketSize: '$4,500 – $18,000',
    conversionAngle: '3D Smile Preview lead magnet with transparent payment plan calculator.',
    recommendedType: 'LANDING_PAGE',
    demandScore: 96,
    actionLabel: 'Launch Dental Smile Engine',
    link: '/builders/landing-pages',
  },
];

export default function OpportunitiesPage() {
  const [filter, setFilter] = useState('');

  const filtered = MARKET_OPPORTUNITIES.filter((o) =>
    o.title.toLowerCase().includes(filter.toLowerCase()) || o.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <PlatformShell
      activeTab="opportunities"
      title="High-Intent Opportunities"
      subtitle="Curated monetization blueprints and vetted direct response conversion models"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search high-intent niches..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.1]">
                    {opp.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    Demand Score: {opp.demandScore}/100
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                    {opp.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{opp.conversionAngle}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Contract Value</span>
                  <p className="text-xs font-bold font-mono text-emerald-400">{opp.ticketSize}</p>
                </div>

                <Link
                  href={opp.link}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00E5FF] text-[#07090E] text-xs font-bold hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1.5"
                >
                  <span>{opp.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlatformShell>
  );
}
