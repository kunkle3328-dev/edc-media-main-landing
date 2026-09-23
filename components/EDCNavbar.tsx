'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Menu,
  X,
  Layers,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LandingPage } from '@/types/landing-engine';
import { useMounted } from '@/lib/useMounted';
import { useAuth } from './AuthProvider';

interface EDCNavbarProps {
  onOpenBuilder?: () => void;
  onSelectSavedPage?: (page: LandingPage) => void;
  savedPages?: LandingPage[];
  onOpenLeads?: () => void;
  totalLeadsCount?: number;
  onResetToHome?: () => void;
}

export function EDCNavbar({
  onOpenBuilder,
  onSelectSavedPage,
  savedPages = [],
  onResetToHome,
}: EDCNavbarProps) {
  const { user, signIn, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    // Phase 6: Navbar Scroll Performance Optimization
    // Using IntersectionObserver to detect scroll threshold instead of 
    // a continuous scroll event listener that triggers React state updates.
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = '40px';
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    sentinel.style.pointerEvents = 'none';
    sentinel.style.visibility = 'hidden';
    document.body.prepend(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  const scrollToSection = (sectionId: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMobileMenuOpen(false);

    // If not currently on the homepage, route to /#sectionId
    if (pathname !== '/') {
      router.push(`/#${sectionId}`);
      return;
    }

    // If active page workspace is open, reset to home so sections exist in the DOM
    if (onResetToHome) {
      onResetToHome();
    }

    // Defer scroll until mobile menu animation/reflow settles
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbar = document.getElementById('edc-navbar');
        const navHeight = navbar ? navbar.getBoundingClientRect().height : 70;
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const targetPosition = Math.max(0, absoluteElementTop - navHeight - 16);

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      } else {
        window.location.hash = sectionId;
      }
    }, 60);
  };

  return (
    <header
      id="edc-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,padding,box-shadow] duration-300 ${
        scrolled
          ? 'bg-[#07090E]/95 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            if (pathname !== '/') {
              router.push('/');
            } else {
              if (onResetToHome) {
                onResetToHome();
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] text-left cursor-pointer touch-manipulation"
          id="edc-brand-logo"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0F121A] to-[#161B26] border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)] group-hover:border-[#00E5FF] transition-[border-color]">
            <span className="text-[#00E5FF] font-mono text-sm font-black tracking-tighter">
              EDC
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold tracking-tight text-sm sm:text-lg">
                EDC MEDIA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shrink-0" />
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-mono text-slate-400 -mt-1 truncate">
              Landing Engine™
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links - Specification 27 */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={(e) => scrollToSection('hero-demo-section', e)}
            className="hover:text-[#00E5FF] transition-colors focus:outline-none focus:text-[#00E5FF] bg-transparent border-none cursor-pointer text-sm font-medium text-slate-300 touch-manipulation"
          >
            PRODUCT
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection('process-section', e)}
            className="hover:text-[#00E5FF] transition-colors focus:outline-none focus:text-[#00E5FF] bg-transparent border-none cursor-pointer text-sm font-medium text-slate-300 touch-manipulation"
          >
            HOW IT WORKS
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection('portfolio-section', e)}
            className="hover:text-[#00E5FF] transition-colors focus:outline-none focus:text-[#00E5FF] bg-transparent border-none cursor-pointer text-sm font-medium text-slate-300 touch-manipulation"
          >
            EXAMPLES
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection('pricing-section', e)}
            className="hover:text-[#00E5FF] transition-colors focus:outline-none focus:text-[#00E5FF] bg-transparent border-none cursor-pointer text-sm font-medium text-slate-300 touch-manipulation"
          >
            PRICING
          </button>

          {/* App Dashboard Link */}
          <Link
            href="/dashboard"
            className="hover:text-[#00E5FF] transition-colors flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] cursor-pointer touch-manipulation"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>DASHBOARD</span>
          </Link>

          {/* Saved Pages Dropdown if any exist */}
          {mounted && savedPages.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F121A] border border-white/[0.1] text-xs font-mono text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors cursor-pointer touch-manipulation"
                id="saved-pages-toggle"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>MY PAGES ({savedPages.length})</span>
              </button>

              {pagesDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-[#0F121A] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1">
                    Saved Landing Pages
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.05]">
                    {savedPages.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => {
                          if (onSelectSavedPage) {
                            onSelectSavedPage(page);
                          }
                          setPagesDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="truncate flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-white truncate group-hover:text-[#00E5FF]">
                              {page.name}
                            </p>
                            {page.status === 'published' && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {page.status === 'published' && page.publicSlug
                              ? `${page.publicSlug}.edcmedia.club`
                              : page.strategy?.primaryCTA?.label || 'Direct Response'}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00E5FF]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {mounted && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#00E5FF]/40 transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#00E5FF]/20 flex items-center justify-center border border-[#00E5FF]/30">
                      <UserIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
                    </div>
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-tighter">
                      {user.displayName?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 w-48 bg-[#0F121A] border border-white/[0.12] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">Authenticated As</p>
                        <p className="text-xs font-medium text-white truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => signIn()}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  SIGN IN
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (pathname !== '/') {
                router.push('/#builder-section');
              } else if (onOpenBuilder) {
                onOpenBuilder();
              } else {
                scrollToSection('builder-section');
              }
            }}
            className="relative group overflow-hidden px-5 py-2.5 rounded-lg bg-[#00E5FF] text-[#07090E] font-semibold text-xs tracking-wider uppercase transition-[box-shadow,transform] duration-200 hover:shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer touch-manipulation"
            id="nav-build-page-btn"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              BUILD MY LANDING PAGE
            </span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg bg-[#0F121A] border border-white/[0.1] text-slate-300 hover:text-white active:bg-white/[0.1] cursor-pointer touch-manipulation focus:outline-none"
            aria-label="Toggle Navigation Menu"
            id="edc-mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop for easy tap-to-close on mobile */}
          <div
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 lg:hidden bg-[#07090E] border-b border-white/[0.1] px-4 py-6 space-y-4 max-h-[calc(100vh-70px)] overflow-y-auto shadow-2xl">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <button
                type="button"
                onClick={(e) => scrollToSection('hero-demo-section', e)}
                className="text-left text-slate-300 hover:text-white py-2 px-1 w-full bg-transparent border-none cursor-pointer text-sm font-medium transition-colors active:text-[#00E5FF] touch-manipulation"
              >
                PRODUCT
              </button>
              <button
                type="button"
                onClick={(e) => scrollToSection('process-section', e)}
                className="text-left text-slate-300 hover:text-white py-2 px-1 w-full bg-transparent border-none cursor-pointer text-sm font-medium transition-colors active:text-[#00E5FF] touch-manipulation"
              >
                HOW IT WORKS
              </button>
              <button
                type="button"
                onClick={(e) => scrollToSection('portfolio-section', e)}
                className="text-left text-slate-300 hover:text-white py-2 px-1 w-full bg-transparent border-none cursor-pointer text-sm font-medium transition-colors active:text-[#00E5FF] touch-manipulation"
              >
                EXAMPLES
              </button>
              <button
                type="button"
                onClick={(e) => scrollToSection('pricing-section', e)}
                className="text-left text-slate-300 hover:text-white py-2 px-1 w-full bg-transparent border-none cursor-pointer text-sm font-medium transition-colors active:text-[#00E5FF] touch-manipulation"
              >
                PRICING
              </button>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#00E5FF] font-mono py-2 px-1 flex items-center gap-2 text-sm touch-manipulation cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>APP DASHBOARD</span>
              </Link>
            </nav>

            <div className="pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname !== '/') {
                    router.push('/#builder-section');
                  } else if (onOpenBuilder) {
                    onOpenBuilder();
                  } else {
                    scrollToSection('builder-section');
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-[#00E5FF] text-[#07090E] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-[0.98] transition-transform"
                id="mobile-build-btn"
              >
                <Sparkles className="w-4 h-4" />
                <span>BUILD MY LANDING PAGE</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
