'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, ArrowLeft } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Root Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-lg p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600 shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Something Went Wrong</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred while loading this view. You can try refreshing the page or returning to the portal.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-slate-400 bg-slate-100 py-1 px-2.5 rounded-lg inline-block">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/finance"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Finance Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
