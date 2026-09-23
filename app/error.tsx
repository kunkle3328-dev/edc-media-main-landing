'use client';

import React from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('AppError boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white p-6">
      <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-2 text-[#00E5FF]">500</h1>
        <p className="text-sm text-slate-400 mb-6">Server Error Occurred</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] font-bold text-xs rounded-xl transition-all inline-block"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
