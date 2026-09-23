import { notFound } from 'next/navigation';
import { serverStorage } from '@/lib/server-storage';
import { PublicLandingPageView } from '@/components/PublicLandingPageView';

// Note: In Next.js 15, `params` is a promise
interface SitePageProps {
  params: Promise<{ domain: string }>;
}

export default async function SitePage({ params }: SitePageProps) {
  const { domain } = await params;
  
  // 1. Authoritative Domain Lookup
  const domainConn = serverStorage.getDomainConnection(domain);
  if (!domainConn || domainConn.status !== 'ACTIVE') {
    // Fallback: Check if it's a legacy slug route or corporate fallback
    const legacyCheck = serverStorage.getPublishedPageBySlug(domain.split('.')[0]);
    if (legacyCheck) {
      return <PublicLandingPageView page={legacyCheck.page} publicSlug={domain.split('.')[0]} versionId={legacyCheck.publishedVersion.id} />;
    }
    return notFound();
  }

  // 2. Retrieve Published Project
  const projectId = domainConn.projectId;
  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white p-6">
        <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold mb-2">EDC Domain Ready</h2>
          <p className="text-sm text-slate-400 mb-6">
            This domain is active but no project has been published to it yet.
          </p>
        </div>
      </div>
    );
  }

  const project = serverStorage.getProject(projectId);
  if (!project || project.status !== 'LIVE' || !project.currentVersionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white p-6">
        <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold mb-2">Site Not Published</h2>
          <p className="text-sm text-slate-400 mb-6">
            The requested project is currently offline or unpublished.
          </p>
        </div>
      </div>
    );
  }

  const version = serverStorage.getProjectVersion(project.currentVersionId);
  if (!version) {
    return notFound();
  }

  // 3. Render universal project based on type
  if (project.type === 'LANDING_PAGE') {
    const pageData = version.content || project.landingPageData;
    return <PublicLandingPageView page={pageData} publicSlug={domain} versionId={version.id} />;
  }

  // Fallback for other project types currently
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white p-6">
      <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-xl font-bold mb-2">{project.name}</h2>
        <p className="text-sm text-slate-400 mb-6">
          {project.type} rendering engine is actively being developed.
        </p>
      </div>
    </div>
  );
}
