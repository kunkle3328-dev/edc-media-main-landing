import {
  ConversionFunnelMetrics,
  AIAnalyticsRecommendation,
  LandingPage,
} from '@/types/landing-engine';

export function evaluateBehavioralIntelligence(
  metrics: ConversionFunnelMetrics,
  page: LandingPage
): {
  recommendations: AIAnalyticsRecommendation[];
  summary: string;
  hasSufficientData: boolean;
} {
  if (!metrics.hasEnoughData) {
    return {
      recommendations: [],
      summary:
        'NOT ENOUGH DATA YET — More real visitor activity is required before EDC Conversion Intelligence can identify a statistically reliable behavioral pattern. Publish your page and drive initial traffic to activate behavioral diagnosis.',
      hasSufficientData: false,
    };
  }

  const recs: AIAnalyticsRecommendation[] = [];

  // 1. Mobile vs Desktop discrepancy
  const mobile = metrics.deviceBreakdown.find((d) => d.device === 'mobile');
  const desktop = metrics.deviceBreakdown.find((d) => d.device === 'desktop');
  if (mobile && desktop && mobile.visitors >= 5 && desktop.visitors >= 5) {
    if (desktop.conversionRate > mobile.conversionRate * 1.8 && mobile.conversionRate < 5) {
      recs.push({
        id: 'rec_mobile_leak_' + Date.now(),
        title: 'Mobile Conversion Drop-off Detected',
        observedSignal: `Desktop visitors convert at ${desktop.conversionRate}%, whereas mobile visitors convert at only ${mobile.conversionRate}%.`,
        evidence: `Analyzed ${mobile.visitors} mobile sessions vs ${desktop.visitors} desktop sessions.`,
        epistemicType: 'OBSERVED',
        likelyCause:
          'Mobile keyboard friction, viewport spacing constraints, or sticky CTA lack of prominence on smaller viewports.',
        recommendation:
          'Reduce intake form fields to 2 on mobile (Name + Phone), enable sticky mobile bottom action bar, and increase tap target spacing.',
        expectedImpact: 'HIGH',
        confidence: 'HIGH',
        effort: 'LOW',
        nextAction: 'Activate Sticky Mobile Bottom Bar & Simplify Mobile Intake Fields',
        metricArea: 'mobile',
      });
    }
  }

  // 2. High CTA interaction but low form start (CTA-to-Form Expectation Mismatch)
  if (metrics.ctaInteractions >= 5 && metrics.ctaClickRate >= 15 && metrics.formStartRate < 8) {
    recs.push({
      id: 'rec_cta_mismatch_' + Date.now(),
      title: 'CTA-to-Form Expectation Friction',
      observedSignal: `High CTA interest (${metrics.ctaInteractions} clicks, ${metrics.ctaClickRate}% rate) but only ${metrics.formStarts} visitors (${metrics.formStartRate}%) initiated the intake form.`,
      evidence: `${metrics.ctaInteractions} CTA engagements led to only ${metrics.formStarts} form input focus events.`,
      epistemicType: 'OBSERVED',
      likelyCause:
        'The primary CTA promises an immediate outcome (e.g. quote/demo), but the destination form headline or field burden introduces cognitive hesitation.',
      recommendation:
        'Harmonize the CTA button label with the intake form headline. Reinforce instant delivery and zero spam commitment adjacent to the fields.',
      expectedImpact: 'HIGH',
      confidence: 'HIGH',
      effort: 'LOW',
      nextAction: 'Align Form Headline Directly with Primary CTA Promise',
      metricArea: 'cta',
    });
  }

  // 3. Form Abandonment (High form starts vs Low form completions)
  if (metrics.formStarts >= 4 && metrics.formCompletionRate < 40) {
    recs.push({
      id: 'rec_form_abandon_' + Date.now(),
      title: 'Intake Form Abandonment Detected',
      observedSignal: `${metrics.formStarts} visitors began typing, but only ${metrics.formCompletions} completed submission (${metrics.formCompletionRate}% completion rate).`,
      evidence: `${metrics.formStarts - metrics.formCompletions} visitors abandoned after focusing on an input field.`,
      epistemicType: 'FACT',
      likelyCause:
        'Form asks for too much sensitive personal information prematurely, or notes field is perceived as high cognitive work.',
      recommendation:
        'Make the notes/message field optional, remove unnecessary fields, and highlight single-step 30-second completion time.',
      expectedImpact: 'HIGH',
      confidence: 'HIGH',
      effort: 'LOW',
      nextAction: 'Streamline Form to Name + Email/Phone Only',
      metricArea: 'form',
    });
  }

  // 4. Low CTA Engagement overall
  if (metrics.visitors >= 10 && metrics.ctaClickRate < 5) {
    recs.push({
      id: 'rec_low_engagement_' + Date.now(),
      title: 'Above-the-Fold Hero Disengagement',
      observedSignal: `Under 5% of visitors engage with any CTA button (${metrics.ctaClickRate}% CTA interaction rate across ${metrics.visitors} visitors).`,
      evidence: `Only ${metrics.ctaInteractions} total CTA clicks across ${metrics.visitors} sessions.`,
      epistemicType: 'OBSERVED',
      likelyCause:
        'Hero value proposition does not immediately state the concrete quantifiable benefit or does not resonate with arriving traffic intent.',
      recommendation:
        'Restructure the Hero headline using the "Achieve [Result] Without [Pain]" framework and test a high-contrast urgency badge.',
      expectedImpact: 'HIGH',
      confidence: 'MEDIUM',
      effort: 'MEDIUM',
      nextAction: 'Run AI Hero Copy Optimization for Arriving Traffic Intent',
      metricArea: 'cta',
    });
  }

  // 5. Traffic Source Insights
  const topSource = [...metrics.trafficSources].sort((a, b) => b.visitors - a.visitors)[0];
  if (topSource && topSource.visitors >= 5) {
    recs.push({
      id: 'rec_source_intent_' + Date.now(),
      title: `Dominant Traffic Source: ${topSource.source.toUpperCase()}`,
      observedSignal: `${topSource.source.toUpperCase()} accounts for the majority of visitor volume (${topSource.visitors} visitors, ${topSource.conversionRate}% conversion rate).`,
      evidence: `${topSource.leads} leads generated out of ${topSource.visitors} visitors from this channel.`,
      epistemicType: 'FACT',
      likelyCause: `Campaigns or inbound links from ${topSource.source} represent your primary acquisition channel.`,
      recommendation: `Tailor social proof, testimonials, and industry badges to the specific audience mindset entering from ${topSource.source}.`,
      expectedImpact: 'MEDIUM',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      nextAction: `Customize Hero Subtitle to Match ${topSource.source.toUpperCase()} Ad / Referral Copy`,
      metricArea: 'traffic',
    });
  }

  return {
    recommendations: recs,
    summary: `EDC Behavioral Intelligence analyzed ${metrics.visitors} visitors and ${metrics.totalEventsCount} behavioral conversion signals. Identified ${recs.length} actionable conversion optimization opportunities.`,
    hasSufficientData: true,
  };
}
