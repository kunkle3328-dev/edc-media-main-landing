import { NextRequest, NextResponse } from 'next/server';
import { evaluateConversionAI } from '@/lib/conversion-intelligence';
import { LandingPage } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page } = body as { page: LandingPage };

    if (!page) {
      return NextResponse.json(
        { error: 'Page data is required for conversion analysis.' },
        { status: 400 }
      );
    }

    const analysis = await evaluateConversionAI(page);
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error in conversion analysis route:', error);
    return NextResponse.json(
      { error: 'Failed to complete conversion analysis.' },
      { status: 500 }
    );
  }
}
