'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('GlobalError boundary caught error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark bg-[#07090E] text-white">
      <body className="bg-[#07090E] text-white antialiased min-h-screen">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-[#0F131D] p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h1 className="text-4xl font-extrabold mb-2 text-[#00E5FF]">500</h1>
            <p className="text-sm text-slate-400 mb-6">Fatal Error</p>
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#00E5FF] text-[#07090E] font-bold text-xs rounded-xl transition-all inline-block"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
