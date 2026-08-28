'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  ArrowLeftRight,
  CheckCircle2,
  FileSpreadsheet,
  DollarSign,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceTransaction } from '@/types/finance';

export default function TransactionsReportPage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setTransactions(financeService.getTransactions());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === 'All' || t.type === typeFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Txn ID,Reference,Customer,Type,Amount NZD,Fee,Net Amount,Method,Status,Channel,Timestamp']
        .concat(
          filtered.map(
            (t) =>
              `${t.id},${t.reference},"${t.customerName}",${t.type},${t.amount},${t.fee},${t.netAmount},${t.method},${t.status},${t.channel},${t.timestamp}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transaction_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Transaction Reports & Ledger Export</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered commercial transaction outputs for accounting software reconciliation and auditor compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert('Generating Excel formatted workbook with Pivot formulas...')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Customer, Reference..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Payment">Payment</option>
            <option value="Refund">Refund</option>
            <option value="Credit">Credit</option>
            <option value="Adjustment">Adjustment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Reconciled">Reconciled</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Txn ID</th>
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{t.reference}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">{t.customerName}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                    {t.type}
                  </span>
                </td>
                <td
                  className={cn(
                    'py-3.5 px-4 text-right font-black',
                    t.amount < 0 ? 'text-purple-700' : 'text-slate-900'
                  )}
                >
                  NZ${t.amount.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{t.method}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      t.status === 'Reconciled' && 'bg-emerald-100 text-emerald-800',
                      t.status === 'Completed' && 'bg-blue-100 text-blue-800',
                      t.status === 'Pending' && 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
