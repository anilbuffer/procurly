'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { SupplierSummary } from '@/types/procurement';

export default function SupplierPerformancePage() {
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'response' | 'lead' | 'completion'>('score');

  const loadData = () => {
    setSuppliers(procurementService.getSuppliers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (sortBy === 'score') return b.reliabilityScore - a.reliabilityScore;
    if (sortBy === 'response') return b.responseRatePct - a.responseRatePct;
    if (sortBy === 'lead') return a.avgLeadTimeDays - b.avgLeadTimeDays;
    if (sortBy === 'completion') return b.orderCompletionPct - a.orderCompletionPct;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supplier Performance & Intelligence Scorecards
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Operational Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven vendor evaluation for contract allocations, preferred RFQ routing, and lead-time guarantees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/suppliers"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            Supplier Directory →
          </Link>
        </div>
      </div>

      {/* 2. Top Intelligence Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Avg Network Response Time
            </span>
            <Clock className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-black text-slate-900">2.8 Hours</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            -40 min improvement this quarter
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Network Fulfillment Rate
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">97.6%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Zero-defect fitment guarantee
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Avg Transit Lead Time
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">3.2 Days</p>
          <p className="text-[11px] text-brand-blue font-semibold mt-1">
            Direct air corridor to AKL
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Dispute / RMA Rate
            </span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-800">1.8%</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Within strict 2% quality SLA
          </p>
        </div>
      </div>

      {/* 3. Ranking & Scorecard Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Supplier Ranking & Operational Intelligence Matrix
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Sort Matrix By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-none"
            >
              <option value="score">Reliability Score (High → Low)</option>
              <option value="response">Response Rate (%)</option>
              <option value="lead">Fastest Lead Time</option>
              <option value="completion">Order Completion (%)</option>
            </select>
          </div>
        </div>

        {/* Scorecard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Supplier & Region</th>
                <th className="py-3 px-4">Core Specialization</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3 text-center">Response Time</th>
                <th className="py-3 px-3 text-center">Quote Conv %</th>
                <th className="py-3 px-3 text-center">Delivery Reliability</th>
                <th className="py-3 px-3 text-center">Exception Rate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedSuppliers.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Rank */}
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400/50'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  {/* Supplier */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/procurement/suppliers/${s.id}`}
                      className="font-bold text-slate-900 hover:text-brand-blue block text-xs"
                    >
                      {s.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {s.location}, {s.country} • Code: {s.code}
                    </span>
                  </td>

                  {/* Specialization */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {s.specialization.slice(0, 2).map((sp, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-sm font-black text-brand-blue">
                      {s.reliabilityScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 100</span>
                  </td>

                  {/* Response Time */}
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                    {s.avgResponseTimeHours} hrs
                  </td>

                  {/* Quote Conversion */}
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                    {s.responseRatePct}%
                  </td>

                  {/* Delivery Reliability */}
                  <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                    {s.orderCompletionPct}%
                  </td>

                  {/* Exception Rate */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full',
                        s.exceptionRatePct < 2
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      )}
                    >
                      {s.exceptionRatePct}%
                    </span>
                  </td>

                  {/* Profile */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/procurement/suppliers/${s.id}`}
                      className="text-xs font-bold text-brand-blue hover:underline"
                    >
                      Scorecard →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
