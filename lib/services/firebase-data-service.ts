import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UniversalProject, ProjectVersion, Organization } from '@/types/platform';
import { LandingPage } from '@/types/landing-engine';

export class FirebaseDataService {
  /**
   * PROJECTS
   */
  static async getProjects(organizationId: string, typeFilter?: string): Promise<UniversalProject[]> {
    const projectsRef = collection(db, 'organizations', organizationId, 'projects');
    
    let q = query(projectsRef, where('status', '!=', 'ARCHIVED'), orderBy('status'), orderBy('updatedAt', 'desc'));
    
    if (typeFilter) {
      q = query(projectsRef, where('status', '!=', 'ARCHIVED'), where('type', '==', typeFilter), orderBy('status'), orderBy('updatedAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as UniversalProject);
  }

  static async getProjectById(organizationId: string, projectId: string): Promise<UniversalProject | null> {
    const docRef = doc(db, 'organizations', organizationId, 'projects', projectId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as UniversalProject : null;
  }

  static async createProject(organizationId: string, project: Partial<UniversalProject>): Promise<UniversalProject> {
    const projectId = project.id || `proj_${Date.now()}`;
    const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);
    
    const newProject: UniversalProject = {
      ...project,
      id: projectId,
      organizationId,
      status: project.status || 'DRAFT',
      deploymentStatus: project.deploymentStatus || 'NOT_CONFIGURED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as UniversalProject;

    await setDoc(projectRef, {
      ...newProject,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return newProject;
  }

  static async updateProject(organizationId: string, projectId: string, updates: Partial<UniversalProject>): Promise<void> {
    const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteProject(organizationId: string, projectId: string): Promise<void> {
    const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);
    await updateDoc(projectRef, {
      status: 'ARCHIVED',
      updatedAt: serverTimestamp()
    });
  }

  /**
   * DRAFTS
   */
  static async saveDraft(organizationId: string, projectId: string, content: any): Promise<void> {
    const draftRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'drafts', 'current');
    await setDoc(draftRef, {
      id: 'current',
      projectId,
      organizationId,
      content,
      revision: serverTimestamp(), // Use server timestamp as a simple sequential marker or use increment
      updatedAt: serverTimestamp()
    });
  }

  static async getDraft(organizationId: string, projectId: string): Promise<any | null> {
    const draftRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'drafts', 'current');
    const snapshot = await getDoc(draftRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  /**
   * VERSIONS
   */
  static async createVersion(organizationId: string, projectId: string, version: Partial<ProjectVersion>): Promise<ProjectVersion> {
    const versionId = version.id || `v_${Date.now()}`;
    const versionRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'versions', versionId);
    
    const newVersion: ProjectVersion = {
      ...version,
      id: versionId,
      projectId,
      organizationId,
      createdAt: new Date().toISOString(),
      status: version.status || 'DRAFT'
    } as ProjectVersion;

    await setDoc(versionRef, {
      ...newVersion,
      createdAt: serverTimestamp()
    });

    return newVersion;
  }

  static async getVersions(organizationId: string, projectId: string): Promise<ProjectVersion[]> {
    const versionsRef = collection(db, 'organizations', organizationId, 'projects', projectId, 'versions');
    const q = query(versionsRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as ProjectVersion);
  }

  /**
   * PAGE PERSISTENCE
   */
  static async savePage(organizationId: string, projectId: string, page: LandingPage): Promise<void> {
    const pageRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'pages', 'current');
    await setDoc(pageRef, {
      ...page,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  static async getPage(organizationId: string, projectId: string): Promise<LandingPage | null> {
    const pageRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'pages', 'current');
    const snapshot = await getDoc(pageRef);
    return snapshot.exists() ? snapshot.data() as LandingPage : null;
  }
}
