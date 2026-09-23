'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, AlertCircle, X } from 'lucide-react';
import { PLAN_LIMITS_MAP, PlanTier } from '@/lib/plan-limits';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

interface PlanDisplayConfig {
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  tagline: string;
  popular?: boolean;
  ctaText: string;
}

const PLAN_CONFIGS: PlanDisplayConfig[] = [
  {
    tier: 'FREE',
    name: 'Free Starter',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    tagline: 'Test conversion strategy and deploy your first active landing page.',
    ctaText: 'START FREE',
  },
  {
    tier: 'LAUNCH',
    name: 'Launch',
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    tagline: 'For solo founders and single-location local businesses needing steady inquiries.',
    ctaText: 'SELECT LAUNCH',
  },
  {
    tier: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 99,
    annualMonthlyPrice: 79,
    tagline: 'Ideal for scaling businesses running multi-angle paid ad campaigns.',
    popular: true,
    ctaText: 'SELECT GROWTH',
  },
  {
    tier: 'PRO',
    name: 'Pro Engine',
    monthlyPrice: 249,
    annualMonthlyPrice: 199,
    tagline: 'For high-volume operators requiring white-label and extensive domain pools.',
    ctaText: 'SELECT PRO',
  },
  {
    tier: 'AGENCY',
    name: 'Agency Fleet',
    monthlyPrice: 499,
    annualMonthlyPrice: 399,
    tagline: 'Complete client multi-tenancy with 50 separate workspaces and 500 published pages.',
    ctaText: 'SELECT AGENCY',
  },
  {
    tier: 'WHITE_LABEL',
    name: 'White Label Partner',
    monthlyPrice: 999,
    annualMonthlyPrice: 799,
    tagline: 'Full enterprise white-label deployment for digital agencies and SaaS partners.',
    ctaText: 'SELECT WHITE LABEL',
  },
];

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [annualBilling, setAnnualBilling] = useState(false);
  const [billingNoticeOpen, setBillingNoticeOpen] = useState(false);
  const [selectedTierForNotice, setSelectedTierForNotice] = useState<string>('');

  const handlePlanClick = (plan: PlanDisplayConfig) => {
    if (plan.tier === 'FREE') {
      onSelectPlan('free');
    } else {
      setSelectedTierForNotice(plan.name);
      setBillingNoticeOpen(true);
    }
  };

  return (
    <section
      id="pricing-section"
      className="py-20 sm:py-28 bg-[#0A0D14] border-t border-b border-white/[0.06] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
            <Zap className="w-3 h-3" />
            UNIFIED SAAS ENTITLEMENTS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Predictable Plans for High-Conversion Publishing.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mb-8">
            Every plan includes conversion intelligence modeling, responsive edge publishing, native lead capture, and real-time telemetry.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-[#0F121A] p-1.5 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer touch-manipulation ${
                !annualBilling
                  ? 'bg-[#00E5FF] text-[#07090E] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MONTHLY
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
                annualBilling
                  ? 'bg-[#00E5FF] text-[#07090E] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>ANNUAL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid - 6 Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PLAN_CONFIGS.map((plan) => {
            const limits = PLAN_LIMITS_MAP[plan.tier];
            const price = annualBilling ? plan.annualMonthlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.tier}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'bg-[#0F121A] border-2 border-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.15)] scale-[1.01]'
                    : 'bg-[#07090E] border border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00E5FF] text-[#07090E] text-[10px] font-mono font-black uppercase tracking-widest">
                    RECOMMENDED CONVERSION ENGINE
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                      {plan.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 min-h-[36px]">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {price === 0 ? 'forever' : '/month'}
                      </span>
                    </div>
                  </div>

                  {/* Actual Entitlement Limits (Specification 28) */}
                  <div className="space-y-2.5 mb-8 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Landing Pages:</span>
                      <span className="font-mono font-semibold text-white">{limits.maxLandingPages} drafts</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Published Live:</span>
                      <span className="font-mono font-bold text-emerald-400">{limits.maxPublishedPages} active</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Lead CRM Capacity:</span>
                      <span className="font-mono text-white">{limits.maxLeads.toLocaleString()} leads</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Analytics Retention:</span>
                      <span className="font-mono text-slate-300">{limits.analyticsRetentionDays} days</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">AI Friction Optimizations:</span>
                      <span className="font-mono text-[#00E5FF]">{limits.aiOptimizations}/mo</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Custom Domains:</span>
                      <span className="font-mono text-slate-300">
                        {limits.customDomains === 0 ? 'EDC subdomain only' : `${limits.customDomains} domains`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-400">Client Workspaces:</span>
                      <span className="font-mono text-slate-300">{limits.workspaces} workspace</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">White-Label Capability:</span>
                      <span className={`font-mono font-semibold ${limits.whiteLabel ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {limits.whiteLabel ? 'Included' : 'Not included'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-[#00E5FF] text-[#07090E] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                      : 'bg-white/[0.06] text-white hover:bg-white/[0.12]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Honest Billing Notice Banner */}
        <div className="p-4 rounded-xl bg-[#0F121A] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All tiers include SSL certificates, zero cookie-banner requirements, and instant responsive layouts.
            </span>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">
            BILLING STATUS: ENVIRONMENT READY • STRIPE GATEWAY IN SANDBOX
          </span>
        </div>
      </div>

      {/* Honest Billing Modal (Specification 28: Clearly label BILLING NOT CONFIGURED) */}
      {billingNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F121A] border border-white/[0.15] rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setBillingNoticeOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>

            <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold mb-2">
              BILLING NOT CONFIGURED
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {selectedTierForNotice} Tier Selection
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Payment gateway integration (Stripe / Paddle) is intentionally not configured in this preview environment. You can test and deploy full landing pages immediately using the built-in free tier.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  setBillingNoticeOpen(false);
                  onSelectPlan('free');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold font-mono text-xs uppercase tracking-wider"
              >
                Continue With Free Builder
              </button>
              <button
                onClick={() => setBillingNoticeOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/[0.08] text-slate-300 font-mono text-xs hover:bg-white/[0.15]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
