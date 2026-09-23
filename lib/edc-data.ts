import { BusinessProfile } from '@/types/landing-engine';

export interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  problem: string;
  architecture: string;
  outcome: string;
  tags: string[];
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'edc-landing-engine',
    title: 'EDC Media Landing Engine™',
    tagline: 'Autonomous AI Landing Page Creation & Direct Response Platform',
    category: 'Flagship SaaS / Conversion Platform',
    description:
      'A full-stack, conversion-first generation engine that transforms high-level business ideas and offer details into structured, responsive, objection-handled landing pages in 60 seconds.',
    problem:
      'Traditional web design takes 4–8 weeks and produces generic brochureware with high visitor bounce rates and unclear user journeys.',
    architecture:
      'Structured 7-phase conversion pipeline (Attention → Clarity → Value → Trust → Action → Capture → Follow-Up) with real-time AI generation, device preview, and local lead pipeline.',
    outcome:
      'Generates ready-to-launch, production-grade landing pages in ~60 seconds with built-in objection handling and lead intake.',
    tags: ['Next.js 15', 'Gemini 2.5', 'Direct Response', 'CRO Engine'],
  },
  {
    id: 'apex-emergency-dispatch',
    title: 'Apex Emergency Dispatch Portal',
    tagline: '24/7 Rapid Incident Response & Localized Quote Engine',
    category: 'High-Urgency Local Service',
    description:
      'A specialized emergency capture system built for trades and contractor operations requiring sub-60-second inbound inquiry capture.',
    problem:
      'In high-stress emergencies (burst pipes, roof failures), prospects abandon complex forms and call the next listing if not given immediate certainty.',
    architecture:
      'Single-screen high-contrast layout, sticky instant-dial trigger, 45-minute dispatch radius counter, and zero-friction phone/address intake.',
    outcome:
      'Reduced initial inquiry completion time to under 20 seconds, eliminating drop-off in high-urgency buyer journeys.',
    tags: ['Local Service', 'Urgency CRO', 'Instant Dial', 'Frictionless Form'],
  },
  {
    id: 'signalflow-intent-engine',
    title: 'SignalFlow Intent Monitoring Platform',
    tagline: 'Predictive B2B Pipeline & Account Intent Surveillance',
    category: 'B2B Enterprise SaaS',
    description:
      'A software interface and landing architecture engineered for enterprise software buyers comparing high-ticket B2B solutions.',
    problem:
      'B2B software landing pages frequently hide pricing, drown buyers in vague buzzwords, and force multi-week demo wait times.',
    architecture:
      'Interactive 3-minute interactive pilot simulator, instant Slack integration walkthrough, and transparent pilot scoping without sales qualification gates.',
    outcome:
      'Eliminated demo request friction, delivering verified pipeline intent directly into team collaboration channels.',
    tags: ['B2B SaaS', 'Intent Data', 'Pipeline Automation', 'Interactive Demo'],
  },
  {
    id: 'founderscale-advisory',
    title: 'FounderScale Private Advisory',
    tagline: 'High-Ticket Executive Advisory & Operational Architecture',
    category: 'Executive Advisory & Consulting',
    description:
      'A minimalist, authority-driven digital sales environment built for high-ticket consultancy engagements between $25k and $100k.',
    problem:
      'High-net-worth founders and tech executives distrust noisy sales funnels, high-pressure countdown timers, and generic testimonials.',
    architecture:
      'Private diagnostic intake, structured operational case breakdowns, confidential vetting criteria, and calendar qualification flow.',
    outcome:
      'Attracts and pre-qualifies high-intent executive partners without cold sales friction.',
    tags: ['High-Ticket', 'Authority Staging', 'Private Intake', 'Confidential Flow'],
  },
];

// Alias for backward compatibility
export const EDC_PROJECTS = PORTFOLIO_PROJECTS;

