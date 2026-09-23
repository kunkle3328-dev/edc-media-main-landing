'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Send,
  Lock,
  Clock,
  Award,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { LandingPage, LandingPageSection } from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';
import { analytics } from '@/lib/analytics';

interface LandingPageRendererProps {
  page: LandingPage;
  isStandalone?: boolean;
  onLeadCaptured?: () => void;
}

function LandingPageRendererComponent({
  page,
  isStandalone = false,
  onLeadCaptured,
}: LandingPageRendererProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [leadFormData, setLeadFormData] = useState<Record<string, string>>({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLead) return;
    
    setIsSubmittingLead(true);

    try {
      // Phase 11: Real Lead Submission (No fake latency)
      const leadData = {
        pageId: page.id,
        landingPageId: page.id,
        businessName: page.name,
        name: leadFormData.fullName,
        email: leadFormData.email,
        phone: leadFormData.phone,
        message: leadFormData.notes,
        data: leadFormData,
        ctaSource: 'lead_capture_form',
      };

      // 1. Local save for immediate resilience
      pageStorage.saveLead(leadData);

      // 2. Server-side persistence via API
      const response = await fetch('/api/landing-engine/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        console.warn('Lead server-sync failed, but lead is saved locally.');
      }

      analytics.trackConversion('form_completed', {
        landingPageId: page.id,
        sectionId: 'lead_capture',
        metadata: { businessName: page.name },
      });

      setLeadSubmitted(true);
      if (onLeadCaptured) onLeadCaptured();
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const scrollToLeadCapture = (sourceInput?: string | React.MouseEvent) => {
    const source = typeof sourceInput === 'string' ? sourceInput : 'hero';
    analytics.trackConversion(source === 'pricing' ? 'pricing_cta_clicked' : 'hero_cta_clicked', {
      landingPageId: page.id,
      ctaSource: source,
      sectionId: source,
    });
    const el = document.getElementById(`capture-${page.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const visibleSections = React.useMemo(() => 
    [...page.sections]
      .filter((s) => s.visibility !== false)
      .sort((a, b) => a.order - b.order),
    [page.sections]
  );

  return (
    <div
      className={`w-full bg-[#07090E] text-slate-100 font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] ${
        isStandalone ? 'min-h-screen' : ''
      }`}
    >
      {visibleSections.map((sec) => {
        switch (sec.type) {
          /* 1. Announcement Bar */
          case 'announcement':
            return (
              <div
                key={sec.id}
                className="bg-[#0A0D14] border-b border-white/[0.08] px-4 py-2 text-center text-xs font-mono"
              >
                <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 flex-wrap text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-[10px] font-bold tracking-wider uppercase">
                    {sec.content.badge || 'VERIFIED'}
                  </span>
                  <span>{sec.content.text}</span>
                </div>
              </div>
            );

          /* 2. Hero Section */
          case 'hero':
            return (
              <section
                key={sec.id}
                className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] overflow-hidden"
              >
                <div className="max-w-4xl mx-auto text-center relative z-10">
                  {sec.content.urgencyBadge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-[#00E5FF]/30 text-[11px] font-mono uppercase tracking-widest text-[#00E5FF] mb-6 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                      <span>{sec.content.urgencyBadge}</span>
                    </div>
                  )}

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                    {sec.content.headline}
                  </h1>

                  <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto mb-8">
                    {sec.content.subheadline}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                    <button
                      onClick={scrollToLeadCapture}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>{sec.content.primaryCTA || 'Get Started Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {sec.content.secondaryCTA && (
                      <button
                        onClick={scrollToLeadCapture}
                        className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0F121A] border border-white/[0.12] text-slate-200 font-semibold text-xs tracking-wider uppercase hover:border-white/[0.3] transition-all"
                      >
                        {sec.content.secondaryCTA}
                      </button>
                    )}
                  </div>

                  {sec.content.primarySubtext && (
                    <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5 mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sec.content.primarySubtext}</span>
                    </p>
                  )}
                </div>
              </section>
            );

          /* 3. Problem / Friction */
          case 'problem':
            return (
              <section
                key={sec.id}
                className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-red-400 font-semibold">
                      THE CURRENT FRICTION
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
                      {sec.content.title}
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                      {sec.content.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(sec.content.painPoints || []).map((point: string, i: number) => (
                      <div
                        key={i}
                        className="p-5 rounded-xl bg-[#0F121A] border border-red-500/15 relative overflow-hidden"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 text-xs font-mono font-bold">
                          0{i + 1}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 4. Solution Statement */
          case 'solution':
            return (
              <section
                key={sec.id}
                className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#07090E]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#00E5FF] font-semibold">
                      ENGINEERED SOLUTION
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1.5">
                      {sec.content.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl mx-auto">
                      {sec.content.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {(sec.content.keyPillars || []).map((pillar: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 rounded-xl bg-[#0F121A] border border-white/[0.08] hover:border-[#00E5FF]/40 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] mb-3">
                          <Zap className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1.5">
                          {pillar.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {pillar.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 5. Benefits */
          case 'benefits':
            return (
              <section
                key={sec.id}
                className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {sec.content.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(sec.content.items || []).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="p-5 rounded-xl bg-[#0F121A] border border-white/[0.08] flex flex-col justify-between"
                      >
                        <div>
                          <div className="inline-block px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold mb-3">
                            {item.metricOrBadge || 'VERIFIED'}
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1.5">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 6. How It Works */
          case 'how_it_works':
            return (
              <section
                key={sec.id}
                className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#07090E]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                      THE VISITOR JOURNEY
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {sec.content.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {(sec.content.steps || []).map((st: any, i: number) => (
                      <div
                        key={i}
                        className="p-6 rounded-xl bg-[#0F121A] border border-white/[0.08] relative"
                      >
                        <span className="text-2xl font-black font-mono text-[#00E5FF]/40 mb-2 block">
                          {st.step}
                        </span>
                        <h4 className="text-sm font-bold text-white mb-2">
                          {st.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {st.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 7. Social Proof & Trust */
          case 'social_proof':
            return (
              <section
                key={sec.id}
                className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {sec.content.title}
                    </h3>
                  </div>

                  {/* Trust badges */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                    {(sec.content.badgeList || []).map((badge: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F121A] border border-white/[0.1] text-xs font-mono text-slate-300"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Transparent proof placeholders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(sec.content.proofPoints || []).map((point: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#0F121A] border border-dashed border-white/[0.15] text-xs"
                      >
                        <p className="font-semibold text-slate-300 font-mono mb-1">
                          {point.label}
                        </p>
                        <p className="text-slate-500 italic">
                          &ldquo;{point.note}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 8. FAQ */
          case 'faq':
            return (
              <section
                key={sec.id}
                className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#07090E]"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-10">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                      FRICTION REDUCTION
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {sec.content.title || 'Frequently Asked Questions'}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {(sec.content.items || []).map((item: any, i: number) => {
                      const isOpen = openFaqIndex === i;
                      return (
                        <div
                          key={i}
                          className="rounded-xl bg-[#0F121A] border border-white/[0.08] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                            className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-white hover:text-[#00E5FF] transition-colors"
                          >
                            <span>{item.question}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-[#00E5FF] shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 border-t border-white/[0.04] pt-3 leading-relaxed">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          /* 9. Interactive Lead Capture */
          case 'lead_capture':
            return (
              <section
                key={sec.id}
                id={`capture-${page.id}`}
                className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-2xl mx-auto rounded-2xl bg-[#0F121A] border border-white/[0.12] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <div className="text-center mb-8">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#00E5FF] font-semibold">
                      DIRECT ACTION
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {sec.content.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2">
                      {sec.content.subtitle}
                    </p>
                  </div>

                  {!leadSubmitted ? (
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                          Full Name <span className="text-[#00E5FF]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jordan Miller"
                          value={leadFormData.fullName}
                          onChange={(e) =>
                            setLeadFormData({ ...leadFormData, fullName: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="(555) 000-0000"
                            value={leadFormData.phone}
                            onChange={(e) =>
                              setLeadFormData({ ...leadFormData, phone: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                            Email Address <span className="text-[#00E5FF]">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="jordan@example.com"
                            value={leadFormData.email}
                            onChange={(e) =>
                              setLeadFormData({ ...leadFormData, email: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                          Brief Request / Note
                        </label>
                        <textarea
                          rows={3}
                          placeholder="How can we assist you today?"
                          value={leadFormData.notes}
                          onChange={(e) =>
                            setLeadFormData({ ...leadFormData, notes: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingLead}
                        className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {isSubmittingLead
                            ? 'Processing Intake...'
                            : sec.content.submitButtonText || 'Submit Request'}
                        </span>
                      </button>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Strict Privacy Assurance • Zero Third-Party Sharing</span>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {sec.content.successHeadline || 'Intake Received'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                        {sec.content.successMessage ||
                          'Thank you! Your information has been securely received.'}
                      </p>
                      <button
                        onClick={() => {
                          setLeadSubmitted(false);
                          setLeadFormData({ fullName: '', phone: '', email: '', notes: '' });
                        }}
                        className="mt-4 px-4 py-2 rounded-lg bg-[#07090E] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );

          /* 10. Footer */
          case 'footer':
            return (
              <footer key={sec.id} className="py-8 px-4 text-center text-xs font-mono text-slate-400">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>
                    &copy; {new Date().getFullYear()} {sec.content.businessName || page.name}.
                  </span>
                  <span>{sec.content.disclaimer || 'All rights reserved.'}</span>
                </div>
              </footer>
            );

          default:
            return null;
        }
      })}

      {/* Floating Action Button for Mobile screens if primary goal is calls or fast leads */}
      <div className="sm:hidden sticky bottom-0 left-0 right-0 p-3 bg-[#07090E]/95 backdrop-blur-md border-t border-white/[0.1] z-30">
        <button
          onClick={scrollToLeadCapture}
          className="w-full py-3.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        >
          <span>{page.strategy?.primaryCTA?.label || 'Get Priority Quote'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export const LandingPageRenderer = React.memo(LandingPageRendererComponent);
