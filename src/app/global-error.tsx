'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900 antialiased">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Application Error</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              A critical application error occurred. Click below to reload and restore normal operations.
            </p>
            {error?.digest && (
              <p className="text-[10px] font-mono text-slate-400 bg-slate-100 py-1 px-2.5 rounded-lg inline-block">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full px-5 py-2.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
