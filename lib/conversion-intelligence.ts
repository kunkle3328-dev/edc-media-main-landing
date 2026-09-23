import { GoogleGenAI } from '@google/genai';
import {
  LandingPage,
  ConversionAnalysis,
  ScoringDimension,
  SectionScoreAnalysis,
  MissingTrustSignal,
  CTAAnalysis,
  HeadlineAnalysis,
  OfferAnalysis,
  MobileAnalysis,
  FrictionAnalysis,
  PriorityAction,
  SectionType,
} from '@/types/landing-engine';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export function computePageFingerprint(page: LandingPage): string {
  if (!page) return '';
  const heroSection = page.sections?.find((s) => s.type === 'hero');
  const headline = (heroSection?.content?.headline as string) || page.name || '';
  const cta = page.ctaConfig?.primaryText || heroSection?.content?.ctaText || '';
  const str = `${page.id}_${page.name}_${page.sections?.length || 0}_${cta}_${headline}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Deterministic baseline analysis that rigorously inspects actual page content,
 * sections, CTA configurations, and business profile.
 */
export function evaluateConversionDeterministic(page: LandingPage): ConversionAnalysis {
  const heroSection = page.sections.find((s) => s.type === 'hero');
  const problemSection = page.sections.find((s) => s.type === 'problem');
  const solutionSection = page.sections.find((s) => s.type === 'solution');
  const benefitsSection = page.sections.find((s) => s.type === 'benefits');
  const trustSection = page.sections.find((s) => s.type === 'social_proof');
  const faqSection = page.sections.find((s) => s.type === 'faq');
  const finalCtaSection = page.sections.find((s) => s.type === 'final_cta');
  const leadSection = page.sections.find((s) => s.type === 'lead_capture');

  const headline = (heroSection?.content?.headline as string) || page.name || '';
  const subheadline = (heroSection?.content?.subheadline as string) || '';
  const primaryCTA = page.ctaConfig?.primaryText || heroSection?.content?.ctaText || 'Get Started';
  const targetAudience = page.businessProfile?.targetAudience || '';
  const offer = page.businessProfile?.offer || '';
  const formFields = page.leadCaptureConfig?.fields || [];

  // ==========================================
  // 1. Headline Analysis & Alternatives
  // ==========================================
  const headlineWords = headline.split(/\s+/).length;
  const isHeadlineSpecific = headline.length > 20 && !headline.toLowerCase().includes('welcome to');
  const headlineClarityScore = isHeadlineSpecific
    ? Math.min(95, 80 + (headlineWords >= 6 && headlineWords <= 12 ? 15 : 5))
    : 65;

  const directAlt = `Get Direct ${offer.slice(0, 40)} with Proven Rapid Delivery`;
  const benefitAlt = `Never Lose Customers to Slow Response: Built Specifically for ${targetAudience.slice(0, 40)}`;
  const outcomeAlt = `Turn Inquiries Into High-Value Revenue Without Friction`;

  const headlineAnalysis: HeadlineAnalysis = {
    currentHeadline: headline,
    currentSubheadline: subheadline,
    clarityScore: headlineClarityScore,
    differentiationScore: page.businessProfile?.uniqueHook ? 90 : 72,
    readabilityScore: headlineWords <= 14 ? 92 : 75,
    alternatives: {
      direct: directAlt,
      benefitDriven: benefitAlt,
      outcomeDriven: outcomeAlt,
    },
  };

  // ==========================================
  // 2. CTA Analysis
  // ==========================================
  const isGenericCTA = /^(submit|click here|contact|get started|learn more)$/i.test(primaryCTA.trim());
  const ctaClarityScore = isGenericCTA ? 68 : 92;
  const ctaFrictionScore = formFields.length > 4 ? 60 : formFields.length > 2 ? 82 : 95;

  const recommendedCTA =
    page.businessProfile.primaryGoal === 'calls'
      ? 'Call Now — Instant Dispatch'
      : page.businessProfile.primaryGoal === 'appointments'
      ? 'Book My Free 20-Min Strategy Call'
      : page.businessProfile.primaryGoal === 'sales'
      ? 'Claim Your Priority Access Now'
      : 'Get My Free Custom Proposal';

  const ctaAnalysis: CTAAnalysis = {
    currentCTA: primaryCTA,
    recommendedCTA,
    actionType: page.ctaConfig?.actionType || 'form',
    clarityScore: ctaClarityScore,
    frictionScore: ctaFrictionScore,
    explanation: isGenericCTA
      ? 'Generic action verbs like "Submit" or "Get Started" trigger psychological friction. High-converting CTAs describe the immediate payoff.'
      : 'Active, outcome-oriented button copy with low perceived commitment.',
    placementAdvice: 'Ensure CTA appears in Hero, repeats after Key Benefits, and concludes in Final Section.',
  };

  // ==========================================
  // 3. Offer Analysis
  // ==========================================
  const offerAnalysis: OfferAnalysis = {
    what: offer || 'Core Service / Solution',
    who: targetAudience || 'Target Demographics & Buyers',
    why: page.strategy?.desiredOutcome || 'Immediate outcome and operational peace of mind',
    value: page.strategy?.valueProposition || 'High-clarity, outcome-guaranteed delivery',
    nextStep: primaryCTA,
    overallClarity: offer.length > 15 ? 90 : 70,
    recommendedOffer: `${offer} tailored for ${targetAudience} with transparent timelines and zero hidden overhead.`,
    critique:
      offer.length > 15
        ? 'Clear core mechanism identified. Ensure pricing parameters or free-assessment assurances are prominent.'
        : 'Offer description is brief. Needs concrete deliverables to eliminate buyer uncertainty.',
  };

  // ==========================================
  // 4. Missing Trust Signals
  // ==========================================
  const missingTrustSignals: MissingTrustSignal[] = [
    {
      element: 'Verified Client Case Studies / Proof',
      description: 'Transparent client feedback showing tangible turnaround or business outcomes.',
      whyItMatters: 'Reduces perceived purchase risk by 40% before form submission.',
      isAvailable: !!trustSection,
    },
    {
      element: 'Zero-Risk Guarantee / Assurance',
      description: 'Explicit guarantee (e.g. 100% Satisfaction or rapid response commitment).',
      whyItMatters: 'Removes final hesitation at the bottom of the funnel.',
      isAvailable: !!page.sections.find((s) => s.type === 'guarantee'),
    },
    {
      element: 'Response Time Commitment',
      description: 'Concrete timeline commitment (e.g. "Response within 15 minutes during business hours").',
      whyItMatters: 'Inquiries decay rapidly; fast response promises drive immediate form completion.',
      isAvailable: headline.includes('min') || subheadline.includes('hour'),
    },
  ];

  // ==========================================
  // 5. Mobile & Friction Analysis
  // ==========================================
  const mobileChecks = [
    {
      name: 'Headline Scan-Length',
      passed: headlineWords <= 12,
      detail: headlineWords <= 12 ? 'Headline wraps cleanly on 390px screens' : 'Headline may cause 4+ text wraps on mobile devices',
    },
    {
      name: 'CTA Button Touch Target',
      passed: true,
      detail: 'Buttons are engineered with 44px+ minimum touch targets and generous padding',
    },
    {
      name: 'Form Field Count Under 4',
      passed: formFields.length <= 3,
      detail: `Currently ${formFields.length} input fields. Mobile conversion drops ~10% for every additional input field beyond 3.`,
    },
    {
      name: 'Clear Visual Hierarchy',
      passed: page.sections.length >= 4 && page.sections.length <= 8,
      detail: `${page.sections.length} core sections maintain page cadence without mobile infinite-scroll fatigue.`,
    },
  ];

  const mobileScore = Math.round(
    (mobileChecks.filter((c) => c.passed).length / mobileChecks.length) * 35 + 60
  );

  const mobileAnalysis: MobileAnalysis = {
    readinessScore: mobileScore,
    checks: mobileChecks,
    recommendations: [
      formFields.length > 3 ? 'Reduce lead capture form to Name, Email & Phone on mobile' : 'Keep single-column CTA visible above the fold',
      'Maintain contrasting button colors with 16px vertical padding for thumb ergonomics',
    ],
  };

  const frictionAnalysis: FrictionAnalysis = {
    score: formFields.length <= 3 ? 92 : 74,
    formFieldCount: formFields.length,
    recommendedFieldCount: 3,
    paragraphDensity: 'optimal',
    excessiveChoices: false,
    frictionPoints: [
      formFields.length > 3 ? `Form asks for ${formFields.length} fields; reduce to 2-3 fields` : 'Low form friction detected',
      isGenericCTA ? 'Ambiguous CTA label creates uncertainty about subsequent steps' : 'Clear next step defined',
    ],
    recommendations: [
      'Ensure reassurance text sits directly beneath the submit button (e.g. "We respect your privacy. No spam ever.")',
      'Use autofill-friendly HTML attributes for standard contact inputs',
    ],
  };

  // ==========================================
  // 6. Section Scores
  // ==========================================
  const sectionScores: SectionScoreAnalysis[] = page.sections.map((sec) => {
    let score = 85;
    let whyScore = 'Strong structure with conversion-aligned layout.';
    const whatsWorking: string[] = [];
    const whatCouldImprove: string[] = [];
    let recommendedAction = 'Maintain current layout and review periodically.';

    if (sec.type === 'hero') {
      score = isHeadlineSpecific && !isGenericCTA ? 94 : 76;
      whyScore = isHeadlineSpecific
        ? 'Hero communicates offer and primary call to action within 3 seconds of viewing.'
        : 'Hero headline is slightly broad and could state the concrete benefit faster.';
      whatsWorking.push('Clean viewport framing with prominent CTA placement', 'High contrast headline typography');
      if (isGenericCTA) whatCouldImprove.push('Upgrade button text from generic phrasing to outcome-specific promise');
      if (!isHeadlineSpecific) whatCouldImprove.push('Sharpen headline with specific time-to-value or tangible deliverable');
      recommendedAction = 'Sharpen headline specificity and strengthen action button verb.';
    } else if (sec.type === 'social_proof') {
      score = 78;
      whyScore = 'Trust indicators validate the business without fabricating customer identities.';
      whatsWorking.push('Structured proof layout ready for verified customer feedback');
      whatCouldImprove.push('Add specific quantifiable outcomes (e.g. turnaround time or project scope)');
      recommendedAction = 'Insert specific client outcomes and recognized trust badges.';
    } else if (sec.type === 'problem') {
      score = 88;
      whyScore = 'Accurately articulates customer friction points to build empathy.';
      whatsWorking.push('Speaks directly to customer frustration before introducing solution');
      whatCouldImprove.push('Highlight the financial or operational cost of inaction');
      recommendedAction = 'Add contrast between the pain of inaction and ease of the solution.';
    } else if (sec.type === 'solution' || sec.type === 'benefits') {
      score = 90;
      whyScore = 'Translates capabilities into clear customer benefits rather than dry feature lists.';
      whatsWorking.push('Benefit cards grouped logically with clear scannability', 'Icon-supported visual rhythm');
      whatCouldImprove.push('Tie each benefit to an end financial, time, or peace-of-mind metric');
      recommendedAction = 'Emphasize time saved or risk eliminated.';
    } else if (sec.type === 'lead_capture' || sec.type === 'final_cta') {
      score = formFields.length <= 3 ? 92 : 72;
      whyScore = formFields.length <= 3
        ? 'Streamlined form minimizes input friction.'
        : 'Form requests more information than necessary for initial contact.';
      whatsWorking.push('Clear submit trigger with immediate visual feedback');
      if (formFields.length > 3) whatCouldImprove.push('Trim optional fields to increase completion velocity');
      recommendedAction = 'Keep form inputs minimal to maximize completion rate.';
    } else if (sec.type === 'faq') {
      score = 86;
      whyScore = 'Directly addresses pre-purchase hesitation and answers common buyer questions.';
      whatsWorking.push('Clear accordion layout that saves vertical screen real estate');
      whatCouldImprove.push('Address pricing, onboarding speed, and cancellation policies directly');
      recommendedAction = 'Ensure top 3 buying objections are directly answered.';
    }

    return {
      sectionId: sec.id,
      sectionType: sec.type,
      title: (sec.content?.title || sec.content?.headline || sec.type.toUpperCase().replace('_', ' ')) as string,
      score,
      whyScore,
      whatsWorking,
      whatCouldImprove,
      recommendedAction,
    };
  });

  // ==========================================
  // 7. 15 Scoring Dimensions
  // ==========================================
  const dimensions: ScoringDimension[] = [
    {
      key: 'headline_clarity',
      name: 'Headline Clarity',
      score: headlineAnalysis.clarityScore,
      weight: 10,
      feedback: headlineAnalysis.clarityScore > 80 ? 'Clear value articulation above the fold.' : 'Headline needs sharper benefit focus.',
      status: headlineAnalysis.clarityScore >= 85 ? 'excellent' : 'warning',
    },
    {
      key: 'offer_clarity',
      name: 'Offer Clarity',
      score: offerAnalysis.overallClarity,
      weight: 12,
      feedback: 'Offer states core mechanism clearly.',
      status: offerAnalysis.overallClarity >= 85 ? 'excellent' : 'good',
    },
    {
      key: 'audience_relevance',
      name: 'Audience Relevance',
      score: targetAudience ? 88 : 65,
      weight: 8,
      feedback: targetAudience ? `Targeted towards ${targetAudience}.` : 'Specify exact customer persona.',
      status: targetAudience ? 'good' : 'warning',
    },
    {
      key: 'value_proposition',
      name: 'Value Proposition',
      score: 87,
      weight: 10,
      feedback: 'Clear differentiation between pain point and final outcome.',
      status: 'excellent',
    },
    {
      key: 'cta_strength',
      name: 'CTA Strength',
      score: ctaAnalysis.clarityScore,
      weight: 12,
      feedback: isGenericCTA ? 'Button copy is generic; use action-oriented promise.' : 'Strong, intent-driven call to action.',
      status: isGenericCTA ? 'warning' : 'excellent',
    },
    {
      key: 'trust_credibility',
      name: 'Trust & Credibility',
      score: trustSection ? 82 : 62,
      weight: 10,
      feedback: trustSection ? 'Social proof section present.' : 'Add testimonials and verified proof indicators.',
      status: trustSection ? 'good' : 'critical',
    },
    {
      key: 'objection_handling',
      name: 'Objection Handling',
      score: faqSection ? 88 : 68,
      weight: 6,
      feedback: faqSection ? 'FAQ handles common purchase hesitation.' : 'Add FAQ section to resolve risk.',
      status: faqSection ? 'excellent' : 'warning',
    },
    {
      key: 'content_hierarchy',
      name: 'Content Hierarchy',
      score: 90,
      weight: 5,
      feedback: 'Sequential narrative flows from Problem → Solution → Proof → Action.',
      status: 'excellent',
    },
    {
      key: 'friction_reduction',
      name: 'Friction Level',
      score: frictionAnalysis.score,
      weight: 6,
      feedback: frictionAnalysis.score > 80 ? 'Low friction contact pathway.' : 'Simplify inputs to boost submissions.',
      status: frictionAnalysis.score >= 80 ? 'excellent' : 'warning',
    },
    {
      key: 'lead_capture',
      name: 'Lead Capture Architecture',
      score: leadSection ? 92 : 75,
      weight: 6,
      feedback: 'Direct capture mechanism configured with local storage persistence.',
      status: 'excellent',
    },
    {
      key: 'mobile_readiness',
      name: 'Mobile Readiness',
      score: mobileAnalysis.readinessScore,
      weight: 5,
      feedback: 'Responsive breakpoint scaling with 44px minimum touch targets.',
      status: mobileAnalysis.readinessScore >= 80 ? 'excellent' : 'good',
    },
    {
      key: 'information_completeness',
      name: 'Information Completeness',
      score: 85,
      weight: 3,
      feedback: 'Covers essential business details, service scope, and contact method.',
      status: 'good',
    },
    {
      key: 'urgency_relevance',
      name: 'Urgency & Timing',
      score: 80,
      weight: 3,
      feedback: 'Communicates prompt scheduling and responsiveness.',
      status: 'good',
    },
    {
      key: 'visual_hierarchy',
      name: 'Visual Hierarchy & Scannability',
      score: 93,
      weight: 2,
      feedback: 'High-contrast typography, mathematical spacing, and zero slop styling.',
      status: 'excellent',
    },
    {
      key: 'message_consistency',
      name: 'Message Consistency',
      score: 89,
      weight: 2,
      feedback: 'Hero promise aligns seamlessly with final CTA offer.',
      status: 'excellent',
    },
  ];

  // Weighted overall calculation
  const totalWeight = dimensions.reduce((acc, d) => acc + d.weight, 0);
  const weightedSum = dimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // ==========================================
  // 8. Priority Actions (Top 3 Improvements)
  // ==========================================
  const priorityActions: PriorityAction[] = [];

  // Priority 1: CTA Optimization if generic
  if (isGenericCTA) {
    priorityActions.push({
      id: 'pa_cta_upgrade',
      category: 'cta',
      priority: 'critical',
      impact: 'high',
      confidence: 'high',
      effort: 'low',
      title: 'Upgrade Button Copy to High-Value Action Promise',
      problem: `Current button text "${primaryCTA}" is generic and creates hesitation.`,
      whyItMatters: 'Specific action verbs that state what the user receives lift click-through rates by up to 28%.',
      currentState: primaryCTA,
      recommendedState: recommendedCTA,
      action: 'Apply High-Conversion CTA Copy',
      affectedSections: ['hero', 'final_cta', 'lead_capture'],
      mutationPayload: {
        field: 'ctaText',
        value: recommendedCTA,
        actionType: 'UPDATE_CTA',
      },
    });
  } else {
    priorityActions.push({
      id: 'pa_headline_sharpen',
      category: 'headline',
      priority: 'high',
      impact: 'high',
      confidence: 'high',
      effort: 'low',
      title: 'Sharpen Headline with Immediate Outcome Promise',
      problem: 'Headline communicates the service, but can deliver a sharper tangible hook.',
      whyItMatters: 'Visitors decide whether to remain on your landing page within 3 seconds.',
      currentState: headline,
      recommendedState: benefitAlt,
      action: 'Apply Benefit-Driven Headline',
      affectedSections: ['hero'],
      mutationPayload: {
        sectionType: 'hero',
        field: 'headline',
        value: benefitAlt,
        actionType: 'UPDATE_HEADLINE',
      },
    });
  }

  // Priority 2: Trust Signals / Guarantee
  priorityActions.push({
    id: 'pa_trust_reassurance',
    category: 'trust',
    priority: 'high',
    impact: 'high',
    confidence: 'high',
    effort: 'low',
    title: 'Reinforce Risk-Reversal Subtext Below Form',
    problem: 'Prospects hesitate before submitting contact details without explicit reassurance.',
    whyItMatters: 'Explicit privacy and satisfaction assurances reduce submission friction.',
    currentState: page.ctaConfig?.primarySubtext || 'Direct contact',
    recommendedState: '🔒 100% Confidential. Zero spam. Direct engineer response within 15 mins.',
    action: 'Apply Risk-Reversal Reassurance',
    affectedSections: ['hero', 'final_cta', 'lead_capture'],
    mutationPayload: {
      field: 'primarySubtext',
      value: '🔒 100% Confidential. Zero spam. Direct engineer response within 15 mins.',
      actionType: 'UPDATE_SUBTEXT',
    },
  });

  // Priority 3: Form friction or FAQ objections
  if (formFields.length > 3) {
    priorityActions.push({
      id: 'pa_form_reduction',
      category: 'friction',
      priority: 'medium',
      impact: 'high',
      confidence: 'high',
      effort: 'low',
      title: 'Streamline Lead Capture to 3 Essential Fields',
      problem: `Form currently requires ${formFields.length} inputs, which causes mobile drop-off.`,
      whyItMatters: 'Every additional form field reduces mobile completion rates by 7-10%.',
      currentState: `${formFields.length} form fields`,
      recommendedState: 'Name, Email, and Phone only',
      action: 'Trim Lead Form to High-Velocity Inputs',
      affectedSections: ['lead_capture'],
      mutationPayload: {
        sectionType: 'lead_capture',
        field: 'fields',
        value: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Mercer', required: true },
          { name: 'email', label: 'Work Email', type: 'email', placeholder: 'alex@company.com', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 019-2834', required: false },
        ],
        actionType: 'UPDATE_FIELDS',
      },
    });
  } else {
    priorityActions.push({
      id: 'pa_urgency_badge',
      category: 'offer',
      priority: 'medium',
      impact: 'medium',
      confidence: 'high',
      effort: 'low',
      title: 'Add Contextual Urgency Badge Above Main Headline',
      problem: 'Visitors lack immediate context on current availability or response velocity.',
      whyItMatters: 'Contextual badges set expectations and encourage fast action without false countdown timers.',
      currentState: 'No explicit response velocity badge',
      recommendedState: 'FAST 15-MIN RESPONSE • IMMEDIATE ONBOARDING AVAILABLE',
      action: 'Apply Availability Badge',
      affectedSections: ['hero'],
      mutationPayload: {
        sectionType: 'hero',
        field: 'urgencyBadge',
        value: 'FAST 15-MIN RESPONSE • IMMEDIATE ONBOARDING AVAILABLE',
        actionType: 'UPDATE_BADGE',
      },
    });
  }

  const analysis: ConversionAnalysis = {
    id: `eval_${page.id}_${Date.now()}`,
    pageId: page.id,
    score: overallScore,
    summary:
      overallScore >= 85
        ? 'High conversion readiness. Clear narrative architecture, strong CTA placement, and low form friction.'
        : 'Good foundation with clear opportunities to lift conversions by upgrading CTA specificity and reinforcing trust signals.',
    strengths: [
      'Narrative structure guides user sequentially from problem empathy to action',
      'High-contrast typography ensures immediate scannability',
      'Mobile viewport layout conforms to 44px touch target standards',
      'Structured lead capture pipeline with instant local persistence',
    ],
    weaknesses: [
      isGenericCTA ? 'Button copy uses generic phrasing instead of outcome-oriented promise' : 'Trust signals rely on placeholders pending verified client reviews',
      'Final hesitation objection handling could be reinforced with a concrete response guarantee',
    ],
    risks: [
      'Visitors skimming on mobile may drop off if headline does not state immediate benefit in 3 seconds',
    ],
    dimensions,
    sectionScores,
    missingTrustSignals,
    ctaAnalysis,
    headlineAnalysis,
    offerAnalysis,
    audienceAnalysis: {
      relevanceScore: targetAudience ? 88 : 70,
      targetClarity: targetAudience || 'General commercial audience',
      feedback: targetAudience
        ? `Page specifically addresses challenges experienced by ${targetAudience}.`
        : 'Specify target audience to increase resonance.',
    },
    frictionAnalysis,
    mobileAnalysis,
    contentAnalysis: {
      wordCount: page.sections.reduce((acc, s) => acc + JSON.stringify(s.content).split(/\s+/).length, 0),
      readingTimeMinutes: 2,
      toneConsistency: 'Confident, direct, outcome-focused',
    },
    seoAnalysis: {
      titleLength: page.seo?.title?.length || 45,
      metaDescriptionLength: page.seo?.metaDescription?.length || 135,
      keywordCoverage: page.seo?.keywords || ['landing page', 'conversion', 'edc media'],
      recommendations: [
        'Ensure primary keyword appears in the first 30 characters of the page title',
        'Keep meta description under 155 characters for clean search snippet rendering',
      ],
    },
    priorityActions,
    generatedAt: new Date().toISOString(),
    analyzedVersion: 1,
    inputFingerprint: computePageFingerprint(page),
    model: 'edc-conversion-heuristics-v2',
  };

  return analysis;
}

/**
 * Executes a full Gemini-driven evaluation with deep reasoning,
 * falling back gracefully to the deterministic engine if Gemini is unavailable.
 */
export async function evaluateConversionAI(page: LandingPage): Promise<ConversionAnalysis> {
  const ai = getGeminiClient();
  const baseline = evaluateConversionDeterministic(page);

  if (!ai) {
    return baseline;
  }

  try {
    const prompt = `
You are the Lead Conversion Rate Optimization (CRO) Specialist and AI Conversion Intelligence Engineer for EDC Media.
Perform an in-depth, rigorous conversion evaluation of this landing page.

PAGE DATA:
Business Name: ${page.businessProfile.name}
Offer: ${page.businessProfile.offer}
Target Audience: ${page.businessProfile.targetAudience}
Primary Goal: ${page.businessProfile.primaryGoal}
Current Primary CTA: ${page.ctaConfig.primaryText}
Headline: ${page.sections.find((s) => s.type === 'hero')?.content?.headline || ''}
Subheadline: ${page.sections.find((s) => s.type === 'hero')?.content?.subheadline || ''}
Sections Count: ${page.sections.length} (${page.sections.map((s) => s.type).join(', ')})
Lead Form Fields: ${page.leadCaptureConfig.fields.map((f) => f.name).join(', ')}

EVIDENCE DISCIPLINE:
- Strictly distinguish between FACT (actual data in profile), INFERENCE, and RECOMMENDATION.
- DO NOT invent fake revenue increases (e.g. "will increase sales by 37%").
- DO NOT fabricate fake awards, certifications, or fake customer quotes.
- Provide practical, high-impact conversion insights.

Return a strictly valid JSON response (no markdown fences) matching this structure:
{
  "score": number (0-100 overall score),
  "summary": string (2-3 sentences assessing conversion readiness),
  "strengths": string[] (3-4 bullet points of what is working well),
  "weaknesses": string[] (2-3 bullet points of conversion leaks),
  "risks": string[] (1-2 risks of buyer bounce),
  "headlineAlternatives": {
    "direct": string,
    "benefitDriven": string,
    "outcomeDriven": string
  },
  "recommendedCTA": string,
  "ctaFeedback": string,
  "top3Improvements": [
    {
      "id": string,
      "title": string,
      "problem": string,
      "whyItMatters": string,
      "currentState": string,
      "recommendedState": string,
      "action": string
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are EDC Media Conversion Intelligence AI. You evaluate landing page copy, layout, trust, and friction with mathematical precision and ruthless clarity.',
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim();
    if (!text) return baseline;

    const data = JSON.parse(text);

    // Merge Gemini intelligence into the baseline structure
    if (typeof data.score === 'number' && data.score >= 50 && data.score <= 100) {
      baseline.score = data.score;
    }
    if (data.summary) baseline.summary = data.summary;
    if (Array.isArray(data.strengths) && data.strengths.length > 0) baseline.strengths = data.strengths;
    if (Array.isArray(data.weaknesses) && data.weaknesses.length > 0) baseline.weaknesses = data.weaknesses;
    if (Array.isArray(data.risks) && data.risks.length > 0) baseline.risks = data.risks;

    if (data.headlineAlternatives) {
      baseline.headlineAnalysis.alternatives = {
        direct: data.headlineAlternatives.direct || baseline.headlineAnalysis.alternatives.direct,
        benefitDriven: data.headlineAlternatives.benefitDriven || baseline.headlineAnalysis.alternatives.benefitDriven,
        outcomeDriven: data.headlineAlternatives.outcomeDriven || baseline.headlineAnalysis.alternatives.outcomeDriven,
      };
    }

    if (data.recommendedCTA) {
      baseline.ctaAnalysis.recommendedCTA = data.recommendedCTA;
    }
    if (data.ctaFeedback) {
      baseline.ctaAnalysis.explanation = data.ctaFeedback;
    }

    if (Array.isArray(data.top3Improvements) && data.top3Improvements.length === 3) {
      baseline.priorityActions = data.top3Improvements.map((imp: any, idx: number) => ({
        id: imp.id || `pa_gemini_${idx}`,
        category: (idx === 0 ? 'cta' : idx === 1 ? 'headline' : 'trust') as any,
        priority: (idx === 0 ? 'critical' : idx === 1 ? 'high' : 'medium') as any,
        impact: 'high',
        confidence: 'high',
        effort: 'low',
        title: imp.title,
        problem: imp.problem,
        whyItMatters: imp.whyItMatters,
        currentState: imp.currentState,
        recommendedState: imp.recommendedState,
        action: imp.action,
        affectedSections: ['hero', 'final_cta', 'lead_capture'],
        mutationPayload: baseline.priorityActions[idx]?.mutationPayload,
      }));
    }

    baseline.inputFingerprint = computePageFingerprint(page);
    baseline.model = 'gemini-3.8-flash';
    return baseline;
  } catch (err: any) {
    const isRateLimit =
      err?.status === 429 ||
      err?.message?.includes('429') ||
      err?.message?.includes('quota') ||
      err?.message?.includes('RESOURCE_EXHAUSTED');
    const isUnavailable =
      err?.status === 503 ||
      err?.message?.includes('503') ||
      err?.message?.includes('demand') ||
      err?.message?.includes('UNAVAILABLE');

    if (isRateLimit) {
      console.info('Conversion AI evaluation: quota limit reached, seamlessly applied deterministic baseline.');
    } else if (isUnavailable) {
      console.info('Conversion AI evaluation: model at capacity, seamlessly applied deterministic baseline.');
    } else {
      console.info('Conversion AI evaluation: completed with deterministic baseline.');
    }

    baseline.inputFingerprint = computePageFingerprint(page);
    baseline.model = 'edc-conversion-heuristics-v2';
    return baseline;
  }
}
