'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LandingPage, LandingPageSection, SectionType, StrategyObject } from '@/types/landing-engine';
import { FirebaseDataService } from '@/lib/services/firebase-data-service';
import { Layout, Settings, Plus, Trash2, GripVertical, Brain, BarChart2 } from 'lucide-react';
import { ConversionDiagnosticDashboard } from './ConversionDiagnosticDashboard';
import { AIStrategistInterface } from './AIStrategistInterface';

interface LandingPageEditorProps {
  initialPage: LandingPage;
  projectId: string;
  organizationId: string;
}

const AVAILABLE_SECTIONS: SectionType[] = ['hero', 'problem', 'solution', 'benefits', 'pricing', 'faq', 'footer'];

export function LandingPageEditor({ initialPage, projectId, organizationId }: LandingPageEditorProps) {
  const [page, setPage] = useState<LandingPage>(initialPage);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialPage.sections[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const persistPage = async (pageToSave: LandingPage) => {
    setIsSaving(true);
    try {
      await FirebaseDataService.savePage(organizationId, projectId, pageToSave);
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const persistPageDebounced = (pageToSave: LandingPage) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistPage(pageToSave);
    }, 1000);
  };

  const updateSectionContent = (key: string, value: any) => {
    if (!selectedSectionId) return;
    const updatedPage = {
      ...page,
      sections: page.sections.map(s => s.id === selectedSectionId ? {
        ...s,
        content: { ...s.content, [key]: value }
      } : s)
    };
    setPage(updatedPage);
    persistPageDebounced(updatedPage);
  };

  const addSection = (type: SectionType) => {
    const newSection: LandingPageSection = {
      id: `sec_${Date.now()}`,
      type,
      order: page.sections.length,
      content: { title: `New ${type} Section` },
      visibility: true,
    };
    const updatedPage = { ...page, sections: [...page.sections, newSection] };
    setPage(updatedPage);
    persistPage(updatedPage);
  };

  const deleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPage = { ...page, sections: page.sections.filter(s => s.id !== id) };
    setPage(updatedPage);
    setSelectedSectionId(null);
    persistPage(updatedPage);
  };

  const applyAIStrategy = (strategy: StrategyObject) => {
    const updatedPage = { ...page, strategy };
    setPage(updatedPage);
    persistPage(updatedPage);
  };

  const applyAIFix = (payload: any) => {
    if (!selectedSectionId) return;
    updateSectionContent(payload.field, payload.value);
  };

  const selectedSection = page.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="flex h-screen bg-[#07090E] text-white">
      {/* Sidebar: Library + Tools */}
      <div className="w-72 border-r border-white/[0.1] p-4 overflow-y-auto space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">Components</h2>
        <div className="space-y-2">
          {AVAILABLE_SECTIONS.map(type => (
            <button 
              key={type}
              onClick={() => addSection(type)}
              className="w-full p-3 rounded-lg bg-[#0F121A] border border-white/[0.08] hover:border-[#00E5FF]/50 text-left flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
        <AIStrategistInterface onStrategyGenerated={applyAIStrategy} />
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {page.sections.map(section => (
            <div 
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`p-6 rounded-xl border-2 transition-all ${selectedSectionId === section.id ? 'border-[#00E5FF]' : 'border-white/[0.05] bg-[#0F121A]'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-slate-500 capitalize">{section.type}</span>
                <div className="flex gap-2">
                  <button onClick={(e) => deleteSection(section.id, e)} className="p-1 hover:bg-red-900/50 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <GripVertical className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold">{section.content.title || 'Untitled Section'}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Inspector */}
      <div className="w-96 border-l border-white/[0.1] p-4 overflow-y-auto">
        <ConversionDiagnosticDashboard page={page} onApplyFix={applyAIFix} />
        
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-8 mb-4">Properties</h2>
        {selectedSection ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold capitalize">{selectedSection.type.replace('_', ' ')}</h3>
            <div className="p-4 bg-[#0F121A] rounded-lg space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={selectedSection.content.title || ''}
                  onChange={(e) => updateSectionContent('title', e.target.value)}
                  className="w-full bg-[#07090E] border border-white/[0.1] rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a section to edit properties.</p>
        )}
      </div>
    </div>
  );
}
