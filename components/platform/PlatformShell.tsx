'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Globe,
  Plus,
  Settings,
  CreditCard,
  Bell,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Code2,
  Bot,
  Zap,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  Menu,
  FileText,
  HelpCircle,
  FolderPlus,
  BarChart3,
  Clock,
  ArrowRight,
  Monitor,
  Search,
} from 'lucide-react';
import { Workspace, UniversalProject, ProjectType, WorkspacePlan } from '@/types/platform';
import {
  WorkspaceService,
  ProjectService,
  ActivityService,
  DomainService,
} from '@/lib/services';
import { EDC_BRAND, getCorporateUrl } from '@/lib/brand-config';
import { useMounted, useStorageChangeVersion } from '@/lib/useMounted';

interface PlatformShellProps {
  children: React.ReactNode;
  activeTab?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PlatformShell({
  children,
  activeTab = 'dashboard',
  title,
  subtitle,
  actions,
}: PlatformShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMounted = useMounted();
  const storageVersion = useStorageChangeVersion();

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => WorkspaceService.getWorkspaces());
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(() => WorkspaceService.getActiveWorkspace());
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for new workspace
  const [newWsName, setNewWsName] = useState('');
  const [newWsPlan, setNewWsPlan] = useState<WorkspacePlan>('STARTER');

  // Form states for create project modal
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>('LANDING_PAGE');
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  useEffect(() => {
    if (isMounted) {
      const allWs = WorkspaceService.getWorkspaces();
      setWorkspaces(allWs);
      const active = WorkspaceService.getActiveWorkspace();
      setActiveWorkspace(active);
    }
  }, [isMounted, storageVersion]);

  const activities = ActivityService.getActivities(activeWorkspace?.id, 15);
  const domains = DomainService.getDomains(activeWorkspace?.id);
  const activeDomainsCount = domains.filter((d) => d.status === 'ACTIVE' || d.status === 'VERIFIED').length;

