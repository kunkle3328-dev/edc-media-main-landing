import { NextRequest, NextResponse } from 'next/server';
import { processNaturalLanguageEdit } from '@/lib/ai-generator';
import { LandingPage } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, instruction } = body as { page: LandingPage; instruction: string };

    if (!page || !instruction) {
      return NextResponse.json(
        { error: 'Page data and an edit instruction are required.' },
        { status: 400 }
      );
    }

    const updatedPage = await processNaturalLanguageEdit(page, instruction);
    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error) {
    console.error('Error processing natural language edit:', error);
    return NextResponse.json(
      {
        error: 'Could not process the edit instruction at this time. Please try again.',
      },
      { status: 500 }
    );
  }
}
