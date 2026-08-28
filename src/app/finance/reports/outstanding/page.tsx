'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  Building2,
  DollarSign,
  Send,
} from 'lucide-react';

export default function OutstandingPaymentsReportPage() {
  const agingBuckets = [
    { bucket: 'Current (0–7 Days)', amount: 3120, count: 2, status: 'Healthy', color: 'emerald' },
    { bucket: '8–30 Days (Follow-up)', amount: 1680, count: 1, status: 'Watchlist', color: 'amber' },
    { bucket: '30+ Days (Overdue)', amount: 2450, count: 1, status: 'Critical', color: 'red' },
  ];

  const outstandingCustomers = [
    {
      name: 'West Auto',
      nzbn: '9429037748190',
      totalDue: 2450,
      aging: '30+ Days',
      dueDate: '25 Aug 2026',
      contact: 'Darren Price (+64 9 834 7711)',
    },
    {
      name: 'Central Motors',
      nzbn: '9429041192834',
      totalDue: 1820,
      aging: 'Current',
      dueDate: '28 Aug 2026',
      contact: 'Jason Wright (+64 7 855 4321)',
    },
    {
      name: 'North Shore Auto Group',
      nzbn: '9429039918234',
      totalDue: 1680,
      aging: '8–30 Days',
      dueDate: '18 Aug 2026',
      contact: 'Brendan Kelly (+64 9 489 9000)',
    },
    {
      name: 'Penrose Commercial Mechanics',
      nzbn: '9429035519283',
      totalDue: 1300,
      aging: 'Current',
      dueDate: '30 Aug 2026',
      contact: 'Graeme Collins (+64 9 579 1100)',
    },
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
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Outstanding Payments Aging Analysis</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Receivables aging distribution, overdue delinquency risk, and customer collections recovery tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Outstanding Aging Schedule...')}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Aging Report</span>
          </button>
        </div>
      </div>

      {/* Aging Buckets Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {agingBuckets.map((b, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">{b.bucket}</span>
            <p className="text-2xl font-black text-slate-900">NZ${b.amount.toLocaleString()}</p>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>{b.count} orders outstanding</span>
              <span className={`font-bold text-${b.color}-600`}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Receivables Schedule by Customer</h3>
            <p className="text-xs text-slate-500">Aging classifications and contact details.</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">NZBN</th>
              <th className="py-3 px-4 text-right">Amount Due</th>
              <th className="py-3 px-4">Aging Bucket</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Accounts Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {outstandingCustomers.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{c.nzbn}</td>
                <td className="py-3.5 px-4 text-right font-black text-slate-900">NZ${c.totalDue.toFixed(2)}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.aging.includes('30+')
                        ? 'bg-red-100 text-red-800'
                        : c.aging.includes('8–30')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {c.aging}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-medium">{c.dueDate}</td>
                <td className="py-3.5 px-4 text-slate-600">{c.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
