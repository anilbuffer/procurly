'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  Download,
  DollarSign,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export default function RevenueReportPage() {
  const [dateRange, setDateRange] = useState<'Today' | 'This Week' | 'This Month' | 'Previous Month' | 'YTD'>('This Month');

  const customerRevenueData = [
    { name: 'South Island Fleet Services', nzbn: '9429031129984', amount: 98400, orders: 65, pct: 32 },
    { name: 'Tauranga Euro Specialists', nzbn: '9429048891273', amount: 64200, orders: 42, pct: 21 },
    { name: 'AutoCare Auckland', nzbn: '9429038819201', amount: 48520, orders: 38, pct: 16 },
    { name: 'Central Motors', nzbn: '9429041192834', amount: 32100, orders: 24, pct: 11 },
    { name: 'North Shore Auto Group', nzbn: '9429039918234', amount: 28900, orders: 20, pct: 9 },
    { name: 'West Auto', nzbn: '9429037748190', amount: 19800, orders: 15, pct: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/reports"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Revenue Performance Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Settlement trends, gross transaction margins, average order values, and client revenue distribution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Revenue Report CSV...')}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['Today', 'This Week', 'This Month', 'Previous Month', 'YTD'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              dateRange === range
                ? 'bg-[#ed2025] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 5 Revenue KPIs (From Spec) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Today&apos;s Revenue</span>
          <p className="text-xl font-black text-slate-900 mt-1">NZ$12,450</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4%
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">This Month (August)</span>
          <p className="text-xl font-black text-emerald-700 mt-1">NZ$148,600</p>
          <p className="text-[10px] text-slate-400 mt-0.5">118 orders settled</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Previous Month</span>
          <p className="text-xl font-black text-slate-700 mt-1">NZ$132,400</p>
          <p className="text-[10px] text-slate-400 mt-0.5">July 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Revenue YTD</span>
          <p className="text-xl font-black text-indigo-900 mt-1">NZ$892,100</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+24.2% YoY</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Average Order Value</span>
          <p className="text-xl font-black text-slate-900 mt-1">NZ$1,280</p>
          <p className="text-[10px] text-slate-400 mt-0.5">NZ$192 avg margin</p>
        </div>
      </div>

      {/* Customer Revenue Table Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Revenue by Customer Account</h3>
            <p className="text-xs text-slate-500">Cumulative commercial settlement share.</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">NZBN</th>
              <th className="py-3 px-4 text-center">Orders</th>
              <th className="py-3 px-4 text-right">Settled Revenue (NZD)</th>
              <th className="py-3 px-4">Share of Gross Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customerRevenueData.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{c.nzbn}</td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-700">{c.orders}</td>
                <td className="py-3.5 px-4 text-right font-black text-slate-900">
                  NZ${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4">
                  <div className="w-36 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>{c.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.pct * 2.5}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
