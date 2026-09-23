import { LandingPage, LandingPageVersion } from '@/types/landing-engine';

export const LUMINA_DENTAL_PAGE: LandingPage = {
  id: 'page_cttybo0',
  name: 'Lumina Modern Dental & Implants',
  slug: 'lumina-modern-dental-implants-tybo0',
  publicSlug: 'lumina-modern-dental-implants-tybo0',
  status: 'published',
  workspaceId: 'workspace_edc_default',
  publishedVersionId: 'v_page_cttybo0_1_init',
  publishedAt: '2026-09-13T12:00:00.000Z',
  createdAt: '2026-09-13T12:00:00.000Z',
  updatedAt: '2026-09-13T12:00:00.000Z',
  businessProfile: {
    name: 'Lumina Modern Dental & Implants',
    offer: 'Pain-Free Cosmetic Dentistry, Same-Day Porcelain Veneers & Dental Implants',
    targetAudience: 'Adults seeking restorative smiles and anxiety-free gentle dental care',
    primaryGoal: 'leads',
    serviceArea: 'Downtown & Northside District',
    uniqueHook: 'Complimentary 3D Digital Smile Simulation included with every consultation',
    pricingHint: 'New Patient Special: Comprehensive Exam & 3D Scan $99',
  },
  strategy: {
    businessName: 'Lumina Modern Dental & Implants',
    businessType: 'Boutique Cosmetic & Restorative Dentistry',
    offer: 'Pain-Free Cosmetic Dentistry, Same-Day Porcelain Veneers & Dental Implants',
    targetAudience: 'Adults seeking restorative smiles and anxiety-free gentle dental care',
    customerProblem: 'Dental anxiety, fear of painful drills, and hidden treatment pricing keep patients from getting the healthy smile they deserve.',
    desiredOutcome: 'A radiant, natural smile achieved with gentle touch, zero pain, transparent pricing, and same-day digital precision.',
    primaryGoal: 'leads',
    primaryCTA: {
      label: 'Claim $99 Exam & 3D Scan',
      subtext: 'Includes Complimentary 3D Smile Simulation',
      actionType: 'form',
    },
    secondaryCTA: {
      label: 'Explore Pain-Free Treatments',
      actionType: 'scroll',
    },
    valueProposition: 'Experience gentle, anxiety-free dentistry with precision digital technology and guaranteed comfort.',
    positioning: 'Premier Boutique Smile Studio with Compassionate, Pain-Free Technology',
    urgency: 'New Patient Special Limited to First 25 Inquiries This Month',
    trustRequirements: [
      'Board-Certified Cosmetic Dentists & Implantologists',
      'Over 1,200 Transformed Smiles',
      'Whisper-Quiet Electric Handpieces & Zero-Pain Guarantee',
      'Advanced 3D Smile Simulation',
    ],
    objectionHandling: [
      {
        objection: 'Will the dental implant procedure hurt?',
        counter: 'Our gentle sedation options and advanced precision local anesthesia ensure total patient comfort with minimal next-day downtime.',
      },
      {
        objection: 'Are cosmetic veneers noticeable or bulky?',
        counter: 'We use ultra-thin, micro-layered porcelain customized to your facial symmetry for a completely natural, luminous finish.',
      },
      {
        objection: 'Are there hidden dental fees?',
        counter: 'No hidden fees ever. All treatment plans include a transparent, itemized cost estimate before any procedure starts.',
      },
    ],
    recommendedSections: [
      'hero',
      'urgency',
      'problem',
      'solution',
      'benefits',
      'how_it_works',
      'social_proof',
      'faq',
      'lead_capture',
      'footer',
    ],
    recommendedTone: 'Empathetic, reassuring, clinical excellence, modern luxury',
    recommendedVisualDirection: 'Obsidian dark luxury with electric cyan and calming violet accents',
    recommendedSEOKeywords: [
      'dental implants downtown',
      'cosmetic dentistry veneers',
      'pain free dentist northside',
      'same day dental veneers',
      'gentle dental implants',
    ],
    conversionRisks: ['High procedural fear', 'Financial uncertainty'],
    missingInformation: [],
  },
  theme: {
    mode: 'obsidian',
    primaryAccent: '#00E5FF',
    secondaryAccent: '#8B5CF6',
  },
  ctaConfig: {
    primaryText: 'Claim $99 Exam & 3D Scan',
    primarySubtext: 'Includes Complimentary 3D Smile Simulation',
    actionType: 'scroll_to_form',
  },
  leadCaptureConfig: {
    title: 'Claim Your $99 Exam & 3D Smile Simulation',
    subtitle: 'Lock in this special offer today. Our patient concierge will contact you within 15 minutes to confirm your preferred time.',
    submitButtonText: 'Reserve My $99 Consultation',
    successHeadline: 'Your Priority Consultation is Reserved',
    successMessage: 'Thank you! Our concierge team will reach out shortly to confirm your booking.',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Dr. John Doe', required: true },
      { name: 'phone', label: 'Mobile Phone', type: 'tel', placeholder: '(555) 000-0000', required: true },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
      { name: 'notes', label: 'Primary Concern', type: 'textarea', placeholder: 'Tell us what you would like to improve about your smile...', required: false },
    ],
  },
  conversionScore: {
    overallScore: 92,
    label: 'High-Converting Medical Asset',
    assessmentSummary: 'Exceptional visual alignment, strong trust architecture, clear risk-reversal offer, and low-friction lead capture for local cosmetic dentistry.',
    metrics: [
      { name: 'Headline Clarity', score: 95, weight: 15, feedback: 'Eliminates procedural dread immediately with clear pain-free promise.' },
      { name: 'Offer Attractiveness', score: 94, weight: 15, feedback: 'Strong $99 entry barrier reduction with high perceived 3D scan value.' },
      { name: 'CTA Prominence', score: 96, weight: 15, feedback: 'Consistently visible across all viewport breakpoints.' },
      { name: 'Trust & Proof Signals', score: 88, weight: 15, feedback: 'Board certification badges and verified patient transformation points.' },
      { name: 'Objection Handling', score: 91, weight: 10, feedback: 'Directly addresses anesthesia fear, natural appearance, and pricing.' },
      { name: 'Mobile Responsiveness', score: 96, weight: 10, feedback: 'Thumb-friendly touch targets and rapid intake layout.' },
      { name: 'Form Friction', score: 90, weight: 10, feedback: 'Low cognitive load with clear phone-first contact.' },
    ],
    whatsWorking: [
      'Zero-pain guarantee counters patient reluctance directly.',
      'Transparent $99 entry offer drastically cuts hesitation.',
      'High-impact obsidian aesthetic conveys high-end cosmetic clinical mastery.',
      'Real-time simulation hook drives appointment urgency.',
    ],
    whatsMissing: [
      'Video patient testimonial carousel (recommended for future iteration).',
    ],
    topImprovements: [
      {
        id: 'imp_1',
        title: 'Highlight Same-Day Availability',
        impact: 'high',
        action: 'Mention that morning appointments can receive evening simulations.',
      },
    ],
  },
  seo: {
    title: 'Lumina Modern Dental & Implants | Pain-Free Cosmetic Dentistry & Dental Implants',
    metaDescription: 'Experience gentle, anxiety-free cosmetic dentistry, same-day porcelain veneers, and lifetime-warrantied dental implants in a luxury clinic. Claim your $99 Exam & 3D Smile Simulation today.',
    keywords: ['dental implants', 'cosmetic dentistry', 'veneers', 'pain-free dentist', 'downtown dental clinic'],
    ogTitle: 'Lumina Modern Dental & Implants | Pain-Free Cosmetic Dentistry',
    ogDescription: 'Experience gentle, anxiety-free cosmetic dentistry and same-day dental implants. Claim your $99 Exam & 3D Smile Simulation today.',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
  },
  sections: [
    {
      id: 'sec_hero',
      type: 'hero',
      order: 1,
      visibility: true,
      content: {
        headline: 'Restore Your Confident Smile with Truly Pain-Free Modern Dentistry',
        subheadline: 'Advanced cosmetic dental care, same-day porcelain veneers, and lifetime-warrantied implants in a soothing, luxury clinic.',
        primaryCTALabel: 'Claim $99 Exam & 3D Scan',
        primaryCTAAction: 'scroll_to_form',
        secondaryCTALabel: 'Explore Pain-Free Treatments',
        secondaryCTAAction: 'scroll_to_problem',
      },
    },
    {
      id: 'sec_urgency',
      type: 'announcement',
      order: 2,
      visibility: true,
      content: {
        badge: 'Priority Intake',
        text: 'New Patient Special: Comprehensive Exam, Digital X-Rays & 3D Smile Simulation Just $99 (Value $350) — Limited Availability This Month',
      },
    },
    {
      id: 'sec_problem',
      type: 'problem',
      order: 3,
      visibility: true,
      content: {
        title: 'Tired of Hiding Your Smile or Dreading the Dentist?',
        subtitle: 'Dental anxiety, painful past experiences, and unexpected bills shouldn’t keep you from the confidence you deserve.',
        painPoints: [
          'Dental phobia and fear of painful drills keeping you from getting essential restorative care.',
          'Feeling self-conscious in photos or social settings due to chipped, discolored, or missing teeth.',
          'Unclear dental estimates and surprise bills before procedures even begin.',
        ],
      },
    },
    {
      id: 'sec_solution',
      type: 'solution',
      order: 4,
      visibility: true,
      content: {
        title: 'The Lumina Difference: Gentle, Anxiety-Free Smile Architecture',
        description: 'We combine whisper-quiet technology, gentle sedation options, and cutting-edge 3D imaging to deliver flawless aesthetic and restorative results in complete comfort.',
        keyPillars: [
          {
            title: 'Zero-Pain Comfort Guarantee',
            detail: 'Gentle micro-anesthesia, nitrous oxide, and oral sedation ensure you feel completely relaxed throughout your visit.',
          },
          {
            title: '3D Smile Simulation',
            detail: 'See your simulated smile on an interactive 4K display before touching a single tooth.',
          },
          {
            title: '100% Upfront Pricing',
            detail: 'Transparent, itemized pricing and flexible 0% interest monthly financing options with zero surprises.',
          },
        ],
      },
    },
    {
      id: 'sec_benefits',
      type: 'benefits',
      order: 5,
      visibility: true,
      content: {
        title: 'Engineered For Pure Patient Comfort and Lifelong Results',
        items: [
          {
            title: 'Same-Day Digital Scans',
            explanation: 'No messy, gag-inducing impression goop. Comfortable 3D optical scanning in 90 seconds.',
            metricOrBadge: 'Instant 3D Scan',
          },
          {
            title: 'Lifetime Implant Warranty',
            explanation: 'Medical-grade titanium and zirconia implants built to last a lifetime with certified specialists.',
            metricOrBadge: '100% Backed',
          },
          {
            title: 'Luxury Suite Amenities',
            explanation: 'Noise-canceling headphones, streaming entertainment, warm blankets, and soothing aromatherapy in every suite.',
            metricOrBadge: '5-Star Comfort',
          },
        ],
      },
    },
    {
      id: 'sec_how_it_works',
      type: 'how_it_works',
      order: 6,
      visibility: true,
      content: {
        title: 'Your 3-Step Journey to a Flawless Smile',
        steps: [
          {
            step: '01',
            title: 'Claim Your $99 Intake',
            detail: 'Complete our 30-second form. Our patient concierge confirms your priority suite booking with zero wait times.',
          },
          {
            step: '02',
            title: 'Interactive 3D Smile Design',
            detail: 'Receive your gentle digital exam and watch your future smile rendered in stunning photorealistic 3D.',
          },
          {
            step: '03',
            title: 'Gentle, Flawless Transformation',
            detail: 'Relax in total comfort while our specialists craft your bespoke veneers or restorative implants.',
          },
        ],
      },
    },
    {
      id: 'sec_social_proof',
      type: 'social_proof',
      order: 7,
      visibility: true,
      content: {
        title: 'Trust & Clinical Commitments',
        badgeList: [
          'Board-Certified Prosthodontists',
          'Over 1,200 Restored Smiles',
          'Zero-Pain Sedation Certified',
          '100% Transparent Pricing',
        ],
        proofPoints: [
          {
            label: '1,200+ Transformed Patients',
            note: 'Restoring everyday chewing comfort and photogenic confidence for patients throughout the region.',
          },
          {
            label: 'Top-Rated Local Dental Studio',
            note: 'Recognized for compassionate, gentle patient care and clinical excellence in cosmetic restorative dentistry.',
          },
        ],
      },
    },
    {
      id: 'sec_faq',
      type: 'faq',
      order: 8,
      visibility: true,
      content: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'Is the dental implant procedure really pain-free?',
            answer: 'Yes. With modern gentle numbing techniques and conscious sedation options, our patients consistently report feeling nothing more than light vibration, with fast, comfortable recovery.',
          },
          {
            question: 'What is included in the $99 New Patient Special?',
            answer: 'The $99 special includes a comprehensive clinical examination, full-mouth low-dose digital X-rays, periodontal health evaluation, and a complimentary 3D Digital Smile Simulation.',
          },
          {
            question: 'Do you offer monthly payment options?',
            answer: 'Yes! We partner with leading healthcare financing providers offering flexible payment plans with 0% promotional interest up to 24 months.',
          },
          {
            question: 'How long do porcelain veneers last?',
            answer: 'Our custom porcelain veneers are engineered from high-grade biocompatible ceramics that resist staining and chipping, lasting 15 to 20+ years with standard oral hygiene.',
          },
        ],
      },
    },
    {
      id: 'sec_lead_capture',
      type: 'lead_capture',
      order: 9,
      visibility: true,
      content: {
        title: 'Claim Your $99 Exam & 3D Smile Simulation',
        subtitle: 'Lock in this special offer today. Our patient concierge will contact you within 15 minutes to confirm your preferred time.',
        submitButtonText: 'Reserve My $99 Consultation',
        successHeadline: 'Your Priority Consultation is Reserved',
        successMessage: 'Thank you! Our concierge team will reach out shortly to confirm your booking.',
      },
    },
    {
      id: 'sec_footer',
      type: 'footer',
      order: 10,
      visibility: true,
      content: {
        businessName: 'Lumina Modern Dental & Implants',
        disclaimer: 'Engineered for conversion excellence by EDC Media Landing Engine™. All rights reserved.',
      },
    },
  ],
};

export const LUMINA_DENTAL_VERSION: LandingPageVersion = {
  id: 'v_page_cttybo0_1_init',
  pageId: 'page_cttybo0',
  workspaceId: 'workspace_edc_default',
  versionNumber: 1,
  createdAt: '2026-09-13T12:00:00.000Z',
  publishedAt: '2026-09-13T12:00:00.000Z',
  isPublished: true,
  changeReason: 'Production Baseline Publish',
  changeSummary: 'Production release of Lumina Modern Dental & Implants landing page',
  conversionScore: 92,
  content: LUMINA_DENTAL_PAGE,
  snapshot: LUMINA_DENTAL_PAGE,
};
