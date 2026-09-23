'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Save, Sparkles, Check } from 'lucide-react';
import { LandingPage, LandingPageSection } from '@/types/landing-engine';

interface SectionEditorDrawerProps {
  page: LandingPage;
  onClose: () => void;
  onSavePage: (updatedPage: LandingPage) => void;
}

export function SectionEditorDrawer({
  page,
  onClose,
  onSavePage,
}: SectionEditorDrawerProps) {
  const [editableSections, setEditableSections] = useState<LandingPageSection[]>(
    JSON.parse(JSON.stringify(page.sections))
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggleVisibility = (sectionId: string) => {
    setEditableSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, visibility: !s.visibility } : s))
    );
  };

  const handleUpdateContent = (sectionId: string, field: string, value: any) => {
    setEditableSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            content: { ...s.content, [field]: value },
          };
        }
        return s;
      })
    );
  };

  const handleSave = () => {
    const updatedPage: LandingPage = {
      ...page,
      sections: editableSections,
      updatedAt: new Date().toISOString(),
    };
    onSavePage(updatedPage);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0A0D14] border-l border-white/[0.12] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0F121A]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF]">
            SECTION ARCHITECT
          </div>
          <h3 className="text-base font-bold text-white">Manual Page Editor</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-[#07090E] text-slate-400 hover:text-white border border-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <p className="text-xs text-slate-400">
          Modify individual section copy and toggle visibility without regenerating the entire landing page.
        </p>

        <div className="space-y-4">
          {editableSections.map((sec) => (
            <div
              key={sec.id}
              className={`p-4 rounded-xl border transition-all ${
                sec.visibility
                  ? 'bg-[#0F121A] border-white/[0.08]'
                  : 'bg-[#07090E] border-white/[0.04] opacity-60'
              }`}
            >
              {/* Section Header & Visibility toggle */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase">
                  {sec.type.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(sec.id)}
                  className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded ${
                    sec.visibility
                      ? 'text-slate-300 hover:text-white bg-white/[0.05]'
                      : 'text-slate-500 bg-white/[0.02]'
                  }`}
                >
                  {sec.visibility ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-500" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>

              {/* Editable Fields by Type */}
              {sec.type === 'hero' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Main Headline
                    </label>
                    <textarea
                      rows={2}
                      value={sec.content.headline || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'headline', e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-white focus:outline-none focus:border-[#00E5FF] text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Subheadline
                    </label>
                    <textarea
                      rows={2}
                      value={sec.content.subheadline || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'subheadline', e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-white focus:outline-none focus:border-[#00E5FF] text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Primary CTA Label
                    </label>
                    <input
                      type="text"
                      value={sec.content.primaryCTA || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'primaryCTA', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white focus:outline-none focus:border-[#00E5FF] text-xs"
                    />
                  </div>
                </div>
              )}

              {sec.type === 'announcement' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={sec.content.badge || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'badge', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Announcement Copy
                    </label>
                    <input
                      type="text"
                      value={sec.content.text || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'text', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {sec.type === 'solution' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Solution Title
                    </label>
                    <input
                      type="text"
                      value={sec.content.title || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'title', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Solution Description
                    </label>
                    <textarea
                      rows={2}
                      value={sec.content.description || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'description', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {sec.type === 'lead_capture' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Form Title
                    </label>
                    <input
                      type="text"
                      value={sec.content.title || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'title', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Submit Button Text
                    </label>
                    <input
                      type="text"
                      value={sec.content.submitButtonText || ''}
                      onChange={(e) =>
                        handleUpdateContent(sec.id, 'submitButtonText', e.target.value)
                      }
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {sec.type !== 'hero' &&
                sec.type !== 'announcement' &&
                sec.type !== 'solution' &&
                sec.type !== 'lead_capture' && (
                  <div className="text-xs">
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sec.content.title || ''}
                      onChange={(e) => handleUpdateContent(sec.id, 'title', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs"
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Drawer Footer with Save CTA */}
      <div className="p-4 border-t border-white/[0.08] bg-[#0F121A] flex items-center justify-between gap-3">
        {savedNotice ? (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Changes Applied
          </span>
        ) : (
          <span className="text-xs font-mono text-slate-400">
            {editableSections.filter((s) => s.visibility).length} active sections
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Apply Edits</span>
        </button>
      </div>
    </div>
  );
}
