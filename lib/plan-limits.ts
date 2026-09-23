import { PlanLimits } from '@/types/landing-engine';

export type PlanTier = 'FREE' | 'LAUNCH' | 'GROWTH' | 'PRO' | 'AGENCY' | 'WHITE_LABEL';

export const PLAN_LIMITS_MAP: Record<PlanTier, PlanLimits> = {
  FREE: {
    maxLandingPages: 3,
    maxPublishedPages: 1,
    maxLeads: 50,
    analyticsRetentionDays: 30,
    aiOptimizations: 5,
    customDomains: 0,
    workspaces: 1,
    whiteLabel: false,
  },
  LAUNCH: {
    maxLandingPages: 10,
    maxPublishedPages: 3,
    maxLeads: 500,
    analyticsRetentionDays: 90,
    aiOptimizations: 25,
    customDomains: 1,
    workspaces: 1,
    whiteLabel: false,
  },
  GROWTH: {
    maxLandingPages: 50,
    maxPublishedPages: 15,
    maxLeads: 5000,
    analyticsRetentionDays: 365,
    aiOptimizations: 150,
    customDomains: 5,
    workspaces: 3,
    whiteLabel: false,
  },
  PRO: {
    maxLandingPages: 200,
    maxPublishedPages: 50,
    maxLeads: 25000,
    analyticsRetentionDays: 730,
    aiOptimizations: 1000,
    customDomains: 20,
    workspaces: 10,
    whiteLabel: true,
  },
  AGENCY: {
    maxLandingPages: 1000,
    maxPublishedPages: 500,
    maxLeads: 100000,
    analyticsRetentionDays: 1095,
    aiOptimizations: 5000,
    customDomains: 100,
    workspaces: 50,
    whiteLabel: true,
  },
  WHITE_LABEL: {
    maxLandingPages: 5000,
    maxPublishedPages: 2000,
    maxLeads: 500000,
    analyticsRetentionDays: 1825,
    aiOptimizations: 20000,
    customDomains: 500,
    workspaces: 200,
    whiteLabel: true,
  },
};

export function getPlanLimits(tier: PlanTier = 'GROWTH'): PlanLimits {
  return PLAN_LIMITS_MAP[tier] || PLAN_LIMITS_MAP.GROWTH;
}
