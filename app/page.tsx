'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { EDCNavbar } from '@/components/EDCNavbar';
import { HeroSection } from '@/components/HeroSection';
import { LandingPageBuilder } from '@/components/LandingPageBuilder';
import { PagePreviewWorkspace } from '@/components/PagePreviewWorkspace';
import { BuiltByEDCSection } from '@/components/BuiltByEDCSection';
import { WhatEDCDoesSection } from '@/components/WhatEDCDoesSection';
import { HowEDCWorksSection } from '@/components/HowEDCWorksSection';
import { WhyEDCSection } from '@/components/WhyEDCSection';
import { PricingSection } from '@/components/PricingSection';
import { HomepageFAQSection } from '@/components/HomepageFAQSection';
import { FinalCTASection } from '@/components/FinalCTASection';
import { EDCFooter } from '@/components/EDCFooter';
import { LeadsManagerModal } from '@/components/LeadsManagerModal';
import { LandingPage, BusinessProfile } from '@/types/landing-engine';
import { pageStorage } from '@/lib/storage';
import { analytics } from '@/lib/analytics';
import { useMounted, useUrlHash, useStorageChangeVersion, notifyStorageChange } from '@/lib/useMounted';


export default function Home() {
  const isMounted = useMounted();
  const urlHash = useUrlHash();
  const storageVersion = useStorageChangeVersion();

  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<BusinessProfile | null>(null);
  const [showGlobalLeadsModal, setShowGlobalLeadsModal] = useState(false);

  // Safely derive saved pages and lead counts: exactly [] and 0 during SSR and initial hydration
  const savedPages = useMemo(() => {
    if (!isMounted || storageVersion < 0) return [];
    return pageStorage.getAllPages();
  }, [isMounted, storageVersion]);

  const totalLeadsCount = useMemo(() => {
    if (!isMounted || storageVersion < 0) return 0;
    return pageStorage.getAllLeads().length;
  }, [isMounted, storageVersion]);

  // Derive activePage: user selected page, or URL hash preview
  const activePage = useMemo(() => {
    if (selectedPage) return selectedPage;
    if (isMounted && urlHash.startsWith('#preview-')) {
      const pageId = urlHash.replace('#preview-', '');
      if (storageVersion < 0) return null;
      return pageStorage.getPage(pageId);
    }
    return null;
  }, [selectedPage, isMounted, urlHash, storageVersion]);

  // Initial analytics tracking on mount
  useEffect(() => {
    analytics.track('app_opened', { savedPagesCount: pageStorage.getAllPages().length });
  }, []);

  const handlePageGenerated = (newPage: LandingPage) => {
    // Save to local storage
    pageStorage.savePage(newPage);
    setSelectedPage(newPage);

    // Scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateActivePage = (updatedPage: LandingPage) => {
    pageStorage.savePage(updatedPage);
    setSelectedPage(updatedPage);
  };

  const handleDuplicatePage = (pageToDup: LandingPage) => {
    const duplicated = pageStorage.duplicatePage(pageToDup.id);
    if (duplicated) {
      setSelectedPage(duplicated);
    }
  };

  const handleScrollToBuilder = () => {
    if (activePage) {
      setSelectedPage(null);
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#preview-')) {
        window.history.replaceState(null, '', ' ');
      }
    }
    setTimeout(() => {
      const el = document.getElementById('builder-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartWithPreset = (profile: BusinessProfile) => {
    if (activePage) {
      setSelectedPage(null);
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#preview-')) {
        window.history.replaceState(null, '', ' ');
      }
    }
    setSelectedPreset(profile);
    handleScrollToBuilder();
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === 'starter' || planId === 'growth') {
      handleScrollToBuilder();
    } else {
      // Direct bespoke consultation trigger
      const el = document.getElementById('builder-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#07090E] text-slate-100 selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] font-sans antialiased">
      {/* Top Navbar */}
      <EDCNavbar
        onOpenBuilder={handleScrollToBuilder}
        onSelectSavedPage={(page) => setSelectedPage(page)}
        onResetToHome={() => {
          setSelectedPage(null);
          if (typeof window !== 'undefined' && window.location.hash.startsWith('#preview-')) {
            window.history.replaceState(null, '', ' ');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedPages={savedPages}
        onOpenLeads={() => setShowGlobalLeadsModal(true)}
        totalLeadsCount={totalLeadsCount}
      />

      {/* Conditional: Either Active Landing Page Workspace OR Flagship EDC Media Homepage */}
      {activePage ? (
        <PagePreviewWorkspace
          page={activePage}
          onUpdatePage={handleUpdateActivePage}
          onCloseWorkspace={() => {
            setSelectedPage(null);
            if (typeof window !== 'undefined' && window.location.hash.startsWith('#preview-')) {
              window.history.replaceState(null, '', ' ');
            }
          }}
          onDuplicatePage={handleDuplicatePage}
        />
      ) : (
        <main>
          {/* Hero Section */}
          <HeroSection
            onStartWithPreset={handleStartWithPreset}
            onScrollToBuilder={handleScrollToBuilder}
          />

          {/* 60-Second Landing Page Builder */}
          <LandingPageBuilder
            key={selectedPreset?.name || 'default'}
            onPageGenerated={handlePageGenerated}
            presetProfile={selectedPreset}
          />

          {/* Built by EDC Media (Portfolio) */}
          <BuiltByEDCSection
            onLoadProjectPreset={() => {
              handleScrollToBuilder();
            }}
          />

          {/* What EDC Media Does (Capabilities) */}
          <WhatEDCDoesSection />

          {/* How EDC Works (Methodology) */}
          <HowEDCWorksSection />

          {/* Why EDC Media (Architectural Comparison) */}
          <WhyEDCSection />

          {/* Pricing Section */}
          <PricingSection onSelectPlan={handleSelectPlan} />

          {/* Homepage FAQ Section */}
          <HomepageFAQSection />

          {/* Final Call to Action */}
          <FinalCTASection onScrollToBuilder={handleScrollToBuilder} />

          {/* Footer */}
          <EDCFooter />
        </main>
      )}

      {/* Global Leads Manager Modal */}
      {showGlobalLeadsModal && (
        <LeadsManagerModal
          leads={pageStorage.getAllLeads()}
          onClose={() => setShowGlobalLeadsModal(false)}
          onLeadsUpdated={notifyStorageChange}
        />
      )}
    </div>
  );
}
