'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Settings,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { WorkspaceService, DomainService, ProjectService } from '@/lib/services';
import { DomainConnection } from '@/types/platform';
import { EDC_BRAND } from '@/lib/brand-config';
import { useMounted, useStorageChangeVersion } from '@/lib/useMounted';


export default function SettingsPage() {
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();

  const [activeWorkspace, setActiveWorkspace] = useState(() => WorkspaceService.getActiveWorkspace());
  const [domains, setDomains] = useState<DomainConnection[]>(() => DomainService.getDomains());
  const [projects] = useState(() => ProjectService.getProjects());

  const [wsName, setWsName] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // New domain form
  const [newDomain, setNewDomain] = useState('');
  const [targetProj, setTargetProj] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isMounted) {
      const ws = WorkspaceService.getActiveWorkspace();
      setActiveWorkspace(ws);
      setWsName(ws.name);
      setDomains(DomainService.getDomains(ws.id));
      if (projects.length > 0 && !targetProj) {
        setTargetProj(projects[0].id);
      }
    }
  }, [isMounted, storageVersion]);

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;
    const updated = WorkspaceService.updateWorkspace(activeWorkspace.id, {
      name: wsName.trim(),
    });
    if (updated) {
      setActiveWorkspace(updated);
      setFeedback({ success: true, message: 'Workspace name updated.' });
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !targetProj) return;

    const res = await DomainService.addDomain({
      workspaceId: activeWorkspace.id,
      projectId: targetProj,
      domain: newDomain.trim(),
    });

    if (res.success) {
      setFeedback({ success: true, message: `Domain ${newDomain} registered. Configure DNS records below.` });
      setNewDomain('');
      setDomains(DomainService.getDomains(activeWorkspace.id));
    } else {
      setFeedback({ success: false, message: res.error || 'Failed to add domain.' });
    }
  };

  const handleVerify = (domId: string) => {
    const res = DomainService.verifyDomain(domId);
    setFeedback({
      success: res.success,
      message: res.message,
    });
    setDomains(DomainService.getDomains(activeWorkspace.id));
  };

  const handleRemoveDomain = (domId: string) => {
    if (confirm('Disconnect this domain?')) {
      DomainService.removeDomain(domId);
      setDomains(DomainService.getDomains(activeWorkspace.id));
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToken(text);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  return (
    <PlatformShell
      activeTab="settings"
      title="Domain Routing & Workspace Settings"
      subtitle="Authoritative DNS configuration, subdomain routing, and workspace boundaries"
    >
      <div className="space-y-8 max-w-5xl">
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-mono border ${
              feedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Workspace Identity Settings */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Workspace General Settings</h3>
          <form onSubmit={handleUpdateWorkspace} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Workspace Display Name</label>
              <input
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Authoritative Workspace ID</label>
              <input
                type="text"
                value={activeWorkspace.id}
                disabled
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold"
            >
              Update Workspace Settings
            </button>
          </form>
        </div>

        {/* Domain Routing Engine */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00E5FF]" />
                <span>Connected Domains & DNS Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage custom domains and verify DNS propagation for projects.
              </p>
            </div>
          </div>

          {/* Add domain form */}
          <form onSubmit={handleAddDomain} className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3">
            <span className="text-xs font-bold text-white">Register New Domain Connection</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="e.g. yourbusiness.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="sm:col-span-2 bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
              <select
                value={targetProj}
                onChange={(e) => setTargetProj(e.target.value)}
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
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold"
            >
              Add Domain Connection
            </button>
          </form>

          {/* Domains Table */}
          <div className="space-y-3">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-sm">{dom.domain}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                      {dom.type}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        dom.status === 'ACTIVE' || dom.status === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {dom.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(dom.id)}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                    >
                      Verify DNS Status
                    </button>
                    <button
                      onClick={() => handleRemoveDomain(dom.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                      title="Disconnect Domain"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {dom.dnsRecords && dom.dnsRecords.length > 0 && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <p className="text-[11px] font-mono text-slate-400">Required DNS Records:</p>
                    <div className="space-y-1">
                      {dom.dnsRecords.map((rec, idx) => (
                        <div key={idx} className="flex items-center justify-between font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded">
                          <span>
                            Type: <strong className="text-[#00E5FF]">{rec.type}</strong> | Host: <code>{rec.name}</code> | Target: <code>{rec.value}</code>
                          </span>
                          <button
                            onClick={() => copyToClipboard(rec.value)}
                            className="text-[#00E5FF] hover:underline flex items-center gap-1 text-[10px]"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedToken === rec.value ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
