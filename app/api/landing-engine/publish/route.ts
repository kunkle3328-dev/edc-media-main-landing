import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import * as firestore from 'firebase-admin/firestore';
import { validatePublicSlug } from '@/lib/slug';
import { EDC_DOMAINS } from '@/lib/domain-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, version, publicSlug, workspaceId, organizationId: clientOrgId } = body;

    // 1. Authenticate & Authorize
    const authContext = await requireAuth(req, clientOrgId);
    const orgId = authContext.organizationId;
    const projectId = page?.id;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Landing page data is required.' }, { status: 400 });
    }

    if (!publicSlug) {
      return NextResponse.json({ success: false, error: 'Public slug is required.' }, { status: 400 });
    }

    const validation = validatePublicSlug(publicSlug);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // 2. Resolve versioning
    const publishedAt = new Date().toISOString();
    const versionNumber = version?.versionNumber || Date.now();
    const versionId = `v_${projectId}_${versionNumber}`;
    
    // 3. Prepare Batch Operations (Atomic Commit)
    const batch = adminDb().batch();
    
    const projectRef = adminDb()
      .collection('organizations')
      .doc(orgId)
      .collection('projects')
      .doc(projectId);
      
    const versionRef = projectRef.collection('versions').doc(versionId);

    // Snapshot content
    const snapshot = JSON.parse(JSON.stringify(page));

    // a) Create Immutable Version
    batch.set(versionRef, {
      id: versionId,
      projectId,
      organizationId: orgId,
      versionNumber,
      status: 'PUBLISHED',
      createdAt: firestore.Timestamp.now(),
      createdBy: authContext.uid,
      content: snapshot,
      snapshot: snapshot,
      publishedAt: firestore.Timestamp.now(),
      publishMetadata: {
        publicSlug,
        actorEmail: authContext.email
      }
    });

    // b) Update Project State
    batch.update(projectRef, {
      status: 'LIVE',
      deploymentStatus: 'DEPLOYED',
      publishedVersionId: versionId,
      lastPublishedAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
      slug: publicSlug,
      publicUrl: `https://${publicSlug}.${EDC_DOMAINS.platform}`
    });

    // c) Ensure Domain Connection Record
    const domainName = `${publicSlug}.${EDC_DOMAINS.platform}`;
    const domainRef = adminDb().collection('domain_connections').doc(domainName);
    
    batch.set(domainRef, {
      id: domainName,
      organizationId: orgId,
      projectId,
      domain: domainName,
      type: 'EDC_SUBDOMAIN',
      status: 'ACTIVE',
      isInfrastructureConfigured: true,
      verifiedAt: firestore.Timestamp.now(),
      createdAt: firestore.Timestamp.now(),
      updatedAt: firestore.Timestamp.now(),
    }, { merge: true });

    // d) Audit Log
    const auditRef = adminDb().collection('audit_logs').doc();
    batch.set(auditRef, {
      id: auditRef.id,
      organizationId: orgId,
      projectId,
      actorId: authContext.uid,
      action: 'PROJECT_PUBLISHED',
      message: `Published project "${page.name}" to ${domainName}`,
      metadata: { versionId, publicSlug, domainName },
      createdAt: firestore.Timestamp.now()
    });

    // Commit all changes
    await batch.commit();

    return NextResponse.json({
      success: true,
      publicSlug,
      publishedAt,
      versionId,
      publicUrl: `https://${publicSlug}.${EDC_DOMAINS.platform}`,
      message: 'Project published successfully to EDC Production.'
    });

  } catch (error: any) {
    console.error('Publish API fatal error:', error);
    const status = error.message === 'AUTH_REQUIRED' ? 401 : 
                   error.message === 'FORBIDDEN' ? 403 : 500;
                   
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to publish landing page.' 
    }, { status });
  }
}