export const CAPABILITIES = [
  {
    id: 'cap_1',
    title: 'AI-Powered Web Applications',
    subtitle: 'FULL-STACK SOFTWARE // MONETIZABLE PRODUCTS',
    iconName: 'Cpu',
    description:
      'We design and build bespoke, production-ready full-stack applications with modern frameworks, server-side AI reasoning, and high-performance databases.',
    bullets: [
      'Next.js & React architecture with zero unnecessary dependencies',
      'Secure server-side Gemini 2.5 API reasoning and streaming',
      'Durable multi-tenant database persistence and access control',
      'Fast, responsive mobile-first interfaces with sub-second page loads',
    ],
  },
  {
    id: 'cap_2',
    title: 'Autonomous & Agentic Workflows',
    subtitle: '24/7 REASONING // HIGH-FRICTION AUTOMATION',
    iconName: 'Bot',
    description:
      'Intelligent agents capable of autonomous research, document synthesis, customer qualification, multi-step triage, and background task execution.',
    bullets: [
      'Conversational customer intake and calendar dispatching',
      'Multi-source data synthesis and automated reporting',
      'Human-in-the-loop approval gates for mission-critical actions',
      'Continuous telemetry monitoring and adaptive error recovery',
    ],
  },
  {
    id: 'cap_3',
    title: 'High-Conversion Landing Systems',
    subtitle: 'DIRECT RESPONSE // PSYCHOLOGICAL CLARITY',
    iconName: 'Layout',
    description:
      'We treat landing pages as precision software tools, engineering every element around visitor attention, friction removal, and decisive action.',
    bullets: [
      'Psychological visitor pathways: Attention → Clarity → Trust → Action',
      'Automated objection handling through transparent FAQ models',
      'Multi-device viewport calibration (Desktop, Tablet, Mobile)',
      'Built-in conversion scoring and real-time AI optimization',
    ],
  },
  {
    id: 'cap_4',
    title: 'Automated Revenue & Sales Pipelines',
    subtitle: 'PIPELINE VELOCITY // CUSTOMER CAPTURE',
    iconName: 'DollarSign',
    description:
      'End-to-end digital sales systems that connect web visitors to checkout flows, CRM pipelines, calendar bookings, and follow-up automations.',
    bullets: [
      'Stripe billing and checkout integration with custom webhooks',
      'Local-first prospect capture with immediate CSV/API export',
      'Automated lead qualification and routing rules',
      'Predictable revenue modeling and analytics tracking',
    ],
  },
];

export const EDC_CAPABILITIES = CAPABILITIES;

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'DISCOVER',
    iconName: 'Compass',
    description:
      'We identify the actual customer bottleneck, primary buyer objection, and monetization mechanics before touching layout or code.',
    deliverable: 'Strategic Blueprint & Conversion Angle',
  },
  {
    step: '02',
    title: 'DESIGN',
    iconName: 'Lightbulb',
    description:
      'We engineer the exact psychological sequence: headline hook, value proposition, proof anchors, objection answers, and CTA anchors.',
    deliverable: 'Direct Response Wireframe & Copy Hierarchy',
  },
  {
    step: '03',
    title: 'BUILD',
    iconName: 'Terminal',
    description:
      'We architect the production codebase with Next.js, Tailwind CSS, TypeScript, and server-side intelligence. No speculative code or bloated themes.',
    deliverable: 'Production-Grade Application / Landing Engine',
  },
  {
    step: '04',
    title: 'LAUNCH',
    iconName: 'Rocket',
    description:
      'We deploy the system to production infrastructure, activating responsiveness, lead capture pipelines, and live telemetry.',
    deliverable: 'Live Production URL & Instant Intake Pipeline',
  },
  {
    step: '05',
    title: 'OPTIMIZE',
    iconName: 'TrendingUp',
    description:
      'We run the EDC Conversion Score™ to diagnose friction points and deploy one-click AI refinements to maximize conversion yield.',
    deliverable: 'Conversion Score Audit & One-Click Lift',
  },
];

export const EDC_PROCESS_STEPS = PROCESS_STEPS;

export const COMPARISON_ROWS = [
  {
    feature: 'Primary Objective',
    traditionalAgency: 'Visual aesthetics & billable hourly retainer cycles',
    genericBuilders: 'Generic templates with lorem ipsum placeholders',
    edcMedia: 'Measurable visitor conversion & cash flow acceleration',
  },
  {
    feature: 'Copywriting & Strategy',
    traditionalAgency: 'Outsourced to interns or junior copywriters after weeks',
    genericBuilders: 'Visitor must write everything from scratch',
    edcMedia: 'AI direct-response engine trained on proven offer architectures',
  },
  {
    feature: 'Time to Live Production',
    traditionalAgency: '4 to 12 weeks of bureaucratic revisions',
    genericBuilders: 'Hours of tedious drag-and-drop alignment',
    edcMedia: '60 seconds to initial build; instantaneous live updates',
  },
  {
    feature: 'Conversion Intelligence',
    traditionalAgency: 'Manual analytics setup charged as separate upsell',
    genericBuilders: 'Zero guidance on whether copy converts',
    edcMedia: 'Built-in EDC Conversion Score™ and 1-click AI optimization',
  },
  {
    feature: 'Underlying Tech Stack',
    traditionalAgency: 'Bloated WordPress themes with 40+ brittle plugins',
    genericBuilders: 'Proprietary locked-in site builders with high exit friction',
    edcMedia: 'Modern Next.js 15, TypeScript, Tailwind CSS, and exportable code',
  },
  {
    feature: 'Lead & Inbound Pipeline',
    traditionalAgency: 'Clunky third-party forms requiring extra SaaS fees',
    genericBuilders: 'Basic email notifications prone to spam filters',
    edcMedia: 'Local-first capture pipeline with instant CSV export & webhook support',
  },
];

