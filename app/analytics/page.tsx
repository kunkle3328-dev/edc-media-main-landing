'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Trash2,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { PlatformShell } from '@/components/platform/PlatformShell';
import { pageStorage } from '@/lib/storage';
import { CapturedLead } from '@/types/landing-engine';
import { useMounted, useStorageChangeVersion, notifyStorageChange } from '@/lib/useMounted';


export default function AnalyticsPage() {
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();
  const [leads, setLeads] = useState<CapturedLead[]>([]);

  useEffect(() => {
    if (isMounted) {
      setLeads(pageStorage.getAllLeads());
    }
  }, [isMounted, storageVersion]);

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Business', 'Notes', 'Created At'];
    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `edc_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('Delete this lead record?')) {
      pageStorage.deleteLead(leadId);
      setLeads(pageStorage.getAllLeads());
      notifyStorageChange();
    }
  };

  return (
    <PlatformShell
      activeTab="analytics"
      title="Analytics & Prospect Intake"
      subtitle="Real-time conversion telemetry and lead pipeline captures"
      actions={
        <button
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="px-3.5 py-1.5 bg-emerald-500 text-[#07090E] rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All Leads (CSV)</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Metric Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Leads Captured</p>
            <p className="text-3xl font-bold text-white mt-1">{leads.length}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">Local-first pipeline active</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Conversion Yield</p>
            <p className="text-3xl font-bold text-white mt-1">14.8%</p>
            <p className="text-[11px] text-cyan-400 mt-0.5">Above direct-response baseline</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Telemetry Engine</p>
            <p className="text-base font-bold text-white mt-1">EDC Engine v1.4</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero external tracking cookies</p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Captured Leads Pipeline</h3>
            <span className="text-xs font-mono text-slate-400">{leads.length} Records</span>
          </div>

          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{lead.name || 'Anonymous Prospect'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#00E5FF]">
                      {lead.businessName || 'Landing Page'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{lead.phone}</span>
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        <span>{lead.email}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(lead.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                  {lead.notes && <p className="text-xs text-slate-300 mt-1">&quot;{lead.notes}&quot;</p>}
                </div>

                <button
                  onClick={() => handleDeleteLead(lead.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors self-end sm:self-center"
                  title="Delete Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {leads.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">
                No leads captured yet. Publish your landing page or test the lead intake form on live pages.
              </p>
            )}
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
