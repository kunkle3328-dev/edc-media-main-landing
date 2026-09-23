import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { analytics } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const pageId = searchParams.get('pageId') || undefined;
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const dateRange = (searchParams.get('dateRange') as '7d' | '30d' | '90d' | 'all') || '30d';

    const events = serverStorage.getEvents(pageId, workspaceId);
    const metrics = analytics.computeFunnelMetrics(events, dateRange);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    console.error('Analytics metrics API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compute analytics.' },
      { status: 500 }
    );
  }
}
