export type GoalType =
  | 'leads'
  | 'sales'
  | 'appointments'
  | 'calls'
  | 'signups'
  | 'product'
  | 'service'
  | 'other';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface BusinessProfile {
  name: string;
  offer: string; // What are you selling?
  targetAudience: string; // Who is it for?
  primaryGoal: GoalType;
  websiteUrl?: string;
  brandColor?: string;
  serviceArea?: string;
  uniqueHook?: string;
  pricingHint?: string;
}

export interface StrategyObject {
  businessName: string;
  businessType: string;
  offer: string;
  targetAudience: string;
  customerProblem: string;
  desiredOutcome: string;
  primaryGoal: string;
  primaryCTA: {
    label: string;
    subtext?: string;
    actionType: 'call' | 'form' | 'booking' | 'checkout' | 'signup';
    phoneOrLink?: string;
  };
  secondaryCTA: {
    label: string;
    actionType: 'scroll' | 'learn_more' | 'contact';
  };
  valueProposition: string;
  positioning: string;
  urgency: string;
  trustRequirements: string[];
  objectionHandling: { objection: string; counter: string }[];
  recommendedSections: string[];
  recommendedTone: string;
  recommendedVisualDirection: string;
  recommendedSEOKeywords: string[];
  conversionRisks: string[];
  missingInformation: string[];
}

export type SectionType =
  | 'announcement'
  | 'hero'
  | 'problem'
  | 'solution'
  | 'benefits'
  | 'how_it_works'
  | 'process'
  | 'features'
  | 'showcase'
  | 'pricing'
  | 'social_proof'
  | 'faq'
  | 'objections'
  | 'guarantee'
  | 'final_cta'
  | 'lead_capture'
  | 'footer';

export interface LandingPageSection {
  id: string;
  type: SectionType;
  order: number;
  content: Record<string, any>;
  style?: {
    themeVariant?: string;
    accentColor?: string;
    contrastMode?: 'high' | 'subtle';
  };
  visibility: boolean;
  settings?: Record<string, any>;
}

export interface ConversionMetric {
  name: string;
  score: number; // 0-100
  weight: number;
  feedback: string;
}

export interface TopImprovement {
  id: string;
  title: string;
  impact: 'critical' | 'high' | 'medium';
  action: string;
  applied?: boolean;
  recommendedChange?: {
    targetSectionType: SectionType;
    fieldToUpdate: string;
    newValue: any;
  };
}

export interface ConversionScoreData {
  overallScore: number;
  label: string;
  assessmentSummary: string;
  metrics: ConversionMetric[];
  whatsWorking: string[];
  whatsMissing: string[];
  topImprovements: TopImprovement[];
}

export interface LeadCaptureConfig {
  title: string;
  subtitle: string;
  submitButtonText: string;
  successHeadline: string;
  successMessage: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    placeholder?: string;
    required: boolean;
    options?: string[];
  }[];
}

export type PagePublishStatus = 'draft' | 'published' | 'unpublished' | 'archived';

export interface LandingPage {
  id: string;
  name: string;
  slug: string;
  status: PagePublishStatus;
  workspaceId?: string;
  currentDraftVersionId?: string;
  publishedVersionId?: string;
  publishedAt?: string;
  unpublishedAt?: string;
  publicSlug?: string;
  businessProfile: BusinessProfile;
  strategy: StrategyObject;
  theme: {
    mode: 'obsidian' | 'midnight' | 'stealth';
    primaryAccent: string; // e.g. '#00E5FF'
    secondaryAccent?: string; // e.g. '#8B5CF6'
  };
  sections: LandingPageSection[];
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    robots?: string;
    favicon?: string;
  };
  ctaConfig: {
    primaryText: string;
    primarySubtext?: string;
    actionType: string;
    phone?: string;
    linkUrl?: string;
  };
  leadCaptureConfig: LeadCaptureConfig;
  conversionScore?: ConversionScoreData;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'BOOKED' | 'WON' | 'LOST';

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
}

export interface LeadStatusHistory {
  from: LeadStatus;
  to: LeadStatus;
  timestamp: string;
  note?: string;
}

export interface CapturedLead {
  id: string;
  landingPageId: string;
  pageId?: string; // backward-compatible alias
  workspaceId: string;
  businessName: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  customFields?: Record<string, any>;
  data: Record<string, string>; // complete form data dictionary
  source?: string; // direct | organic | social | paid | referral | email | unknown
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPageVersionId?: string;
  firstTouchTimestamp?: string;
  ctaSource?: string; // hero | problem | solution | pricing | final_cta | sticky_mobile_cta
  status: LeadStatus;
  notes?: string;
  notesHistory?: LeadNote[];
  statusHistory?: LeadStatusHistory[];
  consentMetadata?: {
    consentedAt: string;
    ipAnonymized?: string;
    userAgent?: string;
  };
}

