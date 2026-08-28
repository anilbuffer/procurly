'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  User,
  Zap,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinancialException, FinancialExceptionStage, FinancialExceptionType } from '@/types/finance';

export default function FinancialExceptionsPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setExceptions(financeService.getExceptions());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const stages: ('All' | FinancialExceptionStage)[] = [
    'All',
    'Detect',
    'Review',
    'Assign',
    'Investigate',
    'Take Action',
    'Resolve',
    'Close',
  ];

  const filteredExceptions = exceptions.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || e.stage === stageFilter;
    const matchesType = typeFilter === 'All' || e.type === typeFilter;
    return matchesSearch && matchesStage && matchesType;
  });

  const criticalCount = exceptions.filter((e) => e.severity === 'Critical' && e.status !== 'Closed').length;
  const inProgressCount = exceptions.filter((e) => e.status === 'In Progress').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'Resolved' || e.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Financial Exceptions Command</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured 7-stage resolution workspace for payment declines, duplicate settlements, credit breaches, and gateway anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{criticalCount} Critical Exceptions Open</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Interactive Pipeline Header */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Exception Resolution Lifecycle
          </span>
          <span className="text-xs text-slate-400">
            Active: <strong>{exceptions.filter((e) => e.status !== 'Closed').length} cases</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.slice(1).map((st, idx) => {
            const countInStage = exceptions.filter((e) => e.stage === st).length;
            const isSelected = stageFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStageFilter(isSelected ? 'All' : st)}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'bg-[#ed2025] border-[#ed2025] text-white shadow-sm'
                    : countInStage > 0
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-800'
                )}
              >
                <span className="text-[10px] font-bold block opacity-75">
                  {idx + 1}. {st}
                </span>
                <span className="text-sm font-black">{countInStage}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exceptions (EXC-FIN-0041), Request, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Exception Types</option>
            <option value="Payment Failed">Payment Failed</option>
            <option value="Credit Limit Exceeded">Credit Limit Exceeded</option>
            <option value="Payment Mismatch">Payment Mismatch</option>
            <option value="Duplicate Payment">Duplicate Payment</option>
            <option value="Payment Reversed">Payment Reversed</option>
          </select>
        </div>
      </div>

      {/* Exceptions Grid / Cards */}
      <div className="space-y-3">
        {filteredExceptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No active exceptions in this filter</h3>
            <p className="text-xs text-slate-400">All financial anomalies have been audited and resolved.</p>
          </div>
        ) : (
          filteredExceptions.map((exc) => (
            <div
              key={exc.id}
              className={cn(
                'bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4',
                exc.severity === 'Critical'
                  ? 'border-red-200 hover:border-red-300'
                  : 'border-slate-200/80 hover:border-slate-300'
              )}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-900">{exc.id}</span>
                  <span
                    className={cn(
                      'text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md',
                      exc.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : exc.severity === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {exc.severity} Severity
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {exc.type}
                  </span>
                  <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Stage: {exc.stage}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{exc.summary}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Customer: <strong className="text-slate-700">{exc.customerName}</strong></span>
                  <span>•</span>
                  <span>Amount at Risk: <strong className="text-red-600 font-mono font-bold">NZ${exc.amountAtRisk.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Assigned to: <strong>{exc.assignedOfficer}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/finance/exceptions/${exc.id}`}
                  className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
                >
                  <span>Investigate & Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
