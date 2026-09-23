'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Database,
  Download,
  Calendar,
  Phone,
  Mail,
  User,
  Trash2,
  FileSpreadsheet,
  Search,
  Filter,
  ArrowRight,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Plus,
  Send,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { CapturedLead, LeadStatus } from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';

interface LeadsManagerModalProps {
  onClose: () => void;
  leads: CapturedLead[];
  onLeadsUpdated: () => void;
  currentPageId?: string;
}

const PIPELINE_STATUSES: { key: LeadStatus; label: string; color: string; bg: string; border: string }[] = [
  { key: 'NEW', label: 'NEW', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { key: 'CONTACTED', label: 'CONTACTED', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { key: 'QUALIFIED', label: 'QUALIFIED', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { key: 'BOOKED', label: 'BOOKED', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { key: 'WON', label: 'WON', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' },
  { key: 'LOST', label: 'LOST', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
];

export function LeadsManagerModal({
  onClose,
  leads,
  onLeadsUpdated,
  currentPageId,
}: LeadsManagerModalProps) {
  const [filterMode, setFilterMode] = useState<'current' | 'all'>(
    currentPageId ? 'current' : 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<CapturedLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // 1. Filter leads by page, status, and query
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Page filter
      if (filterMode === 'current' && currentPageId) {
        if (l.landingPageId !== currentPageId && l.pageId !== currentPageId) return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && (l.status || 'NEW') !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (l.name || l.data?.fullName || '').toLowerCase();
        const email = (l.email || l.data?.email || '').toLowerCase();
        const phone = (l.phone || l.data?.phone || '').toLowerCase();
        const notes = (l.message || l.data?.notes || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !notes.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [leads, filterMode, currentPageId, statusFilter, searchQuery]);

  // 2. Compute pipeline summary counts
  const pipelineCounts = useMemo(() => {
    const relevant = filterMode === 'current' && currentPageId
      ? leads.filter((l) => l.landingPageId === currentPageId || l.pageId === currentPageId)
      : leads;

    const counts: Record<string, number> = {
      TOTAL: relevant.length,
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      BOOKED: 0,
      WON: 0,
      LOST: 0,
    };

    relevant.forEach((l) => {
      const s = l.status || 'NEW';
      if (counts[s] !== undefined) counts[s]++;
      else counts.NEW++;
    });

    return counts;
  }, [leads, filterMode, currentPageId]);

  // 3. Status change handler
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    // Update locally
    const updated = pageStorage.updateLeadStatus(leadId, newStatus);
    if (updated && selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...updated });
    }

    // Dispatch to server API
    try {
      fetch('/api/landing-engine/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      }).catch(() => {});
    } catch {}

    onLeadsUpdated();
  };

  // 4. Note append handler
  const handleAddNote = (leadId: string) => {
    if (!newNoteText.trim()) return;
    const updated = pageStorage.addLeadNote(leadId, newNoteText.trim(), 'Strategist');
    if (updated && selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...updated });
    }

    try {
      fetch('/api/landing-engine/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action: 'ADD_NOTE', note: newNoteText.trim() }),
      }).catch(() => {});
    } catch {}

    setNewNoteText('');
    onLeadsUpdated();
  };

  // 5. CSV Export
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      'Lead ID',
      'Created At',
      'Full Name',
      'Email',
      'Phone',
      'Pipeline Status',
      'Landing Page',
      'Version',
      'CTA Source',
      'Traffic Source',
      'UTM Medium',
      'UTM Campaign',
      'Inquiry Notes',
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${(l.name || l.data?.fullName || '').replace(/"/g, '""')}"`,
      `"${(l.email || l.data?.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || l.data?.phone || '').replace(/"/g, '""')}"`,
      l.status || 'NEW',
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      l.landingPageVersionId || 'v1',
      l.ctaSource || 'lead_capture',
      l.source || 'direct',
      l.medium || '',
      l.campaign || '',
      `"${(l.message || l.data?.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edc_leads_pipeline_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-[#0A0D14] border border-white/[0.12] rounded-2xl shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#0F121A] text-slate-400 hover:text-white border border-white/[0.08]"
          aria-label="Close leads modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold">
                EDC LEAD CENTER™ • VERIFIED REAL INQUIRIES
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Conversion Pipeline &amp; Inquiries
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentPageId && (
              <div className="flex rounded-lg bg-[#0F121A] p-1 border border-white/[0.08] text-xs">
                <button
                  onClick={() => setFilterMode('current')}
                  className={`px-3 py-1 rounded ${
                    filterMode === 'current'
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  This Page
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded ${
                    filterMode === 'all'
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  All Pages ({leads.length})
                </button>
              </div>
            )}

            <button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stage Summary Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 py-4 border-b border-white/[0.06]">
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-2.5 rounded-xl cursor-pointer border text-center transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white/[0.08] border-[#00E5FF]'
                : 'bg-[#0F121A] border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-slate-400">TOTAL</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono">
              {pipelineCounts.TOTAL}
            </div>
          </div>

          {PIPELINE_STATUSES.map((st) => (
            <div
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`p-2.5 rounded-xl cursor-pointer border text-center transition-all ${
                statusFilter === st.key
                  ? `bg-white/[0.08] ${st.border}`
                  : 'bg-[#0F121A] border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div className={`text-[10px] font-mono uppercase ${st.color}`}>{st.label}</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {pipelineCounts[st.key] || 0}
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-3 pb-2 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, email, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-[11px] font-mono text-[#00E5FF] px-2 py-1 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center gap-1"
            >
              <span>Filter: {statusFilter}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Main Content Area: Leads Table / List or Split with Detail Drawer */}
        <div className="flex-1 overflow-hidden flex gap-4 pt-2">
          {/* Leads List */}
          <div className={`overflow-y-auto space-y-2.5 pr-1 ${selectedLead ? 'w-full sm:w-1/2' : 'w-full'}`}>
            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-xl bg-[#07090E] border border-white/[0.04]">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300 font-mono">NO LEADS YET</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  Once real visitors submit your landing page intake form, their inquiries, contact information, and attribution metadata will be logged here in real time.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1 rounded-full border border-[#00E5FF]/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero fabricated data • Real conversion tracking only</span>
                </div>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const currentSt = PIPELINE_STATUSES.find((s) => s.key === (lead.status || 'NEW')) || PIPELINE_STATUSES[0];
                const isSelected = selectedLead?.id === lead.id;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0F121A] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                        : 'bg-[#0F121A]/70 border-white/[0.07] hover:border-white/[0.18]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                        <span className="text-white font-bold truncate">
                          {lead.name || lead.data?.fullName || 'Anonymous Prospect'}
                        </span>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={lead.status || 'NEW'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border focus:outline-none ${currentSt.color} ${currentSt.bg} ${currentSt.border}`}
                      >
                        {PIPELINE_STATUSES.map((st) => (
                          <option key={st.key} value={st.key} className="bg-[#0A0D14] text-white">
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-2">
                      {(lead.email || lead.data?.email) && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <a
                            href={`mailto:${lead.email || lead.data?.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#00E5FF] hover:underline truncate"
                          >
                            {lead.email || lead.data?.email}
                          </a>
                        </div>
                      )}
                      {(lead.phone || lead.data?.phone) && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <a
                            href={`tel:${lead.phone || lead.data?.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-300 font-mono hover:text-white"
                          >
                            {lead.phone || lead.data?.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Metadata pills */}
                    <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-slate-400 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300">
                        {lead.businessName}
                      </span>
                      <span>•</span>
                      <span>SRC: {lead.source || 'direct'}</span>
                      <span>•</span>
                      <span>CTA: {lead.ctaSource || 'hero'}</span>
                      <span>•</span>
                      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>

                    {(lead.message || lead.data?.notes) && (
                      <p className="text-[11px] text-slate-400 bg-[#07090E] p-2 rounded border border-white/[0.04] mt-2 line-clamp-1 italic">
                        &ldquo;{lead.message || lead.data?.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Lead Detail Drawer */}
          {selectedLead && (
            <div className="hidden sm:flex flex-col w-1/2 rounded-xl bg-[#0F121A] border border-white/[0.1] p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider">
                    LEAD PROFILE &amp; ATTRIBUTION
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {selectedLead.name || selectedLead.data?.fullName}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Pipeline Stage
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PIPELINE_STATUSES.map((st) => {
                    const isCurrent = (selectedLead.status || 'NEW') === st.key;
                    return (
                      <button
                        key={st.key}
                        onClick={() => handleUpdateStatus(selectedLead.id, st.key)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                          isCurrent
                            ? `${st.bg} ${st.color} border ${st.border} shadow-sm`
                            : 'bg-[#07090E] text-slate-500 border border-white/[0.05] hover:text-slate-300'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Contact Information
                </span>
                <div className="text-xs space-y-1 text-slate-300 font-mono">
                  <div>
                    EMAIL:{' '}
                    <a
                      href={`mailto:${selectedLead.email || selectedLead.data?.email}`}
                      className="text-[#00E5FF] underline"
                    >
                      {selectedLead.email || selectedLead.data?.email || 'N/A'}
                    </a>
                  </div>
                  <div>
                    PHONE:{' '}
                    <a
                      href={`tel:${selectedLead.phone || selectedLead.data?.phone}`}
                      className="text-white underline"
                    >
                      {selectedLead.phone || selectedLead.data?.phone || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Inquiry Message */}
              <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Inquiry Message / Notes
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  {selectedLead.message || selectedLead.data?.notes || 'No custom note provided by prospect.'}
                </p>
              </div>

              {/* Attribution */}
              <div className="p-3 rounded-lg bg-[#07090E] border border-white/[0.06] space-y-1 text-[11px] font-mono text-slate-400">
                <span className="text-[10px] uppercase tracking-wider text-slate-300 block mb-1">
                  Marketing Attribution
                </span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>SOURCE: <span className="text-[#00E5FF]">{selectedLead.source || 'direct'}</span></div>
                  <div>MEDIUM: <span className="text-white">{selectedLead.medium || 'none'}</span></div>
                  <div>CAMPAIGN: <span className="text-white">{selectedLead.campaign || 'none'}</span></div>
                  <div>CTA TRIGGER: <span className="text-[#00E5FF]">{selectedLead.ctaSource || 'hero'}</span></div>
                  <div>VERSION: <span className="text-white">{selectedLead.landingPageVersionId || 'v1'}</span></div>
                  <div>RECORDED: <span className="text-white">{new Date(selectedLead.createdAt).toLocaleString()}</span></div>
                </div>
              </div>

              {/* Internal Notes Timeline */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  Internal Notes &amp; Activity
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add timestamped note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNote(selectedLead.id);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <button
                    onClick={() => handleAddNote(selectedLead.id)}
                    className="p-2 rounded-lg bg-[#00E5FF] text-[#07090E] font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(selectedLead.notesHistory || []).map((nh) => (
                    <div
                      key={nh.id}
                      className="p-2 rounded bg-[#07090E] border border-white/[0.04] text-[11px] text-slate-300"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                        <span>{nh.author || 'Strategist'}</span>
                        <span>{new Date(nh.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p>{nh.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            {filteredLeads.length} record{filteredLeads.length === 1 ? '' : 's'} displayed.
          </span>
          <button
            onClick={() => {
              if (confirm('Clear all stored leads? This cannot be undone.')) {
                pageStorage.clearAllLeads();
                onLeadsUpdated();
                setSelectedLead(null);
              }
            }}
            className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear local leads
          </button>
        </div>
      </div>
    </div>
  );
}
