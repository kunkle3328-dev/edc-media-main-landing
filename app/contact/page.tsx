'use client';

import React, { useState } from 'react';
import { Mail, Phone, Terminal, Send, CheckCircle2 } from 'lucide-react';
import { EDCNavbar } from '@/components/EDCNavbar';
import { EDCFooter } from '@/components/EDCFooter';
import { EDC_BRAND } from '@/lib/brand-config';


export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] font-sans antialiased">
      <EDCNavbar
        onOpenBuilder={() => {
          if (typeof window !== 'undefined') window.location.href = '/builders/landing-pages';
        }}
        onSelectSavedPage={() => {}}
        savedPages={[]}
      />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
            {EDC_BRAND.corporateDomain} — DIRECT DISPATCH
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Architecture Consultation & Inquiries
          </h1>
          <p className="text-sm text-slate-400">
            Reach out directly to the EDC Media engineering and product strategy team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
            <h3 className="text-base font-bold text-white">Direct Communication Channels</h3>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-slate-400 font-mono">Email Support</p>
                  <p className="text-white font-medium">{EDC_BRAND.supportEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 font-mono">Platform Gateway</p>
                  <p className="text-white font-medium">{EDC_BRAND.platformDomain}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Send Message</h3>
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Message received. An EDC systems engineer will follow up promptly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Inquiry / Project Scoping</label>
                  <textarea
                    required
                    rows={3}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#00E5FF] text-[#07090E] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <EDCFooter />
    </div>
  );
}
