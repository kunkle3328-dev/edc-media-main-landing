'use client';

import React, { useState } from 'react';
import { LandingPage, ConversionAnalysis } from '@/types/landing-engine';
import { Loader2, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  page: LandingPage;
  onApplyFix: (payload: any) => void;
}

export function ConversionDiagnosticDashboard({ page, onApplyFix }: Props) {
  const [analysis, setAnalysis] = useState<ConversionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/landing-engine/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e) {
      console.error('Analysis failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-[#0A0D14] rounded-xl border border-white/[0.1] text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold tracking-wider">CONVERSION DIAGNOSTICS</h2>
        <button 
          onClick={runAnalysis}
          className="px-3 py-1.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 rounded-lg text-xs font-bold hover:bg-[#00E5FF]/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Analysis'}
        </button>
      </div>

      {analysis ? (
        <div className="space-y-6">
          <div className="text-center p-4 bg-[#0F121A] rounded-lg">
            <div className="text-4xl font-extrabold text-[#00E5FF]">{analysis.score}</div>
            <div className="text-xs text-slate-400 mt-1">OVERALL CONVERSION SCORE</div>
          </div>
          
          <div>
            <h3 className="text-xs font-mono text-slate-400 mb-2">PRIORITY ACTIONS</h3>
            {analysis.priorityActions.map(action => (
              <div key={action.id} className="p-3 mb-2 bg-[#0F121A] rounded-lg border border-white/[0.05]">
                <p className="text-xs font-semibold mb-1">{action.title}</p>
                <button 
                  onClick={() => onApplyFix(action.mutationPayload)}
                  className="text-[10px] bg-[#00E5FF] text-[#07090E] px-2 py-1 rounded font-bold uppercase"
                >
                  Fix with AI
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 text-xs">Run analysis to see diagnostic insights</div>
      )}
    </div>
  );
}
