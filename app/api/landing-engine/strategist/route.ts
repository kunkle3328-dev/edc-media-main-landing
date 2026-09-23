import { NextRequest, NextResponse } from 'next/server';
import { generateStrategy } from '@/lib/ai-strategist';
import { BusinessProfile } from '@/types/landing-engine';

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json() as { profile: BusinessProfile };

    if (!profile) {
      return NextResponse.json({ error: 'Business profile required' }, { status: 400 });
    }

    const strategy = await generateStrategy(profile);
    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error('AI Strategist Error:', error);
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
  }
}
