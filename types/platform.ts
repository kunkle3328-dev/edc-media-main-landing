/**
 * EDC MEDIA PLATFORM FOUNDATION — UNIVERSAL DATA TYPES
 * Authoritative models for Workspaces, Projects, Versions, Domains, and Activities.
 */

import { LandingPage } from './landing-engine';

export type WorkspacePlan = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY' | 'ENTERPRISE';
export type WorkspaceStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'revoked';
  createdAt: string;
}

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
  settings?: {
    brandColor?: string;
    customDomain?: string;
    notificationEmail?: string;
    onboardingCompleted?: boolean;
    primaryBuildingGoal?: string;
  };
}

export type ProjectType =
  | 'WEBSITE'
  | 'LANDING_PAGE'
  | 'AI_APP'
  | 'AI_AGENT'
  | 'AUTOMATION'
  | 'BUSINESS_SYSTEM';

export type ProjectLifecycleStatus =
  | 'DRAFT'
  | 'BUILDING'
  | 'PREVIEW'
  | 'READY'
  | 'PUBLISHED'
  | 'LIVE'
  | 'FAILED'
  | 'ARCHIVED';

export type DeploymentStatus =
  | 'NOT_CONFIGURED'
  | 'PENDING'
  | 'DEPLOYED'
  | 'FAILED'
  | 'DISCONNECTED';

export interface UniversalProject {
  id: string;
  organizationId: string;
  workspaceId: string;
  name: string;
  slug: string;
  type: ProjectType;
  status: ProjectLifecycleStatus;
  deploymentStatus: DeploymentStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  lastPublishedAt?: string;
  publicUrl?: string;
  customDomain?: string;
  currentDraftId?: string;
  publishedVersionId?: string;
  currentVersionId?: string;
  metadata?: Record<string, any>;
  // Seamless adapter for existing LandingPage model
  landingPageData?: LandingPage;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  workspaceId: string;
  versionNumber: number;
  status: 'DRAFT' | 'PREVIEW' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  createdBy: string;
  changeReason?: string;
  changeSummary?: string;
  content: any;
  publishedAt?: string;
}

export type DomainType = 'EDC_SUBDOMAIN' | 'CUSTOM_DOMAIN';
export type DomainStatus =
  | 'NOT_CONNECTED'
  | 'PENDING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'FAILED'
  | 'DISCONNECTED'
  | 'NOT_CONFIGURED';

export interface DomainConnection {
  id: string;
  workspaceId: string;
  projectId: string;
  domain: string;
  type: DomainType;
  status: DomainStatus;
  verificationMethod: 'DNS_TXT' | 'DNS_CNAME' | 'HTTP_TOKEN';
  verificationToken: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  targetCname?: string;
  dnsRecords?: {
    type: 'A' | 'CNAME' | 'TXT';
    name: string;
    value: string;
  }[];
  isInfrastructureConfigured: boolean;
  message?: string;
}

export type ActivityType =
  | 'WORKSPACE_CREATED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_PREVIEWED'
  | 'PUBLISH_STARTED'
  | 'PUBLISH_SUCCEEDED'
  | 'PUBLISH_FAILED'
  | 'DOMAIN_ADDED'
  | 'DOMAIN_VERIFIED'
  | 'LEAD_CAPTURED'
  | 'BUILDER_OPENED';

export interface PlatformActivity {
  id: string;
  workspaceId: string;
  projectId?: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
  actor?: string;
}
