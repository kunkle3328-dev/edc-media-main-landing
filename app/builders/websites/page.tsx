'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  Sparkles,
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { WorkspaceService, ProjectService } from '@/lib/services';


export default function WebsitesBuilderPage() {
  const router = useRouter();
  const [activeWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [siteName, setSiteName] = useState('');
  const [siteNiche, setSiteNiche] = useState('B2B Enterprise');
  const [siteObjective, setSiteObjective] = useState('');

  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;

    const createdProj = await ProjectService.createProject({
      organizationId: 'org_edc_default',
      workspaceId: activeWorkspace.id,
      name: siteName.trim(),
      type: 'WEBSITE',
      description: siteObjective || `${siteNiche} full multi-page website.`,
      metadata: { niche: siteNiche },
    });

    router.push(`/projects/${createdProj.id}`);
  };

  return (
    <PlatformShell
      activeTab="websites"
      title="Website Builder Architecture"
      subtitle="Full-stack multi-page website portals with conversion staging and SEO architecture"
    >
      <div className="space-y-8 max-w-4xl">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Initialize New Website Asset</h3>
              <p className="text-xs text-slate-400">Next.js 15, TypeScript, Tailwind CSS, and SEO structured meta.</p>
            </div>
          </div>

          <form onSubmit={handleCreateWebsite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Website Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Global Operations"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Industry / Category</label>
              <select
                value={siteNiche}
                onChange={(e) => setSiteNiche(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="B2B Enterprise">B2B Enterprise SaaS</option>
                <option value="Local Service">Emergency Local Contractor</option>
                <option value="Executive Advisory">High-Ticket Consultancy</option>
                <option value="Healthcare">Modern Medical / Dental</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Primary Conversion Objective</label>
              <textarea
                placeholder="Target outcomes (e.g. Schedule diagnostic consultation, request emergency dispatch, acquire enterprise pipeline)..."
                value={siteObjective}
                onChange={(e) => setSiteObjective(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Website in Workspace</span>
            </button>
          </form>
        </div>
      </div>
    </PlatformShell>
  );
}
