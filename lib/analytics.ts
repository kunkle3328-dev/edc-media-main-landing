import {
  AnalyticsEvent,
  ConversionEventType,
  ConversionFunnelMetrics,
  TrafficSourceMetric,
  DeviceMetric,
  VersionPerformanceMetric,
  CtaSourceMetric,
} from '@/types/landing-engine';
import { pageStorage } from './storage';

export class ConversionAnalyticsEngine {
  private static instance: ConversionAnalyticsEngine;
  private sessionId: string = '';
  private utmParams: Record<string, string> = {};

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initSession();
    }
  }

  public static getInstance(): ConversionAnalyticsEngine {
    if (!ConversionAnalyticsEngine.instance) {
      ConversionAnalyticsEngine.instance = new ConversionAnalyticsEngine();
    }
    return ConversionAnalyticsEngine.instance;
  }

  private initSession(): void {
    try {
      let sId = sessionStorage.getItem('edc_analytics_session_id');
      if (!sId) {
        sId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('edc_analytics_session_id', sId);
      }
      this.sessionId = sId;

      // Extract UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      const utms: Record<string, string> = {};
      const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      keys.forEach((k) => {
        const val = urlParams.get(k);
        if (val) utms[k] = val;
      });
      this.utmParams = utms;
    } catch {
      this.sessionId = 'sess_local_' + Math.random().toString(36).substring(2, 9);
    }
  }

  public getSessionId(): string {
    if (!this.sessionId) this.initSession();
    return this.sessionId;
  }

  public getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';
    const width = window.innerWidth;
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/i.test(ua) || (width >= 640 && width < 1024 && 'ontouchstart' in window)) {
      return 'tablet';
    }
    if (/mobi|android|iphone/i.test(ua) || width < 640) {
      return 'mobile';
    }
    return 'desktop';
  }

  public getTrafficSource(): string {
    if (typeof window === 'undefined') return 'direct';
    if (this.utmParams['utm_source']) {
      const src = this.utmParams['utm_source'].toLowerCase();
      if (src.includes('google') || src.includes('bing') || src.includes('duck')) {
        return this.utmParams['utm_medium'] === 'cpc' ? 'paid' : 'organic';
      }
      if (src.includes('facebook') || src.includes('instagram') || src.includes('linkedin') || src.includes('twitter') || src.includes('x')) {
        return 'social';
      }
      if (src.includes('email') || src.includes('newsletter')) {
        return 'email';
      }
      return src;
    }

    const ref = document.referrer ? document.referrer.toLowerCase() : '';
    if (!ref) return 'direct';
    if (ref.includes(window.location.hostname)) return 'internal';
    if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) return 'organic';
    if (ref.includes('facebook') || ref.includes('twitter') || ref.includes('instagram') || ref.includes('linkedin') || ref.includes('t.co')) return 'social';
    return 'referral';
  }

  /**
   * Track a conversion event
   */
  public trackConversion(
    eventType: ConversionEventType,
    options: {
      landingPageId: string;
      landingPageVersionId?: string;
      workspaceId?: string;
      sectionId?: string;
      elementId?: string;
      ctaSource?: string;
      metadata?: Record<string, any>;
    }
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      workspaceId: options.workspaceId || 'workspace_edc_default',
      landingPageId: options.landingPageId,
      landingPageVersionId: options.landingPageVersionId,
      sessionId: this.getSessionId(),
      eventType,
      timestamp: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      sectionId: options.sectionId,
      elementId: options.elementId,
      ctaSource: options.ctaSource,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      deviceType: this.getDeviceType(),
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      utmSource: this.utmParams['utm_source'] || this.getTrafficSource(),
      utmMedium: this.utmParams['utm_medium'],
      utmCampaign: this.utmParams['utm_campaign'],
      utmContent: this.utmParams['utm_content'],
      utmTerm: this.utmParams['utm_term'],
      metadata: options.metadata,
    };

    // Store in local storage
    pageStorage.recordAnalyticsEvent(event);

    // Also dispatch to server API asynchronously
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/landing-engine/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Safe failover
      }
    }

    return event;
  }

  /**
   * Compatibility wrapper for legacy analytics calls
   */
  public track(event: string, properties?: Record<string, any>): void {
    const pageId = properties?.pageId || properties?.landingPageId || '';
    if (pageId) {
      let mappedType: ConversionEventType = 'page_view';
      if (event === 'cta_clicked') mappedType = 'hero_cta_clicked';
      else if (event === 'lead_submitted') mappedType = 'form_completed';
      else if (event === 'preview_opened' || event === 'page_view') mappedType = 'page_view';

      this.trackConversion(mappedType, {
        landingPageId: pageId,
        ctaSource: properties?.target || properties?.ctaSource,
        metadata: properties,
      });
    }
  }

  /**
   * Compute actual conversion funnel metrics strictly from real logged events
   */
  public computeFunnelMetrics(
    events: AnalyticsEvent[],
    dateRange: '7d' | '30d' | '90d' | 'all' = '30d'
  ): ConversionFunnelMetrics {
    const now = Date.now();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 3650;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    const filtered = events.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
    const totalEventsCount = filtered.length;

    // Unique visitors by sessionId
    const sessionMap = new Map<string, AnalyticsEvent[]>();
    filtered.forEach((e) => {
      const list = sessionMap.get(e.sessionId) || [];
      list.push(e);
      sessionMap.set(e.sessionId, list);
    });

    const uniqueSessions = sessionMap.size;
    const pageViews = filtered.filter((e) => e.eventType === 'page_view').length;
    const visitors = Math.max(uniqueSessions, pageViews);

    const ctaInteractions = filtered.filter((e) =>
      [
        'hero_cta_clicked',
        'secondary_cta_clicked',
        'pricing_cta_clicked',
        'final_cta_clicked',
        'sticky_mobile_cta_clicked',
        'phone_clicked',
        'email_clicked',
      ].includes(e.eventType)
    ).length;

    const formStarts = filtered.filter((e) => e.eventType === 'form_started').length;
    const formCompletions = filtered.filter((e) => e.eventType === 'form_completed').length;
    const leads = formCompletions;

    // Conversion rates computed ONLY from actual events
    const ctaClickRate = visitors > 0 ? (ctaInteractions / visitors) * 100 : 0;
    const formStartRate = visitors > 0 ? (formStarts / visitors) * 100 : 0;
    const formCompletionRate = formStarts > 0 ? (formCompletions / formStarts) * 100 : 0;
    const conversionRate = visitors > 0 ? (leads / visitors) * 100 : 0;

    // Traffic sources breakdown
    const sourceMap = new Map<string, { visitors: Set<string>; leads: number }>();
    filtered.forEach((e) => {
      const src = (e.utmSource || 'direct').toLowerCase();
      const curr = sourceMap.get(src) || { visitors: new Set(), leads: 0 };
      curr.visitors.add(e.sessionId);
      if (e.eventType === 'form_completed') curr.leads += 1;
      sourceMap.set(src, curr);
    });

    const trafficSources: TrafficSourceMetric[] = Array.from(sourceMap.entries()).map(([src, val]) => {
      const visCount = val.visitors.size;
      return {
        source: src,
        visitors: visCount,
        leads: val.leads,
        conversionRate: visCount > 0 ? Number(((val.leads / visCount) * 100).toFixed(1)) : 0,
      };
    });

    // Device breakdown
    const deviceMap = new Map<
      'mobile' | 'tablet' | 'desktop' | 'unknown',
      { visitors: Set<string>; formStarts: number; leads: number }
    >();
    (['mobile', 'tablet', 'desktop', 'unknown'] as const).forEach((d) => {
      deviceMap.set(d, { visitors: new Set(), formStarts: 0, leads: 0 });
    });

    filtered.forEach((e) => {
      const d = e.deviceType || 'unknown';
      const curr = deviceMap.get(d) || { visitors: new Set(), formStarts: 0, leads: 0 };
      curr.visitors.add(e.sessionId);
      if (e.eventType === 'form_started') curr.formStarts += 1;
      if (e.eventType === 'form_completed') curr.leads += 1;
      deviceMap.set(d, curr);
    });

    const deviceBreakdown: DeviceMetric[] = Array.from(deviceMap.entries())
      .map(([device, val]) => {
        const vis = val.visitors.size;
        return {
          device,
          visitors: vis,
          formStarts: val.formStarts,
          leads: val.leads,
          conversionRate: vis > 0 ? Number(((val.leads / vis) * 100).toFixed(1)) : 0,
        };
      })
      .filter((d) => d.visitors > 0);

    // Version performance
    const versionMap = new Map<
      string,
      { versionNumber: number; versionId: string; visitors: Set<string>; ctaInteractions: number; leads: number }
    >();

    filtered.forEach((e) => {
      const vId = e.landingPageVersionId || 'current';
      const curr = versionMap.get(vId) || {
        versionNumber: 1,
        versionId: vId,
        visitors: new Set(),
        ctaInteractions: 0,
        leads: 0,
      };
      curr.visitors.add(e.sessionId);
      if (e.eventType.includes('cta')) curr.ctaInteractions += 1;
      if (e.eventType === 'form_completed') curr.leads += 1;
      versionMap.set(vId, curr);
    });

    const versionPerformance: VersionPerformanceMetric[] = Array.from(versionMap.entries()).map(([vId, v]) => {
      const vis = v.visitors.size;
      return {
        versionId: vId,
        versionNumber: v.versionNumber,
        isPublished: true,
        visitors: vis,
        ctaInteractions: v.ctaInteractions,
        leads: v.leads,
        conversionRate: vis > 0 ? Number(((v.leads / vis) * 100).toFixed(1)) : 0,
      };
    });

    // Top CTA Sources
    const ctaMap = new Map<string, { clicks: number; leads: number }>();
    filtered.forEach((e) => {
      if (e.ctaSource) {
        const curr = ctaMap.get(e.ctaSource) || { clicks: 0, leads: 0 };
        if (e.eventType.includes('cta')) curr.clicks += 1;
        if (e.eventType === 'form_completed') curr.leads += 1;
        ctaMap.set(e.ctaSource, curr);
      }
    });

    const topCtaSources: CtaSourceMetric[] = Array.from(ctaMap.entries()).map(([source, val]) => ({
      source,
      clicks: val.clicks,
      leads: val.leads,
    }));

    const hasEnoughData = visitors >= 10 || totalEventsCount >= 15;

    return {
      visitors,
      uniqueSessions,
      ctaInteractions,
      formStarts,
      formCompletions,
      leads,
      conversionRate: Number(conversionRate.toFixed(1)),
      ctaClickRate: Number(ctaClickRate.toFixed(1)),
      formStartRate: Number(formStartRate.toFixed(1)),
      formCompletionRate: Number(formCompletionRate.toFixed(1)),
      leadConversionRate: Number(conversionRate.toFixed(1)),
      trafficSources,
      deviceBreakdown,
      versionPerformance,
      topCtaSources,
      dateRange,
      hasEnoughData,
      totalEventsCount,
    };
  }

  /**
   * Convenience helper to fetch events from pageStorage for a page and compute metrics
   */
  public getFunnelMetrics(
    pageId: string,
    dateRange: '7d' | '30d' | '90d' | 'all' = '30d'
  ): ConversionFunnelMetrics {
    const events = pageStorage.getAnalyticsEvents(pageId);
    return this.computeFunnelMetrics(events, dateRange);
  }
}

export const analytics = ConversionAnalyticsEngine.getInstance();
