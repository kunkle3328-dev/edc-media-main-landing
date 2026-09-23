import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { CapturedLead, LeadStatus } from '@/types/landing-engine';

// Basic email format check
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// XSS sanitization
function sanitize(input?: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot anti-spam check: if bot fills hidden 'website_hp' field, silently reject
    if (body.website_hp || body._gotcha) {
      return NextResponse.json({ success: true, message: 'Intake received.' });
    }

    const {
      landingPageId,
      pageId,
      workspaceId = 'workspace_edc_default',
      businessName = 'EDC Media Asset',
      fullName,
      name,
      email,
      phone,
      notes,
      message,
      data = {},
      source,
      medium,
      campaign,
      content,
      term,
      landingPageVersionId,
      firstTouchTimestamp,
      ctaSource,
      consent,
    } = body;

    const targetPageId = landingPageId || pageId;
    if (!targetPageId) {
      return NextResponse.json(
        { success: false, error: 'Target landingPageId is required.' },
        { status: 400 }
      );
    }

    const leadEmail = (email || data.email || '').trim().toLowerCase();
    if (!leadEmail || !isValidEmail(leadEmail)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const leadName = sanitize(fullName || name || data.fullName || data.name || 'Anonymous Visitor');
    const leadPhone = sanitize(phone || data.phone || '');
    const leadMessage = sanitize(notes || message || data.notes || data.message || '');

    const leadRecord: CapturedLead = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      landingPageId: targetPageId,
      pageId: targetPageId,
      workspaceId,
      businessName: sanitize(businessName),
      createdAt: new Date().toISOString(),
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      message: leadMessage,
      data: {
        fullName: leadName,
        email: leadEmail,
        phone: leadPhone,
        notes: leadMessage,
        ...data,
      },
      source: source || 'direct',
      medium,
      campaign,
      content,
      term,
      landingPageVersionId,
      firstTouchTimestamp: firstTouchTimestamp || new Date().toISOString(),
      ctaSource: ctaSource || 'lead_capture',
      status: 'NEW',
      notesHistory: [],
      statusHistory: [
        {
          from: 'NEW',
          to: 'NEW',
          timestamp: new Date().toISOString(),
          note: 'Lead captured via public landing page intake form.',
        },
      ],
      consentMetadata: {
        consentedAt: new Date().toISOString(),
        userAgent: req.headers.get('user-agent') || undefined,
      },
    };

    const savedLead = serverStorage.saveLead(leadRecord);

    // Also record the form_completed conversion event
    serverStorage.recordEvent({
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      workspaceId,
      landingPageId: targetPageId,
      landingPageVersionId,
      sessionId: body.sessionId || 'sess_' + Math.random().toString(36).substring(2, 7),
      eventType: 'form_completed',
      timestamp: new Date().toISOString(),
      path: `/p/${body.publicSlug || ''}`,
      sectionId: 'lead_capture',
      ctaSource: ctaSource || 'lead_capture',
      deviceType: body.deviceType || 'unknown',
      utmSource: source,
      utmMedium: medium,
      utmCampaign: campaign,
      utmContent: content,
      utmTerm: term,
    });

    return NextResponse.json({
      success: true,
      leadId: savedLead.id,
      lead: savedLead,
      message: 'Intake successfully received and registered in EDC Lead Center.',
    });
  } catch (error: any) {
    console.error('Lead submission API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process lead intake.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const pageId = searchParams.get('pageId') || undefined;
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const status = searchParams.get('status') as LeadStatus | null;

    let leads = serverStorage.getLeads(pageId, workspaceId);
    if (status) {
      leads = leads.filter((l) => l.status === status);
    }

    return NextResponse.json({
      success: true,
      leads,
      totalCount: leads.length,
    });
  } catch (error: any) {
    console.error('Get leads API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leads.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, status, note, action } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required.' }, { status: 400 });
    }

    if (action === 'ADD_NOTE' && note) {
      const updated = serverStorage.addLeadNote(leadId, note, body.author || 'EDC Agent');
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Lead not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, lead: updated });
    }

    if (status) {
      const updated = serverStorage.updateLeadStatus(leadId, status, note);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Lead not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, lead: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid update payload.' }, { status: 400 });
  } catch (error: any) {
    console.error('Update lead API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update lead.' },
      { status: 500 }
    );
  }
}
