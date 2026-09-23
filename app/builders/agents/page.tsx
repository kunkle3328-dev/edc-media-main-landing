'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Plus, Sparkles } from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { WorkspaceService, ProjectService } from '@/lib/services';


export default function AgentsBuilderPage() {
  const router = useRouter();
  const [activeWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('Inbound Lead Qualifier');
  const [agentInstructions, setAgentInstructions] = useState('');

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    const proj = ProjectService.createProject({
      organizationId: 'org_edc_default',
      workspaceId: activeWorkspace.id,
      name: agentName.trim(),
      type: 'AI_AGENT',
      description: agentInstructions || `${agentRole} operating 24/7.`,
      metadata: { role: agentRole },
    });

    router.push(`/projects/${proj.id}`);
  };

  return (
    <PlatformShell
      activeTab="agents"
      title="Autonomous AI Agents"
      subtitle="24/7 intelligent operators for inbound qualification, research, and dispatch"
    >
      <div className="space-y-8 max-w-4xl">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Deploy Autonomous Agent</h3>
              <p className="text-xs text-slate-400">Conversational triage, multi-source synthesis, and human-in-the-loop gates.</p>
            </div>
          </div>

          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Agent Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Inbound Dispatch Bot"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Agent Specialization</label>
              <select
                value={agentRole}
                onChange={(e) => setAgentRole(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="Inbound Lead Qualifier">Inbound Lead Qualifier</option>
                <option value="24/7 Emergency Dispatcher">24/7 Emergency Dispatcher</option>
                <option value="Executive Appointment Setter">Executive Appointment Setter</option>
                <option value="B2B Account Researcher">B2B Account Researcher</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Operational Instructions / Directives</label>
              <textarea
                placeholder="Define vetting criteria, mandatory questions, and routing protocols..."
                value={agentInstructions}
                onChange={(e) => setAgentInstructions(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Autonomous Agent</span>
            </button>
          </form>
        </div>
      </div>
    </PlatformShell>
  );
}
