'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'What does EDC Media Landing Engine build?',
    answer:
      'EDC Media builds conversion-focused landing pages engineered around a single explicit objective: lead capture, phone inquiries, appointment booking, or direct purchases. Rather than assembling generic visual blocks, EDC models your offer, customer buying context, objections, and trust requirements to produce a complete, published conversion system.',
    category: 'Product',
  },
  {
    question: 'Is this an "AI website builder"?',
    answer:
      'No. Generic website builders start with visual templates and expect you to write copy and arrange decorative elements. EDC Landing Engine starts with conversion strategy: offer analysis, intent modeling, section hierarchy, copy generation, friction reduction, scoring, and lead capture. The page is the output; conversion intelligence is the product.',
    category: 'Product',
  },
  {
    question: 'Do I need a designer or developer?',
    answer:
      'No. Every generated page includes responsive high-contrast layouts, typography hierarchy, mobile-first design, interactive lead capture forms, SEO metadata, and real-time conversion analytics out of the box. No coding, CSS tweaking, or server administration required.',
    category: 'Product',
  },
  {
    question: 'Can I edit the generated page?',
    answer:
      'Yes. You have complete control to edit headlines, body copy, CTA actions, styling accents, SEO tags, and lead capture form fields in the live workspace before or after publishing.',
    category: 'Editing',
  },
  {
    question: 'Can I preview before publishing?',
    answer:
      'Yes. EDC separates private previews from public pages. Private previews (/preview/[projectId]) allow you and your team to review working drafts with noindex tags safely. The public page is only deployed when you explicitly approve and publish.',
    category: 'Publishing',
  },
  {
    question: 'Can I use my own custom domain?',
    answer:
      'Yes. You can publish on EDC-hosted domains ({slug}.edcmedia.club) or configure custom apex and subdomains (e.g., offers.yourcompany.com). Custom domains support automated SSL provisioning.',
    category: 'Publishing',
  },
  {
    question: 'Where is my landing page hosted?',
    answer:
      'Pages are served via high-speed cloud edge infrastructure with sub-second time-to-first-byte, automated SSL certificates, and responsive layouts tested across desktop and mobile devices.',
    category: 'Hosting',
  },
  {
    question: 'Can I capture leads directly on the page?',
    answer:
      'Yes. Every landing page includes native conversion-optimized lead capture forms that validate submissions, store contacts in your private workspace CRM, record conversion source attribution, and enable instant CSV export.',
    category: 'Leads',
  },
  {
    question: 'Can I see real conversion analytics?',
    answer:
      'Yes. EDC tracks real page views, unique visitors, CTA clicks, form submission completions, and drop-off rates with zero third-party cookie dependency.',
    category: 'Analytics',
  },
  {
    question: 'Can I optimize the page later?',
    answer:
      'Yes. EDC evaluates your page against a 5-dimension Conversion Readiness Score (Message, Persuasion, Trust, UX, Conversion). As traffic and leads accumulate, you can run AI-guided friction scans to optimize headlines, objections, and call-to-actions.',
    category: 'Optimization',
  },
  {
    question: 'Who is EDC Media Landing Engine for?',
    answer:
      'Founders, service business operators, agencies, and performance marketers who need high-converting landing pages deployed in minutes without wasting weeks in design agency meetings.',
    category: 'Audience',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Your leads, page versions, analytics, and business inputs belong entirely to your workspace. We never resell customer data, fabricate statistics, or inject third-party ad trackers into customer pages.',
    category: 'Trust & Privacy',
  },
];

export function HomepageFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-20 sm:py-28 bg-[#07090E] border-t border-white/[0.06] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F121A] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#00E5FF] mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Everything You Need to Know.
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Clear answers on how EDC Media Landing Engine creates, scores, publishes, and measures conversion-focused experiences.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 mb-16">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0F121A] border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.06)]'
                    : 'bg-[#0A0D14] border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-white">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#00E5FF] text-[#07090E]' : 'bg-white/[0.05] text-slate-400'
                    }`}
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/[0.04]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Architecture Callout */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F121A] border border-white/[0.1] flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
              <span>EDC Transparency Architecture</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                TRUTHFULNESS MANDATE
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We never display fake customer reviews, simulated revenue figures, or fabricated conversion statistics. If your offer lacks critical proof, our conversion engine explicitly flags it as missing evidence rather than inventing artificial testimonials.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
