'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Building2 } from 'lucide-react';

export default function ProcurementError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Procurement Portal error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-md p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-600 shadow-xs">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Procurement System Notice</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            There was an issue loading the procurement records for this view.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-slate-400 bg-slate-100 py-1 px-2.5 rounded-lg inline-block">
              Code: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>
          <Link
            href="/procurement"
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Procurement Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
