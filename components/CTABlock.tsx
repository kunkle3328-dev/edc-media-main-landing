'use client';

import React from 'react';
import { analytics } from '@/lib/analytics';

interface CTABlockProps {
  label: string;
  subtext?: string;
  actionType: string;
  url?: string;
  pageId: string;
  sectionId: string;
  ctaSource: string;
}

export function CTABlock({ label, subtext, actionType, url, pageId, sectionId, ctaSource }: CTABlockProps) {
  const handleClick = () => {
    analytics.trackConversion('hero_cta_clicked', {
      landingPageId: pageId,
      sectionId,
      ctaSource,
      metadata: { actionType, url }
    });
    
    if (actionType === 'call' && url) {
      window.location.href = `tel:${url}`;
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-8 py-4 bg-[#00E5FF] text-[#07090E] rounded-xl font-bold flex flex-col items-center gap-1 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
    >
      <span className="text-lg">{label}</span>
      {subtext && <span className="text-xs opacity-70">{subtext}</span>}
    </button>
  );
}
