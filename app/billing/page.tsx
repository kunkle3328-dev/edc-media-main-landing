'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { WorkspaceService } from '@/lib/services';
import { PRICING_PLANS } from '@/lib/edc-data';
import { WorkspacePlan } from '@/types/platform';


export default function BillingPage() {
  const [activeWorkspace, setActiveWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUpgradePlan = (plan: WorkspacePlan) => {
    const updated = WorkspaceService.updateWorkspace(activeWorkspace.id, {
      plan,
    });
    if (updated) {
      setActiveWorkspace(updated);
      setFeedback(`Workspace successfully updated to ${plan} tier.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <PlatformShell
      activeTab="billing"
      title="Billing & Subscription Plans"
      subtitle="Transparent pricing and resource quotas for your EDC Workspace"
    >
      <div className="space-y-8 max-w-5xl">
        {feedback && (
          <div className="p-4 rounded-xl text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            {feedback}
          </div>
        )}

        {/* Current Plan Overview */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Current Active Plan</span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-2xl font-bold text-white font-mono">{activeWorkspace.plan} TIER</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Billed monthly. Full access to Landing Engine™, AI Reasoner, and Subdomain routing.
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const planKey = (plan.id === 'growth' ? 'PRO' : plan.id === 'agency' ? 'AGENCY' : 'STARTER') as WorkspacePlan;
            const isCurrent = activeWorkspace.plan === planKey;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between gap-6 transition-all ${
                  isCurrent
                    ? 'bg-[#00E5FF]/5 border-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.15)]'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      {plan.name}
                    </span>
                    {plan.popular && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-bold text-white">${plan.monthlyPrice}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <p className="text-xs text-slate-400">{plan.tagline}</p>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUpgradePlan(planKey)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-white/10 text-slate-400 cursor-default'
                      : 'bg-[#00E5FF] text-[#07090E] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </PlatformShell>
  );
}
