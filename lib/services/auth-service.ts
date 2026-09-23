import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  getAdditionalUserInfo
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface EDCUser extends User {
  organizationId?: string;
  role?: string;
}

export class AuthService {
  static async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
      
      if (isNewUser || result.user) {
        await this.bootstrapOrganization(result.user);
      }
      
      return result.user;
    } catch (error) {
      console.error('Sign in failed', error);
      throw error;
    }
  }

  static async signOut() {
    return signOut(auth);
  }

  /**
   * Ensures the user has an organization membership.
   * If not, creates a personal organization.
   */
  private static async bootstrapOrganization(user: User) {
    // 1. Check for existing membership
    const membershipRef = doc(db, 'users', user.uid, 'private', 'membership'); // Simplified check or query subcollections
    // Actually, according to our blueprint, memberships are under /organizations/{orgId}/members/{userId}
    // But we need a way to find which organization a user belongs to efficiently.
    // We'll use a top-level memberships collection or a query.
    
    // Let's query across all members collections if possible, or maintain a user-profile doc.
    // For simplicity in v1.0 foundation, we'll store the primary organizationId on the user's private profile.
    const userProfileRef = doc(db, 'users', user.uid);
    const userProfile = await getDoc(userProfileRef);
    
    if (userProfile.exists() && userProfile.data().primaryOrganizationId) {
      return userProfile.data().primaryOrganizationId;
    }

    // 2. No organization found, create one
    const orgId = `org_${Math.random().toString(36).substring(2, 9)}`;
    const orgData = {
      id: orgId,
      name: `${user.displayName || 'Personal'} Workspace`,
      slug: (user.displayName || 'personal').toLowerCase().replace(/\s+/g, '-'),
      ownerId: user.uid,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const memberData = {
      id: user.uid,
      organizationId: orgId,
      userId: user.uid,
      role: 'owner',
      status: 'active',
      createdAt: serverTimestamp()
    };

    // Atomic-ish setup
    await setDoc(doc(db, 'organizations', orgId), orgData);
    await setDoc(doc(db, 'organizations', orgId, 'members', user.uid), memberData);
    await setDoc(userProfileRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      primaryOrganizationId: orgId,
      createdAt: serverTimestamp()
    });

    return orgId;
  }

  static async getUserOrganization(user: User) {
    const userProfileRef = doc(db, 'users', user.uid);
    const userProfile = await getDoc(userProfileRef);
    if (userProfile.exists()) {
      const orgId = userProfile.data().primaryOrganizationId;
      if (orgId) {
        const orgDoc = await getDoc(doc(db, 'organizations', orgId));
        return orgDoc.exists() ? orgDoc.data() : null;
      }
    }
    return null;
  }
}