export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter Engine',
    tagline: 'Ideal for independent operators and new product launches.',
    monthlyPrice: 49,
    popular: false,
    features: [
      'Up to 3 active landing engines',
      '60-second AI generation pipeline',
      'EDC Conversion Score™ diagnostics',
      'Desktop, Tablet, and Mobile preview',
      'Local prospect capture with CSV export',
      'Natural language AI page edits',
    ],
    cta: 'START WITH STARTER',
  },
  {
    id: 'growth',
    name: 'Growth Revenue Engine',
    tagline: 'For active businesses and campaigns requiring maximum conversion yield.',
    monthlyPrice: 149,
    popular: true,
    features: [
      'Up to 15 active landing engines',
      'One-Click AI Page Optimization',
      'Natural language section rewriting',
      'Section architect manual customization',
      'Direct response objection handling library',
      'Custom domain routing & clean export',
      'Priority AI generation latency',
    ],
    cta: 'DEPLOY GROWTH ENGINE',
  },
  {
    id: 'agency',
    name: 'Custom EDC Engineering',
    tagline: 'End-to-end bespoke AI web applications, autonomous agents, and revenue systems.',
    monthlyPrice: 2490,
    popular: false,
    features: [
      'Unlimited landing engines & workspaces',
      'Full bespoke Next.js & React engineering',
      'Custom autonomous voice & telephony agents',
      'Multi-step CRM and automated pipeline sync',
      'Direct engineering partnership with EDC Media team',
      'Full source code ownership & deployment support',
    ],
    cta: 'SCHEDULE ARCHITECTURE CALL',
  },
];

export const PRESET_EXAMPLES: { label: string; profile: BusinessProfile }[] = [
  {
    label: 'Emergency Plumbing (Service)',
    profile: {
      name: 'Apex Emergency Plumbing',
      offer: '24/7 Rapid Emergency Plumbing & Burst Pipe Repair — On-Site in 45 Minutes',
      targetAudience: 'Homeowners and property managers facing urgent water leaks or sewer backups',
      primaryGoal: 'calls',
      serviceArea: 'Greater Metro & Surrounding Suburbs (Within 35 miles)',
      uniqueHook: 'Zero Dispatch Fee with Completed Repair + 100% Upfront Transparent Quote',
      pricingHint: 'Repairs from $149 • Free Diagnostic with Repair',
    },
  },
  {
    label: 'B2B AI Software (SaaS)',
    profile: {
      name: 'SignalFlow AI',
      offer: 'Automated Intent Signal Monitoring that alerts B2B sales reps the moment high-value accounts visit review platforms',
      targetAudience: 'B2B SaaS VP of Sales and Growth Marketing Directors',
      primaryGoal: 'appointments',
      serviceArea: 'Global / Remote Cloud',
      uniqueHook: 'Integrates with Slack & Salesforce in 3 minutes. Zero code needed.',
      pricingHint: '14-Day Free Pipeline Pilot',
    },
  },
  {
    label: 'High-Ticket Coaching (Consulting)',
    profile: {
      name: 'FounderScale Advisory',
      offer: 'Private 1-on-1 Operational & Revenue Architecture for Series-A Tech Founders scaling from $1M to $10M ARR',
      targetAudience: 'Venture-backed B2B software founders experiencing scaling bottlenecks',
      primaryGoal: 'appointments',
      serviceArea: 'Worldwide Executive Consultations',
      uniqueHook: 'Battle-tested 90-day execution sprints led by operators who built $50M+ companies',
      pricingHint: 'Confidential Quarterly Retainer',
    },
  },
  {
    label: 'Boutique Dental Clinic (Local)',
    profile: {
      name: 'Lumina Modern Dental & Implants',
      offer: 'Pain-Free Cosmetic Dentistry, Same-Day Porcelain Veneers & Dental Implants',
      targetAudience: 'Adults seeking restorative smiles and anxiety-free gentle dental care',
      primaryGoal: 'leads',
      serviceArea: 'Downtown & Northside District',
      uniqueHook: 'Complimentary 3D Digital Smile Simulation included with every consultation',
      pricingHint: 'New Patient Special: Comprehensive Exam & 3D Scan $99',
    },
  },
];
