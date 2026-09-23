'use client';

import React from 'react';
import { AnalysisStatus } from '@/types/landing-engine';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ConversionScoreRingProps {
  score: number;
  status: AnalysisStatus;
  size?: 'sm' | 'md' | 'lg';
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

export function ConversionScoreRing({
  score,
  status,
  size = 'md',
  onReanalyze,
  isAnalyzing = false,
}: ConversionScoreRingProps) {
  // Dimensions
  const radius = size === 'lg' ? 64 : size === 'md' ? 48 : 34;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4.5;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Score Tier Colors
  const getScoreColor = (val: number) => {
    if (val >= 90) return '#00E5FF'; // EDC Cyan / Elite
    if (val >= 75) return '#10B981'; // Emerald / Strong
    if (val >= 60) return '#F59E0B'; // Amber / Needs Attention
    return '#EF4444'; // Rose / Critical
  };

  const scoreColor = getScoreColor(clampedScore);

  const getReadinessLabel = (val: number) => {
    if (val >= 90) return 'ELITE CONVERSION READINESS';
    if (val >= 75) return 'STRONG CONVERSION POTENTIAL';
    if (val >= 60) return 'MODERATE CONVERSION LEAKS';
    return 'CRITICAL FRICTION DETECTED';
  };

  return (
    <div className="flex flex-col items-center">
      {/* SVG Radial Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius * 2 + strokeWidth * 2}
          className="transform -rotate-90 drop-shadow-[0_0_12px_rgba(0,229,255,0.15)]"
        >
          {/* Background Track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Active Animated Ring */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isAnalyzing ? circumference * 0.75 : strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isAnalyzing ? (
            <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin" />
          ) : (
            <>
              <div className="flex items-baseline justify-center">
                <span
                  className="font-bold tracking-tight text-white font-mono"
                  style={{
                    fontSize: size === 'lg' ? '2.5rem' : size === 'md' ? '1.85rem' : '1.25rem',
                    lineHeight: 1,
                  }}
                >
                  {clampedScore}
                </span>
                <span
                  className="text-slate-500 font-mono"
                  style={{
                    fontSize: size === 'lg' ? '0.875rem' : '0.75rem',
                    marginLeft: '2px',
                  }}
                >
                  /100
                </span>
              </div>
              {size !== 'sm' && (
                <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 mt-0.5">
                  EDC SCORE
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status & Readiness Label */}
      {size !== 'sm' && (
        <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5">
            {status === 'ANALYSIS_READY' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                ANALYSIS READY
              </span>
            )}
            {status === 'STALE' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                PAGE CHANGED • STALE
              </span>
            )}
            {status === 'ANALYZING' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                <RefreshCw className="w-3 h-3 animate-spin" />
                EVALUATING PAGE...
              </span>
            )}
            {status === 'ERROR' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-3 h-3" />
                ANALYSIS ERROR
              </span>
            )}

            {onReanalyze && status === 'STALE' && (
              <button
                onClick={onReanalyze}
                disabled={isAnalyzing}
                className="text-[10px] font-mono text-[#00E5FF] hover:underline flex items-center gap-1"
                title="Update analysis for recent changes"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Update</span>
              </button>
            )}
          </div>

          <div
            className="text-xs font-mono font-bold tracking-wide"
            style={{ color: scoreColor }}
          >
            {getReadinessLabel(clampedScore)}
          </div>
        </div>
      )}
    </div>
  );
}
