'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Sparkles,
  Monitor,
  Code2,
  Bot,
  Zap,
  Briefcase,
  Eye,
  Globe,
  ArrowRight,
  Copy,
  Trash2,
  FileCheck,
  Search,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { ProjectService, WorkspaceService, PublishService } from '@/lib/services';
import { UniversalProject, ProjectType, ProjectLifecycleStatus } from '@/types/platform';
import { resolveProjectUrl } from '@/lib/brand-config';
import { useMounted, useStorageChangeVersion } from '@/lib/useMounted';


export default function ProjectsDirectoryPage() {
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();

  const [activeWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [projects, setProjects] = useState<UniversalProject[]>(() => ProjectService.getProjects());
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ProjectLifecycleStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (isMounted) {
      setProjects(ProjectService.getProjects(activeWorkspace.id));
    }
  }, [isMounted, storageVersion, activeWorkspace.id]);

  const filtered = React.useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === 'ALL' || p.type === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [projects, search, selectedType, selectedStatus]);

  const handleDuplicate = (id: string) => {
    const dup = ProjectService.duplicateProject(id);
    if (dup) setProjects(ProjectService.getProjects(activeWorkspace.id));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project? This cannot be undone.')) {
      ProjectService.deleteProject(id);
      setProjects(ProjectService.getProjects(activeWorkspace.id));
    }
  };

  const handlePublish = async (id: string) => {
    await PublishService.publishProject(id);
    setProjects(ProjectService.getProjects(activeWorkspace.id));
  };

  return (
    <PlatformShell
      activeTab="projects"
      title="All Projects"
      subtitle={`Directory of all ${projects.length} digital assets in ${activeWorkspace.name}`}
      actions={
        <Link
          href="/builders/landing-pages"
          className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by project name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="ALL">All Types</option>
              <option value="LANDING_PAGE">Landing Page</option>
              <option value="WEBSITE">Website</option>
              <option value="AI_APP">AI Web App</option>
              <option value="AI_AGENT">AI Agent</option>
              <option value="AUTOMATION">Automation</option>
              <option value="BUSINESS_SYSTEM">Business System</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="ALL">All Statuses</option>
              <option value="LIVE">Live</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="BUILDING">Building</option>
            </select>
          </div>
        </div>

        {/* Projects List / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((proj) => {
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
                      onClick={() => handlePublish(proj.id)}
                      className="w-full py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.15] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Publish to {proj.slug}.edcmedia.club</span>
                    </button>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleDuplicate(proj.id)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
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

          {filtered.length === 0 && (
            <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
              <Layers className="w-8 h-8 text-slate-500" />
              <p className="text-sm text-slate-400">No projects found matching your search and filter criteria.</p>
              <Link
                href="/builders/landing-pages"
                className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold"
              >
                Create Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </PlatformShell>
  );
}
