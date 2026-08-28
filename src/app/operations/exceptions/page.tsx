'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  User,
  Filter,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalException, ExceptionCategory, ExceptionSeverity, ExceptionStatus } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function ExceptionCentrePage() {
  const [exceptions, setExceptions] = useState<OperationalException[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [resolveModalTarget, setResolveModalTarget] = useState<OperationalException | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadData = () => {
    setExceptions(operationsService.getExceptions());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const filteredExceptions = exceptions.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && e.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'All' && e.status !== selectedStatus) return false;
    return true;
  });

  const handleResolveException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalTarget) return;

    operationsService.updateExceptionStatus(
      resolveModalTarget.id,
      'Resolved',
      resolutionNote || 'Exception resolved by operational intervention.'
    );

    setResolveModalTarget(null);
    setResolutionNote('');
    loadData();
  };

  const categories: ExceptionCategory[] = ['Payment', 'Supplier', 'Procurement', 'Logistics', 'Customer', 'Customs'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 39. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ed2025] animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Exception Centre</h1>
          </div>
          <p className="text-sm text-slate-500">
            Dedicated resolution hub for procurement, customs, logistics, and payment exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-200">
            {exceptions.filter((e) => e.status !== 'Resolved' && e.status !== 'Closed').length} Unresolved Exceptions
          </span>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
              selectedCategory === 'All'
                ? 'bg-[#ed2025] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            )}
          >
            All Categories ({exceptions.length})
          </button>
          {categories.map((cat) => {
            const count = exceptions.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
                  selectedCategory === cat
                    ? 'bg-[#ed2025] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                )}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Workflow Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Detected">Detected</option>
              <option value="Assigned">Assigned</option>
              <option value="Investigating">Investigating</option>
              <option value="Action Required">Action Required</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 40. EXCEPTION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExceptions.map((exc) => {
          const isCritical = exc.severity === 'Critical';
          const isHigh = exc.severity === 'High';
          const isResolved = exc.status === 'Resolved' || exc.status === 'Closed';

          return (
            <div
              key={exc.id}
              className={cn(
                'p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-4',
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : isCritical
                  ? 'bg-red-50/40 border-red-300 ring-1 ring-red-400/20'
                  : isHigh
                  ? 'bg-amber-50/30 border-amber-300'
                  : 'bg-white border-slate-200'
              )}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#ed2025]">{exc.code}</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {exc.category}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase px-2 py-0.5 rounded',
                      isCritical
                        ? 'bg-red-100 text-red-700'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {exc.severity} Severity
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-black text-slate-900">{exc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{exc.description}</p>
                </div>

                {/* Related Entity Details */}
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Related Request:</span>
                    <Link
                      href={`/operations/requests/${exc.requestNumber}`}
                      className="font-bold text-[#2B4499] hover:underline"
                    >
                      {exc.requestNumber}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer:</span>
                    <span className="font-semibold text-slate-800">{exc.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle / Part:</span>
                    <span className="text-slate-700">{exc.vehicleSummary} · {exc.partSummary}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Owner:</span>
                    <span className="font-bold text-[#2B4499]">{exc.owner}</span>
                  </div>
                </div>

                {/* Resolution Note if resolved */}
                {exc.resolutionNote && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                    <strong>Resolution:</strong> {exc.resolutionNote}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <Link
                  href={`/operations/requests/${exc.requestNumber}`}
                  className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
                >
                  <span>Open Request Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {!isResolved ? (
                  <button
                    onClick={() => setResolveModalTarget(exc)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Resolve Exception
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Exception Modal */}
      {resolveModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setResolveModalTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-slide-up text-xs">
            <h3 className="text-sm font-black text-slate-900">
              Resolve Exception {resolveModalTarget.code}
            </h3>
            <p className="text-slate-500">
              {resolveModalTarget.title} ({resolveModalTarget.requestNumber})
            </p>

            <form onSubmit={handleResolveException} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Resolution Summary Note *</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Rebooked oversize crate onto Cathay Pacific Flight CX082 arriving Auckland Saturday..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Confirm & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
