'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  RotateCcw,
  Calendar,
  Sparkles,
  Check,
  Eye,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { PageVersion, LandingPage } from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';
import { LandingPageRenderer } from './LandingPageRenderer';

interface VersionHistoryModalProps {
  page: LandingPage;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion: (restoredPage: LandingPage) => void;
}

export function VersionHistoryModal({
  page,
  isOpen,
  onClose,
  onRestoreVersion,
}: VersionHistoryModalProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Retrieve versions for this page (or seed baseline snapshot if empty)
  const history = pageStorage.getVersions(page.id);
  const versions: PageVersion[] =
    history.length > 0
      ? history
      : [
          pageStorage.createVersionSnapshot(
            page,
            'Initial Creation Snapshot',
            'Baseline generated page state'
          ),
        ];

  const selectedVersion =
    versions.find((v) => v.id === selectedVersionId) || versions[0] || null;

  const handleRestore = (ver: PageVersion) => {
    const restored = pageStorage.restoreVersion(page.id, ver.id);
    if (restored) {
      setRestoredId(ver.id);
      setTimeout(() => {
        setRestoredId(null);
        onRestoreVersion(restored);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0F121A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-wide">
                  PAGE VERSION HISTORY
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400">
                  {versions.length} SNAPSHOT{versions.length === 1 ? '' : 'S'} SAVED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Safe, non-destructive audit log of every AI edit, manual change, and optimization.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[420px] max-h-[60vh] overflow-hidden">
          {/* Left Column: Version List */}
          <div className="md:col-span-5 border-r border-white/[0.08] bg-[#07090E] p-4 overflow-y-auto space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-2">
              Timeline of Revisions
            </div>

            {versions.map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;
              const dateStr = new Date(ver.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ver.id}
                  onClick={() => {
                    setSelectedVersionId(ver.id);
                    setPreviewMode(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0F121A] border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                      : 'bg-[#0F121A]/50 border-white/[0.06] hover:bg-[#0F121A] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        VERSION 0{ver.versionNumber}
                      </span>
                      {ver.versionNumber === versions.length && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#00E5FF] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>{ver.conversionScore}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-1.5">
                    {ver.changeReason}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span className="text-slate-400">
                      {ver.snapshot.sections.length} sections
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Version Details & Snapshot Preview */}
          <div className="md:col-span-7 bg-[#0A0D14] p-6 overflow-y-auto flex flex-col justify-between">
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <span className="text-xs font-mono text-[#00E5FF] uppercase block">
                      Snapshot Inspection
                    </span>
                    <h4 className="text-base font-bold text-white font-mono">
                      VERSION 0{selectedVersion.versionNumber} — {selectedVersion.changeReason}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                        previewMode
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40'
                          : 'bg-white/[0.06] text-slate-300 border-white/[0.1] hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewMode ? 'Hide Preview' : 'Preview State'}</span>
                    </button>
                  </div>
                </div>

                {previewMode ? (
                  <div className="max-h-[360px] overflow-y-auto rounded-xl border border-white/[0.1] bg-[#07090E] p-2">
                    <LandingPageRenderer page={selectedVersion.snapshot} />
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#0F121A] border border-white/[0.08]">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Revision Summary:
                      </span>
                      <p className="text-slate-200 text-sm font-sans">
                        {selectedVersion.changeSummary || 'Baseline generated page structure.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#0F121A] border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Recorded Score:
                        </span>
                        <span className="text-lg font-mono font-bold text-[#00E5FF]">
                          {selectedVersion.conversionScore}/100
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0F121A] border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Primary CTA:
                        </span>
                        <span className="text-sm font-bold text-white truncate block">
                          {selectedVersion.snapshot.ctaConfig?.primaryText || 'Get Started'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0F121A] border border-white/[0.08]">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">
                        Hero Headline at this version:
                      </span>
                      <p className="text-slate-300 font-sans italic">
                        &ldquo;{selectedVersion.snapshot.sections.find((s) => s.type === 'hero')?.content?.headline || selectedVersion.snapshot.name}&rdquo;
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-[11px]">
                        Restoring this version will set your active page state to this revision. Your current state will be preserved as a new version snapshot so nothing is ever lost.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Select a version from the timeline to inspect.
              </div>
            )}

            {/* Bottom Restore Trigger */}
            {selectedVersion && (
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Ready to rollback?
                </span>
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {restoredId === selectedVersion.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>RESTORED!</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>RESTORE VERSION 0{selectedVersion.versionNumber}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
