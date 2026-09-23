import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { AnalyticsEvent } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      landingPageId,
      landingPageVersionId,
      workspaceId = 'workspace_edc_default',
      sessionId,
      eventType,
      path,
      sectionId,
      elementId,
      ctaSource,
      referrer,
      deviceType = 'unknown',
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      metadata,
    } = body;

    if (!landingPageId || !eventType) {
      return NextResponse.json({ success: false, error: 'landingPageId and eventType are required.' }, { status: 400 });
    }

    const event: AnalyticsEvent = {
      id: body.id || 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      workspaceId,
      landingPageId,
      landingPageVersionId,
      sessionId: sessionId || 'sess_anon_' + Math.random().toString(36).substring(2, 7),
      eventType,
      timestamp: body.timestamp || new Date().toISOString(),
      path: path || '',
      sectionId,
      elementId,
      ctaSource,
      referrer: referrer || req.headers.get('referer') || undefined,
      deviceType,
      browser: req.headers.get('user-agent') || undefined,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      metadata,
    };

    serverStorage.recordEvent(event);

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error: any) {
    console.error('Analytics event ingest error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to record event.' }, { status: 500 });
  }
}