  const handleSwitchWorkspace = (wsId: string) => {
    WorkspaceService.setActiveWorkspace(wsId);
    const updated = WorkspaceService.getWorkspaceById(wsId);
    if (updated) setActiveWorkspace(updated);
    setIsWorkspaceDropdownOpen(false);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const created = await WorkspaceService.createWorkspace({
      name: newWsName.trim(),
      plan: newWsPlan,
    });
    setWorkspaces(WorkspaceService.getWorkspaces());
    setActiveWorkspace(created);
    setNewWsName('');
    setIsNewWorkspaceModalOpen(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const created = ProjectService.createProject({
      organizationId: 'org_edc_default',
      workspaceId: activeWorkspace.id,
      name: newProjName.trim(),
      type: selectedProjectType,
      description: newProjDesc.trim(),
    });

    setIsCreateModalOpen(false);
    setNewProjName('');
    setNewProjDesc('');

    // If it's a landing page, navigate to landing page builder
    if (selectedProjectType === 'LANDING_PAGE') {
      router.push('/builders/landing-pages');
    } else {
      router.push(`/projects/${created.id}`);
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'projects',
      label: 'All Projects',
      icon: Layers,
      href: '/projects',
    },
    {
      type: 'header',
      label: 'BUILDERS & ENGINES',
    },
    {
      id: 'landing-pages',
      label: 'Landing Pages',
      icon: Sparkles,
      href: '/builders/landing-pages',
      badge: 'PRO',
    },
    {
      id: 'websites',
      label: 'Websites',
      icon: Monitor,
      href: '/builders/websites',
    },
    {
      id: 'apps',
      label: 'AI Web Apps',
      icon: Code2,
      href: '/builders/apps',
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: Bot,
      href: '/builders/agents',
    },
    {
      id: 'automations',
      label: 'Automations',
      icon: Zap,
      href: '/builders/automations',
    },
    {
      type: 'header',
      label: 'INTELLIGENCE & GROWTH',
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Briefcase,
      href: '/opportunities',
    },
    {
      id: 'analytics',
      label: 'Analytics & Leads',
      icon: BarChart3,
      href: '/analytics',
    },
    {
      type: 'header',
      label: 'WORKSPACE SETTINGS',
    },
    {
      id: 'settings',
      label: 'Domains & Settings',
      icon: Settings,
      href: '/settings',
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: CreditCard,
      href: '/billing',
    },
  ];

  const projectTypeCards: { type: ProjectType; label: string; icon: any; desc: string }[] = [
    {
      type: 'LANDING_PAGE',
      label: 'Landing Page',
      icon: Sparkles,
      desc: '60-second direct response engine with objection handling.',
    },
    {
      type: 'WEBSITE',
      label: 'Full Website',
      icon: Monitor,
      desc: 'Multi-page brand portal with SEO and conversion funnels.',
    },
    {
      type: 'AI_APP',
      label: 'AI Web Application',
      icon: Code2,
      desc: 'Production full-stack app with server-side Gemini 2.5 reasoning.',
    },
    {
      type: 'AI_AGENT',
      label: 'Autonomous Agent',
      icon: Bot,
      desc: '24/7 inbound qualification, research, and dispatch assistant.',
    },
    {
      type: 'AUTOMATION',
      label: 'Revenue Automation',
      icon: Zap,
      desc: 'Webhook triggers, CRM syncing, and prospect enrichment.',
    },
    {
      type: 'BUSINESS_SYSTEM',
      label: 'Business System',
      icon: Briefcase,
      desc: 'Complete digital business infrastructure with checkout.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      {/* Platform Top Bar */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* EDC Brand Header */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#0F121A] border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)] group-hover:border-[#00E5FF] transition-all">
              <span className="text-[#00E5FF] font-mono text-xs font-black">EDC</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold tracking-tight text-sm">EDC MEDIA</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                  CLUB
                </span>
              </div>
            </div>
          </Link>

          {/* Workspace Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-slate-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="max-w-[140px] truncate">{activeWorkspace?.name || 'Workspace'}</span>
              <span className="text-[10px] font-mono text-slate-400 px-1 py-0.2 rounded bg-white/[0.05]">
                {activeWorkspace?.plan}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isWorkspaceDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0F121A] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1">
                  Your Workspaces
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-white/[0.05]">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleSwitchWorkspace(ws.id)}
                      className={`w-full text-left px-2.5 py-2 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-between group ${
                        ws.id === activeWorkspace.id ? 'bg-white/[0.04] text-[#00E5FF]' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate flex-1 pr-2">
                        <p className="text-xs font-medium truncate">{ws.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{ws.slug}.edcmedia.club</p>
                      </div>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/[0.05] text-slate-400">
                        {ws.plan}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 mt-1 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      setIsWorkspaceDropdownOpen(false);
                      setIsNewWorkspaceModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#00E5FF] hover:bg-[#00E5FF]/10 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Create New Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {/* Domain Status Badge */}
          <Link
            href="/settings"
            className="hidden md:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.08] text-slate-300 hover:border-[#00E5FF]/30 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-slate-400">Domains:</span>
            <span className="text-white font-semibold">{activeDomainsCount} Active</span>
          </Link>

          {/* Activity / Telemetry Drawer Toggle */}
          <button
            onClick={() => setIsActivityDrawerOpen(!isActivityDrawerOpen)}
            className="relative p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
            title="Activity Feed & Telemetry"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00E5FF]" />
          </button>

          {/* Global + CREATE Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#00E5FF] text-[#07090E] rounded-xl font-bold text-xs hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1.5"
            id="global-create-btn"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>CREATE</span>
          </button>

          {/* Link to Corporate Site */}
          <a
            href={getCorporateUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04]"
            title="Visit Corporate Site (edcmediahq.xyz)"
          >
            <span>Corporate</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </header>

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-white/[0.08] bg-[#07090E]/60 p-4 space-y-6">
          <div className="space-y-6">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search projects & tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              />
            </div>

            {/* Navigation List */}
            <nav className="space-y-1">
              {navItems.map((item, idx) => {
                if (item.type === 'header') {
                  return (
                    <div
                      key={idx}
                      className="pt-4 pb-1 px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold"
                    >
                      {item.label}
                    </div>
                  );
                }

                const Icon = item.icon!;
                const isActive = pathname === item.href || (item.id === activeTab && (!pathname || !pathname.startsWith('/projects/')));

                return (
                  <Link
                    key={item.id}
                    href={item.href!}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#00E5FF]' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0F121A] to-[#161B26] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">OPERATIONAL STATUS</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gemini 2.5 Active • Fast AI Reasoning Ready
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>{EDC_BRAND.platformDomain}</span>
              <span>v1.4</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-md flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">EDC Media Club</span>
                <span className="text-xs font-mono text-[#00E5FF]">v1.4</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white/[0.05] text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1">
              {navItems.map((item, idx) => {
                if (item.type === 'header') {
                  return (
                    <div
                      key={idx}
                      className="pt-4 pb-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold"
                    >
                      {item.label}
                    </div>
                  );
                }
                const Icon = item.icon!;
                return (
                  <Link
                    key={item.id}
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.05]"
                  >
                    <Icon className="w-4 h-4 text-[#00E5FF]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                {title && <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h1>}
                {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Universal + CREATE Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-white/20 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Create New Platform Project</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Choose the architectural type for your digital asset.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 sm:space-y-6">
              {/* Type Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {projectTypeCards.map((card) => {
                  const Icon = card.icon;
                  const isSelected = selectedProjectType === card.type;
                  return (
                    <button
                      type="button"
                      key={card.type}
                      onClick={() => setSelectedProjectType(card.type)}
                      className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
                        {isSelected && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00E5FF]" />}
                      </div>
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-white">{card.label}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 line-clamp-2 mt-0.5">{card.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Project Name & Description */}
              <div className="space-y-3 sm:space-y-4 pt-1">
                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lumina Dental Special or Emergency Dispatch Hub"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Description (Optional)</label>
                  <textarea
                    placeholder="Brief objective, primary target audience, or campaign focus..."
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 sm:px-4 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-white/10">
                <span className="text-[11px] font-mono text-slate-400">
                  Workspace: <strong className="text-white">{activeWorkspace.name}</strong>
                </span>
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00E5FF] text-[#07090E] text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1.5"
                  >
                    <span>Initialize Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Workspace Modal */}
      {isNewWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Health Group"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Plan Tier</label>
                <select
                  value={newWsPlan}
                  onChange={(e) => setNewWsPlan(e.target.value as WorkspacePlan)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="STARTER">Starter Engine ($49/mo)</option>
                  <option value="PRO">Growth Revenue Engine ($149/mo)</option>
                  <option value="AGENCY">Agency Enterprise ($2,490/mo)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewWorkspaceModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00E5FF] text-[#07090E] rounded-xl text-xs font-bold"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity / Telemetry Slide-over Drawer */}
      {isActivityDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0B0F17] border-l border-white/15 h-full p-6 flex flex-col justify-between animate-in slide-in-from-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="font-bold text-white">Platform Activity</h3>
                </div>
                <button
                  onClick={() => setIsActivityDrawerOpen(false)}
                  className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-160px)]">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#00E5FF] font-semibold">{act.type}</span>
                      <span className="text-slate-400">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">{act.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono">By: {act.actor || 'System'}</p>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8">No recent platform activities recorded.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Telemetry: <strong>CONNECTED</strong></span>
              <button
                onClick={() => setIsActivityDrawerOpen(false)}
                className="text-[#00E5FF] hover:underline"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
