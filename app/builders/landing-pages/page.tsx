'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  ArrowLeft,
  Eye,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Globe,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { LandingPageBuilder } from '@/components/LandingPageBuilder';
import { PagePreviewWorkspace } from '@/components/PagePreviewWorkspace';
import { LandingPage, BusinessProfile } from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';
import { ProjectService, WorkspaceService } from '@/lib/services';
import { PRESET_EXAMPLES } from '@/lib/edc-data';
import { useMounted, useStorageChangeVersion } from '@/lib/useMounted';


export default function LandingPagesBuilderPage() {
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();

  const [activeWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<BusinessProfile | null>(null);
  const [savedPages, setSavedPages] = useState<LandingPage[]>([]);

  useEffect(() => {
    if (isMounted) {
      const all = pageStorage.getAllPages();
      setSavedPages(all);
      if (all.length > 0 && !selectedPage) {
        setSelectedPage(all[0]);
      }
    }
  }, [isMounted, storageVersion]);

  const handlePageGenerated = async (newPage: LandingPage) => {
    pageStorage.savePage(newPage);
    setSelectedPage(newPage);
    setSavedPages(pageStorage.getAllPages());

    // Also synchronize into ProjectService
    await ProjectService.createProject({
      organizationId: 'org_edc_default',
      workspaceId: activeWorkspace.id,
      name: newPage.name || newPage.businessProfile?.name || 'Landing Page Project',
      type: 'LANDING_PAGE',
      description: newPage.strategy?.positioning || 'Direct response conversion engine.',
      initialData: newPage,
    });
  };

  const handleUpdatePage = (updated: LandingPage) => {
    pageStorage.savePage(updated);
    setSelectedPage(updated);
    setSavedPages(pageStorage.getAllPages());
  };

  const handleDuplicate = (page: LandingPage) => {
    const dup = pageStorage.duplicatePage(page.id);
    if (dup) {
      setSelectedPage(dup);
      setSavedPages(pageStorage.getAllPages());
    }
  };

  return (
    <PlatformShell
      activeTab="landing-pages"
      title="Landing Engine™ Builder"
      subtitle="Autonomous direct-response landing page generation and conversion optimization"
      actions={
        <div className="flex items-center gap-2">
          {selectedPage && (
            <button
              onClick={() => setSelectedPage(null)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Generation</span>
            </button>
          )}

          {savedPages.length > 0 && (
            <select
              value={selectedPage?.id || ''}
              onChange={(e) => {
                const found = savedPages.find((p) => p.id === e.target.value);
                if (found) setSelectedPage(found);
              }}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              {savedPages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          )}
        </div>
      }
    >
      <div className="space-y-8">
        {/* Preset Selector Banner */}
        {!selectedPage && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Quick-Start Conversion Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPreset(ex.profile)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedPreset?.name === ex.profile.name
                      ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]'
                      : 'bg-black/40 border-white/[0.06] hover:border-white/20 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{ex.label}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{ex.profile.offer}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Builder View OR Preview Workspace View */}
        {selectedPage ? (
          <div className="bg-[#05070B] rounded-2xl border border-white/10 overflow-hidden">
            <PagePreviewWorkspace
              page={selectedPage}
              onUpdatePage={handleUpdatePage}
              onCloseWorkspace={() => setSelectedPage(null)}
              onDuplicatePage={handleDuplicate}
            />
          </div>
        ) : (
          <div className="bg-[#05070B] rounded-2xl border border-white/10 p-4 sm:p-6">
            <LandingPageBuilder
              key={selectedPreset?.name || 'fresh'}
              onPageGenerated={handlePageGenerated}
              presetProfile={selectedPreset}
            />
          </div>
        )}
      </div>
    </PlatformShell>
  );
}
