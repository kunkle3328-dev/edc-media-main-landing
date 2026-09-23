'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Plus, Sparkles } from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { WorkspaceService, ProjectService } from '@/lib/services';


export default function AppsBuilderPage() {
  const router = useRouter();
  const [activeWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [appName, setAppName] = useState('');
  const [modelChoice, setModelChoice] = useState('gemini-2.5-flash');
  const [appGoal, setAppGoal] = useState('');

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    const proj = ProjectService.createProject({
      organizationId: 'org_edc_default',
      workspaceId: activeWorkspace.id,
      name: appName.trim(),
      type: 'AI_APP',
      description: appGoal || `Full-stack AI web application with server-side ${modelChoice} reasoning.`,
      metadata: { model: modelChoice },
    });

    router.push(`/projects/${proj.id}`);
  };

  return (
    <PlatformShell
      activeTab="apps"
      title="AI Web Applications"
      subtitle="Full-stack interactive software with server-side Gemini 2.5 API reasoning"
    >
      <div className="space-y-8 max-w-4xl">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Initialize AI Application</h3>
              <p className="text-xs text-slate-400">Server-side proxy routes, structured JSON schema outputs, and state management.</p>
            </div>
          </div>

          <form onSubmit={handleCreateApp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Application Name</label>
              <input
                type="text"
                placeholder="e.g. SignalFlow Intent Scanner"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Underlying Intelligence Model</label>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast, Real-time)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Multimodal Reasoning)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Functional Overview</label>
              <textarea
                placeholder="Describe what the application does, what data it ingests, and user actions..."
                value={appGoal}
                onChange={(e) => setAppGoal(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize AI Application</span>
            </button>
          </form>
        </div>
      </div>
    </PlatformShell>
  );
}
