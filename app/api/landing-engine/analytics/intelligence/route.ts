import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { analytics } from '@/lib/analytics';
import { evaluateBehavioralIntelligence } from '@/lib/behavioral-intelligence';
import { LandingPage } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, page, dateRange = '30d' } = body;

    let targetPage: LandingPage | null = page || null;
    if (!targetPage && pageId) {
      const published = serverStorage.getPublishedPageById(pageId);
      if (published) targetPage = published.page;
    }

    if (!targetPage) {
      return NextResponse.json({ success: false, error: 'Landing page data is required.' }, { status: 400 });
    }

    const events = serverStorage.getEvents(targetPage.id);
    const metrics = analytics.computeFunnelMetrics(events, dateRange);
    const intelligence = evaluateBehavioralIntelligence(metrics, targetPage);

    return NextResponse.json({
      success: true,
      metrics,
      intelligence,
    });
  } catch (error: any) {
    console.error('Behavioral intelligence API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate behavioral intelligence.' },
      { status: 500 }
    );
  }
}
