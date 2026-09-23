import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required.' }, { status: 400 });
    }

    const entry = serverStorage.getPublishedPageBySlug(slug);
    if (!entry) {
      return NextResponse.json(
        { error: 'Landing page not found or currently unpublished.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      page: entry.page,
      version: entry.publishedVersion,
      content: entry.publishedVersion.content || entry.page,
    });
  } catch (error: any) {
    console.error('Public page API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve public landing page.' },
      { status: 500 }
    );
  }
}
