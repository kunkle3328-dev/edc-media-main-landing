import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/server-storage';
import { DomainConnection, DomainType } from '@/types/platform';
import { EDC_DOMAINS } from '@/lib/domain-config';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const cleanDomain = (data.domain || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    
    if (!cleanDomain) {
      return NextResponse.json({ success: false, error: 'Domain name is required.' }, { status: 400 });
    }

    const type: DomainType = data.type || (cleanDomain.endsWith(EDC_DOMAINS.platform) ? 'EDC_SUBDOMAIN' : 'CUSTOM_DOMAIN');
    
    const existing = serverStorage.getDomainConnection(cleanDomain);
    if (existing && existing.workspaceId !== data.workspaceId) {
      return NextResponse.json({ success: false, error: 'This domain is already registered to a workspace project.' }, { status: 409 });
    }

    const isSubdomain = type === 'EDC_SUBDOMAIN';
    const token = `edc-verify=${Math.random().toString(36).substring(2, 14)}`;

    const newConn: DomainConnection = {
      id: existing?.id || 'dom_' + Math.random().toString(36).substring(2, 9),
      workspaceId: data.workspaceId,
      projectId: data.projectId || existing?.projectId || '',
      domain: cleanDomain,
      type,
      status: isSubdomain ? 'ACTIVE' : 'PENDING',
      verificationMethod: isSubdomain ? 'HTTP_TOKEN' : 'DNS_TXT',
      verificationToken: token,
      verifiedAt: isSubdomain ? new Date().toISOString() : undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetCname: `cname.${EDC_DOMAINS.platform}`,
      dnsRecords: isSubdomain
        ? []
        : [
            {
              type: 'CNAME',
              name: cleanDomain.startsWith('www.') ? 'www' : '@',
              value: `cname.${EDC_DOMAINS.platform}`,
            },
            {
              type: 'TXT',
              name: `_edc-verify.${cleanDomain}`,
              value: token,
            },
          ],
      isInfrastructureConfigured: isSubdomain,
      message: isSubdomain
        ? 'EDC Subdomain routed instantly.'
        : 'Awaiting external DNS propagation. Point your DNS records to the targets above.',
    };

    serverStorage.saveDomainConnection(newConn);
    return NextResponse.json({ success: true, domain: newConn });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
