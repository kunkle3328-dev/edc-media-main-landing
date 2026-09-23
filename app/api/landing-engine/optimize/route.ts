import { NextRequest, NextResponse } from 'next/server';
import { generateOptimizationRun } from '@/lib/ai-generator';
import { LandingPage } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page } = body as { page: LandingPage };

    if (!page) {
      return NextResponse.json({ error: 'Page data is required for optimization.' }, { status: 400 });
    }

    const optimizationRun = await generateOptimizationRun(page);
    return NextResponse.json({
      success: true,
      page: optimizationRun.proposedPage,
      optimizationRun,
    });
  } catch (error) {
    console.error('Error applying AI optimization:', error);
    return NextResponse.json(
      { error: 'Optimization could not be completed. Your original page remains unchanged.' },
      { status: 500 }
    );
  }
}

