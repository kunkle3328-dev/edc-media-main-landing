'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Plus, Sparkles } from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { WorkspaceService, ProjectService } from '@/lib/services';


export default function AutomationsBuilderPage() {
  const router = useRouter();
  const [activeWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [autoName, setAutoName] = useState('');
  const [triggerType, setTriggerType] = useState('LEAD_SUBMISSION');
  const [actionDesc, setActionDesc] = useState('');

  const handleCreateAuto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoName.trim()) return;

    const proj = ProjectService.createProject({
      organizationId: 'org_edc_default',
      workspaceId: activeWorkspace.id,
      name: autoName.trim(),
      type: 'AUTOMATION',
      description: actionDesc || `Automation pipeline triggered on ${triggerType}.`,
      metadata: { trigger: triggerType },
    });

    router.push(`/projects/${proj.id}`);
  };

  return (
    <PlatformShell
      activeTab="automations"
      title="Revenue Automations"
      subtitle="Webhook triggers, prospect enrichment, and automated CRM pipeline routing"
    >
      <div className="space-y-8 max-w-4xl">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Revenue Automation</h3>
              <p className="text-xs text-slate-400">Instantly route captured prospects, dispatch SMS/Email alerts, and sync to external webhooks.</p>
            </div>
          </div>

          <form onSubmit={handleCreateAuto} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Pipeline Name</label>
              <input
                type="text"
                placeholder="e.g. Instant Lead Slack Alert & SMS Followup"
                value={autoName}
                onChange={(e) => setAutoName(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Trigger Event</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="LEAD_SUBMISSION">Landing Page Lead Submitted</option>
                <option value="PAYMENT_RECEIVED">Stripe Payment Received</option>
                <option value="CALENDAR_BOOKING">Diagnostic Calendar Booked</option>
                <option value="CALL_INITIATED">Emergency Call Button Clicked</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Pipeline Actions</label>
              <textarea
                placeholder="Specify downstream webhook URL, SMS notification recipient, or CRM integration steps..."
                value={actionDesc}
                onChange={(e) => setActionDesc(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Automation Pipeline</span>
            </button>
          </form>
        </div>
      </div>
    </PlatformShell>
  );
}