export interface EDCProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  whatItIs: string;
  whoItServes: string;
  problemSolves: string;
  whyItMatters: string;
  status: 'Live Platform' | 'Active Production' | 'Enterprise Agent';
  tags: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  features: string[];
  ctaLabel: string;
  popular?: boolean;
}

// ==========================================
// BUILD 02 — AI CONVERSION INTELLIGENCE TYPES
// ==========================================

export type EvidenceType =
  | 'FACT'
  | 'INFERENCE'
  | 'RECOMMENDATION'
  | 'MISSING'
  | 'ASSUMPTION'
  | 'MODEL_OUTPUT';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type EffortLevel = 'low' | 'medium' | 'high';
export type AnalysisStatus =
  | 'NOT_ANALYZED'
  | 'ANALYZING'
  | 'ANALYSIS_READY'
  | 'STALE'
  | 'ERROR';

export interface ScoringDimension {
  key: string;
  name: string;
  score: number; // 0-100
  weight: number;
  feedback: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface SectionScoreAnalysis {
  sectionId: string;
  sectionType: SectionType;
  title: string;
  score: number; // 0-100
  whyScore: string;
  whatsWorking: string[];
  whatCouldImprove: string[];
  recommendedAction: string;
  recommendedChange?: {
    field: string;
    currentValue: any;
    proposedValue: any;
    rationale: string;
  };
}

export interface MissingTrustSignal {
  element: string;
  description: string;
  whyItMatters: string;
  isAvailable: boolean;
}

export interface CTAAnalysis {
  currentCTA: string;
  recommendedCTA: string;
  actionType: string;
  clarityScore: number;
  frictionScore: number;
  explanation: string;
  placementAdvice: string;
}

export interface HeadlineAnalysis {
  currentHeadline: string;
  currentSubheadline: string;
  clarityScore: number;
  differentiationScore: number;
  readabilityScore: number;
  alternatives: {
    direct: string;
    benefitDriven: string;
    outcomeDriven: string;
  };
}

export interface OfferAnalysis {
  what: string;
  who: string;
  why: string;
  value: string;
  nextStep: string;
  overallClarity: number;
  recommendedOffer: string;
  critique: string;
}

export interface MobileAnalysis {
  readinessScore: number;
  checks: {
    name: string;
    passed: boolean;
    detail: string;
  }[];
  recommendations: string[];
}

export interface FrictionAnalysis {
  score: number;
  formFieldCount: number;
  recommendedFieldCount: number;
  paragraphDensity: 'optimal' | 'moderate' | 'high';
  excessiveChoices: boolean;
  frictionPoints: string[];
  recommendations: string[];
}

export interface PriorityAction {
  id: string;
  category: 'offer' | 'cta' | 'trust' | 'headline' | 'friction' | 'mobile' | 'section';
  priority: PriorityLevel;
  impact: ImpactLevel;
  confidence: ConfidenceLevel;
  effort: EffortLevel;
  title: string;
  problem: string;
  whyItMatters: string;
  currentState: string;
  recommendedState: string;
  action: string;
  affectedSections: string[];
  mutationPayload?: {
    sectionId?: string;
    sectionType?: SectionType;
    field?: string;
    value?: any;
    actionType?: string;
  };
}

export interface ConversionAnalysis {
  id: string;
  pageId: string;
  pageVersionId?: string;
  score: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  dimensions: ScoringDimension[];
  sectionScores: SectionScoreAnalysis[];
  missingTrustSignals: MissingTrustSignal[];
  ctaAnalysis: CTAAnalysis;
  headlineAnalysis: HeadlineAnalysis;
  offerAnalysis: OfferAnalysis;
  audienceAnalysis: {
    relevanceScore: number;
    targetClarity: string;
    feedback: string;
  };
  frictionAnalysis: FrictionAnalysis;
  mobileAnalysis: MobileAnalysis;
  contentAnalysis: {
    wordCount: number;
    readingTimeMinutes: number;
    toneConsistency: string;
  };
  seoAnalysis: {
    titleLength: number;
    metaDescriptionLength: number;
    keywordCoverage: string[];
    recommendations: string[];
  };
  priorityActions: PriorityAction[];
  generatedAt: string;
  analyzedVersion: number;
  inputFingerprint: string;
  model: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  workspaceId?: string;
  versionNumber: number;
  createdAt: string;
  changeReason: string;
  changeSummary: string;
  conversionScore: number;
  mobileScore?: number;
  snapshot: LandingPage;
  content?: LandingPage; // BUILD 03 alias for snapshot
  createdBy?: string;
  publishedAt?: string;
  isPublished?: boolean;
}

export type LandingPageVersion = PageVersion;

export interface ProposedChange {
  sectionId: string;
  sectionType: SectionType;
  changeDescription: string;
  before: any;
  after: any;
}

export interface OptimizationRun {
  id: string;
  pageId: string;
  sourceVersionId: string;
  proposedChanges: ProposedChange[];
  affectedSections: string[];
  scoreBefore: number;
  scoreAfter: number;
  proposedPage: LandingPage;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: string;
}

export type NLIntentType =
  | 'EDIT_COPY'
  | 'EDIT_CTA'
  | 'ADD_SECTION'
  | 'REMOVE_SECTION'
  | 'REORDER_SECTION'
  | 'CHANGE_TONE'
  | 'OPTIMIZE_CONVERSION'
  | 'IMPROVE_MOBILE'
  | 'IMPROVE_SEO'
  | 'EXPLAIN_SCORE'
  | 'GENERAL_QUESTION';

// ==========================================
// BUILD 03 — PUBLISHING, CONVERSION ANALYTICS & INTELLIGENCE
// ==========================================

export type ConversionEventType =
  | 'page_view'
  | 'hero_cta_clicked'
  | 'secondary_cta_clicked'
  | 'pricing_cta_clicked'
  | 'final_cta_clicked'
  | 'sticky_mobile_cta_clicked'
  | 'form_started'
  | 'form_completed'
  | 'phone_clicked'
  | 'email_clicked'
  | 'outbound_link_clicked'
  | 'form_validation_error'
  | 'form_abandoned';

export interface AnalyticsEvent {
  id: string;
  workspaceId: string;
  landingPageId: string;
  landingPageVersionId?: string;
  sessionId: string;
  eventType: ConversionEventType;
  timestamp: string;
  path: string;
  sectionId?: string;
  elementId?: string;
  ctaSource?: string;
  referrer?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  metadata?: Record<string, any>;
}

export interface TrafficSourceMetric {
  source: string;
  visitors: number;
  leads: number;
  conversionRate: number;
}

export interface DeviceMetric {
  device: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  visitors: number;
  formStarts: number;
  leads: number;
  conversionRate: number;
}

export interface VersionPerformanceMetric {
  versionNumber: number;
  versionId: string;
  isPublished: boolean;
  visitors: number;
  ctaInteractions: number;
  leads: number;
  conversionRate: number;
}

export interface CtaSourceMetric {
  source: string;
  clicks: number;
  leads: number;
}

export interface ConversionFunnelMetrics {
  visitors: number;
  uniqueSessions: number;
  ctaInteractions: number;
  formStarts: number;
  formCompletions: number;
  leads: number;
  conversionRate: number;
  ctaClickRate: number;
  formStartRate: number;
  formCompletionRate: number;
  leadConversionRate: number;
  trafficSources: TrafficSourceMetric[];
  deviceBreakdown: DeviceMetric[];
  versionPerformance: VersionPerformanceMetric[];
  topCtaSources: CtaSourceMetric[];
  dateRange: '7d' | '30d' | '90d' | 'all';
  hasEnoughData: boolean;
  totalEventsCount: number;
}

export type EpistemicLabel = 'FACT' | 'OBSERVED' | 'RECOMMENDATION' | 'MODEL_OUTPUT' | 'ASSUMPTION';

export interface AIAnalyticsRecommendation {
  id: string;
  title: string;
  observedSignal: string;
  evidence: string;
  epistemicType: EpistemicLabel;
  likelyCause: string;
  recommendation: string;
  expectedImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  nextAction: string;
  metricArea: 'mobile' | 'cta' | 'form' | 'traffic' | 'general';
}

export interface PlanLimits {
  maxLandingPages: number;
  maxPublishedPages: number;
  maxLeads: number;
  analyticsRetentionDays: number;
  aiOptimizations: number;
  customDomains: number;
  workspaces: number;
  whiteLabel: boolean;
}

export interface Domain {
  id: string;
  workspaceId: string;
  landingPageId: string;
  hostname: string;
  verificationStatus: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'ACTIVE' | 'FAILED';
  sslStatus: 'PENDING' | 'ACTIVE' | 'ERROR';
  createdAt: string;
}


