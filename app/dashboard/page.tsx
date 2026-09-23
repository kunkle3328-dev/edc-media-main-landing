'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Globe,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Code2,
  Bot,
  Zap,
  Briefcase,
  Monitor,
  Copy,
  Trash2,
  Eye,
  TrendingUp,
  AlertCircle,
  Clock,
  Terminal,
  FileCheck,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import {
  WorkspaceService,
  ProjectService,
  DomainService,
  ActivityService,
  PublishService,
} from '@/lib/services';
import { UniversalProject, ProjectType, DomainConnection } from '@/types/platform';
import { pageStorage } from '@/lib/storage';
import { EDC_BRAND, resolveProjectUrl } from '@/lib/brand-config';
import { useMounted, useStorageChangeVersion } from '@/lib/useMounted';
import { useAuth } from '@/components/AuthProvider';


export default function DashboardPage() {
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();
  const { user, organization, loading: authLoading } = useAuth();

  const [activeWorkspace, setActiveWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [projects, setProjects] = useState<UniversalProject[]>([]);
  const [domains, setDomains] = useState<DomainConnection[]>([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ProjectType | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Custom domain connection form state
  const [newDomainInput, setNewDomainInput] = useState('');
  const [targetProjectId, setTargetProjectId] = useState('');
  const [domainFeedback, setDomainFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Load and refresh state
  useEffect(() => {
    async function loadData() {
      if (!isMounted || authLoading) return;

      setIsLoading(true);
      try {
        if (organization) {
          const projs = await ProjectService.getProjectsAsync(organization.id);
          setProjects(projs);
          if (projs.length > 0 && !targetProjectId) {
            setTargetProjectId(projs[0].id);
          }
          const doms = await DomainService.getDomainsAsync(organization.id);
          setDomains(doms);
        } else {
          const currentWs = WorkspaceService.getActiveWorkspace();
          setActiveWorkspace(currentWs);
          const projs = ProjectService.getProjects(currentWs.id);
          setProjects(projs);
          if (projs.length > 0 && !targetProjectId) {
            setTargetProjectId(projs[0].id);
          }
          const doms = DomainService.getDomains(currentWs.id);
          setDomains(doms);
        }
        setTotalLeadsCount(pageStorage.getAllLeads().length);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isMounted, storageVersion, organization, authLoading, targetProjectId, activeWorkspace.id]);

  const filteredProjects = React.useMemo(() => {
    return selectedTypeFilter === 'ALL'
      ? projects
      : projects.filter((p) => p.type === selectedTypeFilter);
  }, [projects, selectedTypeFilter]);

  const liveProjectsCount = React.useMemo(() => {
    return projects.filter((p) => p.status === 'LIVE' || p.status === 'PUBLISHED').length;
  }, [projects]);

  const draftProjectsCount = React.useMemo(() => {
    return projects.filter((p) => p.status === 'DRAFT' || p.status === 'BUILDING').length;
  }, [projects]);

  const handleDuplicateProject = async (projectId: string) => {
    if (organization) {
      alert('Duplication not yet implemented for production projects');
    } else {
      const dup = ProjectService.duplicateProject(projectId);
      if (dup) {
        setProjects(ProjectService.getProjects(activeWorkspace.id));
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      if (organization) {
        alert('Delete not yet implemented for production projects');
      } else {
        ProjectService.deleteProject(projectId);
        setProjects(ProjectService.getProjects(activeWorkspace.id));
      }
    }
  };

  const handlePublishProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const result = await PublishService.publishProject(projectId, undefined, organization?.id);
      if (result.success) {
        if (organization) {
          const projs = await ProjectService.getProjectsAsync(organization.id);
          setProjects(projs);
        } else {
          setProjects(ProjectService.getProjects(activeWorkspace.id));
        }
      } else {
        alert(result.error || 'Failed to publish project');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim() || !targetProjectId) return;

    const res = await DomainService.addDomain({
      workspaceId: activeWorkspace.id,
      projectId: targetProjectId,
      domain: newDomainInput.trim(),
    });

    if (res.success) {
      setDomainFeedback({
        success: true,
        message: `Custom domain ${res.domain?.domain} registered. DNS verification records generated.`,
      });
      setNewDomainInput('');
      if (organization) {
        const doms = await DomainService.getDomainsAsync(organization.id);
        setDomains(doms);
      } else {
        setDomains(DomainService.getDomains(activeWorkspace.id));
      }
    } else {
      setDomainFeedback({
        success: false,
        message: res.error || 'Failed to register domain.',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
      </div>
    );
  }

  return (
    <PlatformShell
      activeTab="dashboard"
      title="Workspace Overview"
      subtitle={`Authoritative control center for ${activeWorkspace?.name || 'EDC Workspace'}`}
    >
      <div className="space-y-8">
        {/* Workspace Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00E5FF] text-[#07090E] flex items-center justify-center font-bold text-xl font-mono shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              {activeWorkspace.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{activeWorkspace.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> ACTIVE WORKSPACE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
                  {activeWorkspace.plan}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Default Subdomain:</span>
                <code className="text-[#00E5FF] font-mono">{activeWorkspace.slug}.{EDC_BRAND.platformDomain}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/builders/landing-pages"
              className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Landing Engine</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Projects</p>
              <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{liveProjectsCount} Live • {draftProjectsCount} Draft</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#00E5FF]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Captured Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{totalLeadsCount}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Direct intake pipeline active</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Domain Connections</p>
              <p className="text-2xl font-bold text-white mt-1">{domains.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Global Edge Proxy routing</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">AI Reasoner</p>
              <p className="text-base font-bold text-white mt-1">Gemini 2.5</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">High-speed inference</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Workspace Projects</h3>
              <p className="text-xs text-slate-400">Digital assets managed under {activeWorkspace.name}</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', 'LANDING_PAGE', 'WEBSITE', 'AI_APP', 'AI_AGENT'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                    selectedTypeFilter === type
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[300px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-[#07090E]/50 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-white/5">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
                  <p className="text-xs font-mono text-slate-400 animate-pulse">Syncing Cloud Assets...</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => {
                const resolved = resolveProjectUrl(proj);
                const isLive = proj.status === 'LIVE' || proj.status === 'PUBLISHED';

                return (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.1]">
                          {proj.type.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            isLive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                          {proj.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Public Route:</span>
                        <span className="text-white truncate max-w-[160px]">
                          {resolved.url ? resolved.label : 'Draft Only'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {proj.type === 'LANDING_PAGE' ? (
                          <Link
                            href="/builders/landing-pages"
                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span>Builder</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/projects/${proj.id}`}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span>Details</span>
                          </Link>
                        )}

                        <Link
                          href={`/preview/${proj.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span>Preview</span>
                        </Link>
                      </div>

                      {isLive && resolved.url && (
                        <a
                          href={resolved.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-xs font-semibold text-[#00E5FF] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Visit Live URL</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      )}

                      {!isLive && (
                        <button
                          onClick={() => handlePublishProject(proj.id)}
                          className="w-full py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.15] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Publish to {proj.slug}.edcmedia.club</span>
                        </button>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleDuplicateProject(proj.id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Duplicate Project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProjects.length === 0 && !isLoading && (
              <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
                <Layers className="w-8 h-8 text-slate-500" />
                <p className="text-sm text-slate-400">No projects found matching the selected filter.</p>
                <Link
                  href="/builders/landing-pages"
                  className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold"
                >
                  Create Landing Page
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Domain Routing & DNS Section */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00E5FF]" />
              <span>Domain Management & Routing Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect custom business domains or route projects through your dedicated EDC Subdomain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subdomain routing card */}
            <div className="p-5 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Workspace Subdomain</span>
                  <p className="text-sm font-bold font-mono text-[#00E5FF] mt-1">{activeWorkspace.slug}.{EDC_BRAND.platformDomain}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  GLOBAL EDGE PROXY ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instantly provisioned, SSL secured, and globally proxied. Ready for zero-configuration deployments.
              </p>
            </div>

            {/* Custom domain connection form */}
            <div className="p-5 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Connect Custom Domain</span>
              <form onSubmit={handleConnectDomain} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. joeshvac.com"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Generate DNS Verification Records
                </button>
              </form>

              {domainFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono border ${
                    domainFeedback.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {domainFeedback.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
