'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  Download,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function FinancialReportsHubPage() {
  const reportCategories = [
    {
      title: 'Revenue Intelligence',
      description: 'Daily, weekly, and monthly revenue performance, average order values, and customer lifetime breakdown.',
      href: '/finance/reports/revenue',
      icon: TrendingUp,
      badge: 'Core Performance',
      color: 'emerald',
      subReports: ['Daily Revenue Velocity', 'Monthly Gross Settled', 'Revenue by Customer Segment', 'Procurement Margins'],
    },
    {
      title: 'Outstanding & Collections Aging',
      description: 'Aging analysis across Current (0-7d), 8-30d, and 30+ overdue buckets with automated reminder histories.',
      href: '/finance/reports/outstanding',
      icon: Clock,
      badge: 'Risk & Liquidity',
      color: 'amber',
      subReports: ['Receivables Aging Ledger', 'Overdue Risk Exposure', 'Customer Payment Delay Analysis', 'Collection Recovery Rate'],
    },
    {
      title: 'Transaction Ledgers & Reconciliations',
      description: 'Complete audit-ready financial transaction ledger covering bank wire settlements, A2A transfers, and refunds.',
      href: '/finance/reports/transactions',
      icon: BarChart3,
      badge: 'Ledger Audit',
      color: 'indigo',
      subReports: ['Bank Wire Settlement Batches', 'Direct Bank Feed Audit', 'Rebate & Refund Adjustments', 'Trade Account Reconciliations'],
    },
    {
      title: 'Trade Credit Facility Utilization',
      description: 'Customer credit limits, exposure headroom, risk classifications, and 20th-of-month settlement forecasts.',
      href: '/finance/credit-accounts',
      icon: Wallet,
      badge: 'Commercial Risk',
      color: 'purple',
      subReports: ['Credit Exposure Utilization', 'Near-Limit Warning Queue', 'Credit Hold Risk Matrix', 'Annual Terms Review Schedule'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Financial Reports & Treasury Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive revenue analytics, credit risk distribution, cashflow reconciliations, and IRD tax compliance exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Generating full financial suite report pack (Excel & CSV)...')}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Suite (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Grid of Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((cat, idx) => {
          const Icon = cat.icon;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{cat.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Included Sub-Reports:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 font-medium">
                    {cat.subReports.map((sub, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={cat.href}
                  className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
                >
                  <span>Launch Report View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
