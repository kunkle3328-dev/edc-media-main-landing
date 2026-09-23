import { NextRequest, NextResponse } from 'next/server';
import { generateLandingPageAI } from '@/lib/ai-generator';
import { BusinessProfile } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile: BusinessProfile = body.profile;

    if (!profile || !profile.name || !profile.offer) {
      return NextResponse.json(
        { error: 'Please provide at least a business name and what you sell.' },
        { status: 400 }
      );
    }

    const page = await generateLandingPageAI(profile);
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Error generating landing page:', error);
    return NextResponse.json(
      {
        error:
          'Something interrupted page generation. Your information is safe. Please try generating again.',
      },
      { status: 500 }
    );
  }
}
