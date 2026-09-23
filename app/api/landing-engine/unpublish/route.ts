import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import * as firestore from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { pageId, organizationId: clientOrgId } = await req.json();

    if (!pageId) {
      return NextResponse.json({ success: false, error: 'pageId is required.' }, { status: 400 });
    }

    // 1. Authenticate & Authorize
    const authContext = await requireAuth(req, clientOrgId);
    const orgId = authContext.organizationId;

    // 2. Perform Atomic Unpublish
    const projectRef = adminDb()
      .collection('organizations')
      .doc(orgId)
      .collection('projects')
      .doc(pageId);

    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    const batch = adminDb().batch();
    
    // a) Revert Project Status
    batch.update(projectRef, {
      status: 'DRAFT',
      deploymentStatus: 'NOT_CONFIGURED',
      publishedVersionId: null,
      lastPublishedAt: null,
      updatedAt: firestore.Timestamp.now(),
      publicUrl: null
    });

    // b) Audit Log
    const auditRef = adminDb().collection('audit_logs').doc();
    batch.set(auditRef, {
      id: auditRef.id,
      organizationId: orgId,
      projectId: pageId,
      actorId: authContext.uid,
      action: 'PROJECT_UNPUBLISHED',
      message: `Unpublished project "${projectDoc.data()?.name || pageId}"`,
      createdAt: firestore.Timestamp.now()
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      unpublishedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Unpublish API error:', error);
    const status = error.message === 'AUTH_REQUIRED' ? 401 : 
                   error.message === 'FORBIDDEN' ? 403 : 500;
                   
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to unpublish project.' 
    }, { status });
  }
}
