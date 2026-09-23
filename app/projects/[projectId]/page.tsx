'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  Sparkles,
  Globe,
  ArrowLeft,
  ArrowRight,
  Eye,
  FileCheck,
  ShieldCheck,
  History,
  Copy,
  Trash2,
  Settings,
  ExternalLink,
  Code2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import {
  ProjectService,
  VersionService,
  PublishService,
  DomainService,
  ActivityService,
} from '@/lib/services';
import { UniversalProject, ProjectVersion, DomainConnection } from '@/types/platform';
import { resolveProjectUrl, EDC_BRAND } from '@/lib/brand-config';
import { useMounted, useStorageChangeVersion } from '@/lib/useMounted';


import { useAuth } from '@/components/AuthProvider';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();
  const { organization } = useAuth();

  const projectId = params?.projectId as string;
  const [project, setProject] = useState<UniversalProject | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [domains, setDomains] = useState<DomainConnection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [slugInput, setSlugInput] = useState('');

  useEffect(() => {
    async function load() {
      if (isMounted && projectId) {
        const orgId = organization?.id || 'org_edc_default';
        const p = await ProjectService.getProjectById(orgId, projectId);
        setProject(p);
        if (p) {
          setNameInput(p.name);
          setDescInput(p.description);
          setSlugInput(p.slug);
          setVersions(VersionService.getVersions(p.id));
          setDomains(DomainService.getDomains(p.workspaceId).filter((d) => d.projectId === p.id));
        }
      }
    }
    load();
  }, [isMounted, projectId, storageVersion, organization?.id]);

  if (!project) {
    return (
      <PlatformShell title="Project Details">
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
          <Layers className="w-8 h-8 text-slate-500" />
          <p className="text-sm text-slate-400">Project not found or may have been moved.</p>
          <Link
            href="/projects"
            className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold"
          >
            ← Return to Projects
          </Link>
        </div>
      </PlatformShell>
    );
  }

  const resolved = resolveProjectUrl(project);
  const isLive = project.status === 'LIVE' || project.status === 'PUBLISHED';

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = organization?.id || 'org_edc_default';
    await ProjectService.updateProject(orgId, project.id, {
      name: nameInput.trim(),
      description: descInput.trim(),
      slug: slugInput.trim(),
    });
    
    const updated = await ProjectService.getProjectById(orgId, project.id);
    if (updated) {
      setProject(updated);
      setIsEditing(false);
    }
  };

  const handlePublish = async () => {
    const orgId = organization?.id || 'org_edc_default';
    const res = await PublishService.publishProject(project.id, slugInput.trim() || undefined, orgId);
    if (res.success) {
      const updated = await ProjectService.getProjectById(orgId, project.id);
      setProject(updated);
    }
  };

  return (
    <PlatformShell
      activeTab="projects"
      title={project.name}
      subtitle={`Type: ${project.type.replace('_', ' ')} • Status: ${project.status}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>

          {project.type === 'LANDING_PAGE' && (
            <Link
              href="/builders/landing-pages"
              className="px-3.5 py-1.5 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open in Builder</span>
            </Link>
          )}

          <Link
            href={`/preview/${project.id}`}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Live Preview</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8 max-w-5xl">
        {/* Project Meta Card */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-[#00E5FF] border border-[#00E5FF]/20 font-bold">
                {project.type.replace('_', ' ')}
              </span>
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold ${
                  isLive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {project.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {project.id}</span>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Metadata'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Project Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Public Subdomain Slug</label>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Description</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={3}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Public Edge Endpoint</span>
                  <p className="text-xs font-mono text-[#00E5FF] truncate">
                    {resolved.url || `https://${project.slug}.edcmedia.club`}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Deployment Infrastructure</span>
                  <p className="text-xs font-mono text-slate-300">
                    {project.deploymentStatus === 'DEPLOYED' ? 'EDC Global Edge Proxy (Active)' : 'Draft (Local / Sandbox)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Publishing Trigger */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              {project.lastPublishedAt ? `Published ${new Date(project.lastPublishedAt).toLocaleDateString()}` : 'Not yet published'}
            </span>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isLive ? 'Re-Publish to Edge' : 'Publish to Live Route'}</span>
            </button>
          </div>
        </div>

        {/* Version History Table */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#00E5FF]" />
              <span>Authoritative Version History</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{versions.length} Snapshots</span>
          </div>

          <div className="space-y-2">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">v{ver.versionNumber}</span>
                    <span className="text-slate-400">{ver.changeSummary || ver.changeReason}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400">
                      {ver.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {new Date(ver.createdAt).toLocaleString()} • Created by {ver.createdBy}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">{ver.id}</span>
              </div>
            ))}

            {versions.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No snapshots recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
