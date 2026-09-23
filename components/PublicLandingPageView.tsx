'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
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
  Sparkles,
} from 'lucide-react';
import { LandingPage, LandingPageSection } from '@/types/landing-engine';
import { analytics } from '@/lib/analytics';
import { pageStorage } from '@/lib/storage';

interface PublicLandingPageViewProps {
  page: LandingPage;
  publicSlug: string;
  versionId?: string;
}

export function PublicLandingPageView({
  page,
  publicSlug,
  versionId,
}: PublicLandingPageViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [leadFormData, setLeadFormData] = useState<Record<string, string>>({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const formStartedTracked = useRef(false);

  // Track page_view on load
  useEffect(() => {
    analytics.trackConversion('page_view', {
      landingPageId: page.id,
      landingPageVersionId: versionId,
      metadata: { publicSlug, title: page.name },
    });
  }, [page.id, versionId, publicSlug, page.name]);

  const handleInputFocus = () => {
    if (!formStartedTracked.current) {
      formStartedTracked.current = true;
      analytics.trackConversion('form_started', {
        landingPageId: page.id,
        landingPageVersionId: versionId,
        sectionId: 'lead_capture',
      });
    }
  };

  const handleCtaClick = (ctaSource: string) => {
    let eventType: any = 'hero_cta_clicked';
    if (ctaSource === 'final_cta') eventType = 'final_cta_clicked';
    else if (ctaSource === 'pricing') eventType = 'pricing_cta_clicked';
    else if (ctaSource === 'sticky_mobile') eventType = 'sticky_mobile_cta_clicked';
    else if (ctaSource === 'secondary') eventType = 'secondary_cta_clicked';

    analytics.trackConversion(eventType, {
      landingPageId: page.id,
      landingPageVersionId: versionId,
      ctaSource,
    });

    const el = document.getElementById(`capture-${page.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePhoneClick = (phoneNumber: string) => {
    analytics.trackConversion('phone_clicked', {
      landingPageId: page.id,
      landingPageVersionId: versionId,
      metadata: { phone: phoneNumber },
    });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setIsSubmittingLead(true);

    try {
      const response = await fetch('/api/landing-engine/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingPageId: page.id,
          landingPageVersionId: versionId,
          businessName: page.name,
          fullName: leadFormData.fullName,
          email: leadFormData.email,
          phone: leadFormData.phone,
          notes: leadFormData.notes,
          data: leadFormData,
          ctaSource: 'lead_capture_form',
          publicSlug,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit inquiry.');
      }

      // Also save locally for synchronous local testing
      pageStorage.saveLead({
        landingPageId: page.id,
        businessName: page.name,
        name: leadFormData.fullName,
        email: leadFormData.email,
        phone: leadFormData.phone,
        message: leadFormData.notes,
        data: leadFormData,
        ctaSource: 'lead_capture_form',
        landingPageVersionId: versionId,
      });

      setLeadSubmitted(true);
    } catch (err: any) {
      console.error('Lead submit error:', err);
      setSubmissionError(err.message || 'There was an issue submitting your request. Please check your information and try again.');
      analytics.trackConversion('form_validation_error', {
        landingPageId: page.id,
        landingPageVersionId: versionId,
        metadata: { error: err.message },
      });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const visibleSections = [...page.sections]
    .filter((s) => s.visibility !== false)
    .sort((a, b) => a.order - b.order);

  const primaryPhone = page.ctaConfig?.phone || page.strategy?.primaryCTA?.phoneOrLink;

  return (
    <main className="min-h-screen w-full bg-[#07090E] text-slate-100 font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] overflow-x-hidden">
      {visibleSections.map((sec) => {
        switch (sec.type) {
          /* 1. Announcement Bar */
          case 'announcement':
            return (
              <div
                key={sec.id}
                className="bg-[#0A0D14] border-b border-white/[0.08] px-4 py-2.5 text-center text-xs font-mono"
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
                className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] overflow-hidden"
              >
                {/* Subtle technical background grid */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#00E5FF 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                  {sec.content.urgencyBadge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-[#00E5FF]/30 text-[11px] font-mono uppercase tracking-widest text-[#00E5FF] mb-6 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                      <span>{sec.content.urgencyBadge}</span>
                    </div>
                  )}

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
                    {sec.content.headline}
                  </h1>

                  <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                    {sec.content.subheadline}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                    <button
                      onClick={() => handleCtaClick('hero')}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all transform active:scale-95"
                    >
                      <span>{sec.content.primaryCTA || page.ctaConfig.primaryText || 'Get Priority Quote'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {primaryPhone && (
                      <a
                        href={`tel:${primaryPhone.replace(/[^0-9+]/g, '')}`}
                        onClick={() => handlePhoneClick(primaryPhone)}
                        className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#0F121A] border border-white/[0.1] text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:border-[#00E5FF]/50 transition-all"
                      >
                        <Phone className="w-4 h-4 text-[#00E5FF]" />
                        <span>{primaryPhone}</span>
                      </a>
                    )}
                  </div>

                  {sec.content.primarySubtext && (
                    <p className="mt-4 text-xs font-mono text-slate-400">
                      {sec.content.primarySubtext}
                    </p>
                  )}
                </div>
              </section>
            );

          /* 3. Problem Agitation */
          case 'problem':
            return (
              <section
                key={sec.id}
                className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 uppercase tracking-widest mb-3">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>The Operational Bottleneck</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {sec.content.headline || 'Common Pitfalls in the Industry'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(sec.content.painPoints || []).map((point: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-xl bg-[#07090E] border border-white/[0.08] hover:border-rose-500/30 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-mono font-bold mb-4">
                          0{idx + 1}
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">
                          {point.title || point}
                        </h3>
                        {point.description && (
                          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {point.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 4. Solution / Features */
          case 'solution':
            return (
              <section
                key={sec.id}
                className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]"
              >
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] uppercase tracking-widest mb-3">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Engineered Advantage</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      {sec.content.headline || 'The Strategic Alternative'}
                    </h2>
                    {sec.content.subheadline && (
                      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                        {sec.content.subheadline}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(sec.content.features || []).map((feat: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-xl bg-[#0F121A] border border-white/[0.08] hover:border-[#00E5FF]/40 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">
                          {feat.title || feat}
                        </h3>
                        {feat.description && (
                          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {feat.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 5. Proof / Testimonials / Social Proof */
          case 'social_proof':
            return (
              <section
                key={sec.id}
                className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-3">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Track Record</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {sec.content.headline || 'Real Feedback & Metrics'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(sec.content.testimonials || []).map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-xl bg-[#07090E] border border-white/[0.08] flex flex-col justify-between"
                      >
                        <p className="text-xs sm:text-sm text-slate-300 italic mb-6 leading-relaxed">
                          &ldquo;{t.quote || t.text}&rdquo;
                        </p>
                        <div className="border-t border-white/[0.06] pt-4">
                          <div className="text-xs font-bold text-white">{t.author || t.name}</div>
                          <div className="text-[11px] font-mono text-[#00E5FF]">
                            {t.role || t.title || 'Client Partner'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 6. Process / How It Works */
          case 'how_it_works':
          case 'process':
            return (
              <section
                key={sec.id}
                className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] uppercase tracking-widest mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Streamlined Execution</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {sec.content.headline || 'How Engagement Works'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(sec.content.steps || []).map((step: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-xl bg-[#0F121A] border border-white/[0.08] flex items-start gap-4"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                          0{idx + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white mb-1">
                            {step.title || step}
                          </h3>
                          {step.description && (
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 7. Pricing */
          case 'pricing':
            return (
              <section
                key={sec.id}
                className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0A0D14]"
              >
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] uppercase tracking-widest mb-3">
                      <Award className="w-3.5 h-3.5" />
                      <span>Transparent Investment</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      {sec.content.headline || 'Investment Architecture'}
                    </h2>
                    {sec.content.subheadline && (
                      <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                        {sec.content.subheadline}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(sec.content.plans || []).map((plan: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-6 rounded-xl border flex flex-col justify-between ${
                          plan.highlighted
                            ? 'bg-[#0F121A] border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.15)]'
                            : 'bg-[#07090E] border-white/[0.08]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-mono uppercase tracking-wider text-slate-300">
                              {plan.name}
                            </span>
                            {plan.badge && (
                              <span className="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-mono font-bold">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-3xl font-extrabold text-white mb-4">
                            {plan.price}
                          </div>
                          <p className="text-xs text-slate-400 mb-6">{plan.description}</p>
                          <ul className="space-y-2 mb-6">
                            {(plan.features || []).map((f: string, fIdx: number) => (
                              <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => handleCtaClick('pricing')}
                          className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            plan.highlighted
                              ? 'bg-[#00E5FF] text-[#07090E] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]'
                          }`}
                        >
                          {plan.cta || 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          /* 8. FAQ Section */
          case 'faq':
            return (
              <section
                key={sec.id}
                className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {sec.content.headline || 'Frequently Answered Questions'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Clear answers to common considerations
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(sec.content.items || []).map((item: any, idx: number) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-[#0F121A] border border-white/[0.08] overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                          >
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {item.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-[#00E5FF] shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4 text-xs sm:text-sm text-slate-300 border-t border-white/[0.04] pt-3 leading-relaxed">
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

          /* 9. Lead Capture / Form Section */
          case 'lead_capture':
            return (
              <section
                key={sec.id}
                id={`capture-${page.id}`}
                className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0D14] to-[#07090E] border-b border-white/[0.06]"
              >
                <div className="max-w-xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-[11px] font-mono uppercase tracking-wider mb-4">
                      <Lock className="w-3 h-3" />
                      <span>Priority Intake Active</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
                      {sec.content.headline || 'Request Confidential Consultation'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {sec.content.subheadline || 'Complete the brief intake below for immediate prioritization.'}
                    </p>
                  </div>

                  {!leadSubmitted ? (
                    <form
                      onSubmit={handleLeadSubmit}
                      className="p-6 sm:p-8 rounded-2xl bg-[#0F121A] border border-white/[0.1] shadow-2xl space-y-4"
                    >
                      {/* Honeypot field for bot protection */}
                      <input
                        type="text"
                        name="website_hp"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      {submissionError && (
                        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>{submissionError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                          Your Full Name <span className="text-[#00E5FF]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Jordan Miller"
                          value={leadFormData.fullName}
                          onFocus={handleInputFocus}
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
                            onFocus={handleInputFocus}
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
                            placeholder="jordan@company.com"
                            value={leadFormData.email}
                            onFocus={handleInputFocus}
                            onChange={(e) =>
                              setLeadFormData({ ...leadFormData, email: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                          Brief Request / Inquiry Note
                        </label>
                        <textarea
                          rows={3}
                          placeholder="How can we assist you today?"
                          value={leadFormData.notes}
                          onFocus={handleInputFocus}
                          onChange={(e) =>
                            setLeadFormData({ ...leadFormData, notes: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg bg-[#07090E] border border-white/[0.1] text-white text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00E5FF] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingLead}
                        className="w-full py-4 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all transform active:scale-95"
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
                    <div className="text-center py-10 px-6 rounded-2xl bg-[#0F121A] border border-emerald-500/30 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {sec.content.successHeadline || 'Intake Received'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                        {sec.content.successMessage ||
                          'Thank you! Your information has been securely received and assigned to our priority intake queue.'}
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
              <footer key={sec.id} className="py-10 px-4 text-center text-xs font-mono text-slate-400">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span>
                    &copy; {new Date().getFullYear()} {sec.content.businessName || page.name}. All rights reserved.
                  </span>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>{sec.content.disclaimer || 'Verified EDC Public Asset'}</span>
                    <span className="w-1 h-1 rounded-full bg-[#00E5FF]" />
                    <span className="text-[#00E5FF]">Landing Engine™</span>
                  </div>
                </div>
              </footer>
            );

          default:
            return null;
        }
      })}

      {/* Sticky Mobile Conversion Bar (Galaxy S25 and Mobile Viewports) */}
      <div className="sm:hidden sticky bottom-0 left-0 right-0 p-3 bg-[#07090E]/95 backdrop-blur-md border-t border-white/[0.1] z-40">
        <button
          onClick={() => handleCtaClick('sticky_mobile')}
          className="w-full py-3.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        >
          <span>{page.ctaConfig?.primaryText || 'Get Priority Quote'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </main>
  );
}
