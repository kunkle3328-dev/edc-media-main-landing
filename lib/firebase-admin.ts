import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';

let adminApp: App | null = null;

export function getAdminApp() {
  if (!adminApp) {
    try {
      const apps = getApps();
      if (apps.length > 0) {
        adminApp = apps[0]!;
      } else {
        adminApp = initializeApp({
          projectId: 'gen-lang-client-0885411859',
        });
      }
    } catch (e) {
      console.error('Firebase Admin Initialization Error:', e);
      throw new Error('Firebase Admin could not be initialized.');
    }
  }
  return adminApp;
}

export const adminDb = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());
