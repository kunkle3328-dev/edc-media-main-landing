'use client';

import React, { useState } from 'react';
import { BusinessProfile, StrategyObject } from '@/types/landing-engine';
import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  onStrategyGenerated: (strategy: StrategyObject) => void;
}

export function AIStrategistInterface({ onStrategyGenerated }: Props) {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '', offer: '', targetAudience: '', primaryGoal: 'leads'
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/landing-engine/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      onStrategyGenerated(data.strategy);
    } catch (e) {
      console.error('Strategist failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#0A0D14] rounded-xl border border-white/[0.1] text-white">
      <h2 className="text-sm font-bold tracking-wider mb-4">AI PAGE STRATEGIST</h2>
      <input className="w-full mb-2 bg-[#07090E] border border-white/[0.1] rounded px-2 py-1 text-sm" placeholder="Business Name" onChange={e => setProfile({...profile, name: e.target.value})} />
      <input className="w-full mb-2 bg-[#07090E] border border-white/[0.1] rounded px-2 py-1 text-sm" placeholder="Offer" onChange={e => setProfile({...profile, offer: e.target.value})} />
      <button 
        onClick={handleGenerate}
        className="w-full mt-2 py-2 bg-[#00E5FF] text-[#07090E] rounded font-bold text-xs uppercase"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate Strategy'}
      </button>
    </div>
  );
}
