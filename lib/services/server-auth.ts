import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '../firebase-admin';

export interface AuthContext {
  uid: string;
  email: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
}

export async function requireAuth(req: NextRequest, organizationId?: string): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('AUTH_REQUIRED');
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';

    // If organizationId is provided, verify membership
    let role: 'owner' | 'admin' | 'member' = 'member';
    let targetOrgId = organizationId;

    if (!targetOrgId) {
      // Find primary organization for user
      const userDoc = await adminDb().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new Error('ORGANIZATION_NOT_FOUND');
      }
      targetOrgId = userDoc.data()?.primaryOrganizationId;
    }

    if (!targetOrgId) {
      throw new Error('ORGANIZATION_NOT_FOUND');
    }

    // Verify membership and role
    const memberDoc = await adminDb()
      .collection('organizations')
      .doc(targetOrgId)
      .collection('members')
      .doc(uid)
      .get();

    if (!memberDoc.exists) {
      throw new Error('FORBIDDEN');
    }

    role = memberDoc.data()?.role || 'member';

    return {
      uid,
      email,
      organizationId: targetOrgId,
      role,
    };
  } catch (error: any) {
    console.error('Auth verification failed:', error);
    if (error.message === 'FORBIDDEN' || error.message === 'ORGANIZATION_NOT_FOUND') {
      throw error;
    }
    throw new Error('AUTH_INVALID');
  }
}
