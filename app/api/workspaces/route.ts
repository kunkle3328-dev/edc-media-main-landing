import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { WorkspacePlan, Workspace, DomainConnection } from '@/types/platform';
import { sanitizeSlug } from '@/lib/slug';
import { EDC_DOMAINS } from '@/lib/domain-config';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const cleanName = (data.name || '').trim();
    
    if (!cleanName) {
      return NextResponse.json({ success: false, error: 'Workspace name is required' }, { status: 400 });
    }

    const baseSlug = sanitizeSlug(cleanName) || 'workspace';
    let slug = baseSlug;
    let counter = 1;
    
    while (!serverStorage.checkSlugAvailability(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace: Workspace = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      ownerId: data.ownerId || 'user_edc_founder',
      name: cleanName,
      slug,
      plan: (data.plan || 'STARTER') as WorkspacePlan,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        brandColor: '#00E5FF',
        onboardingCompleted: true,
        primaryBuildingGoal: data.primaryBuildingGoal,
      },
    };

    const domainName = `${slug}.${EDC_DOMAINS.platform}`;
    const domainConnection: DomainConnection = {
      id: 'dom_' + Math.random().toString(36).substring(2, 9),
      workspaceId: workspace.id,
      projectId: '',
      domain: domainName,
      type: 'EDC_SUBDOMAIN',
      status: 'ACTIVE',
      verificationMethod: 'HTTP_TOKEN',
      verificationToken: `edc-verify=${Math.random().toString(36).substring(2, 14)}`,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetCname: `cname.${EDC_DOMAINS.platform}`,
      dnsRecords: [],
      isInfrastructureConfigured: true,
      message: 'EDC Subdomain routed instantly.',
    };

    serverStorage.saveWorkspace(workspace);
    serverStorage.saveDomainConnection(domainConnection);

    return NextResponse.json({ success: true, workspace, domainConnection });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
