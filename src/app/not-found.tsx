import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home, Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-lg p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black text-amber-600 tracking-wider uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            404 Page Not Found
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Resource Not Located</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or entity you requested could not be found. It may have been moved, deleted, or the identifier is invalid.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <Link
            href="/finance"
            className="px-4 py-2.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Finance Portal</span>
          </Link>
          <Link
            href="/procurement"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Procurement</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
