'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Receipt,
  Search,
  Download,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceDocument } from '@/types/finance';

export default function ReceiptsManagerPage() {
  const [receipts, setReceipts] = useState<FinanceDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const all = financeService.getDocuments().filter((d) => d.category === 'Payment Receipt');
    setReceipts(all);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filtered = receipts.filter(
    (r) =>
      r.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/documents"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Payment Receipts Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official payment confirmation receipts issued to customers upon settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Receipt #, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Receipt #</th>
              <th className="py-3.5 px-4">Payment #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{rec.documentNumber}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{rec.paymentNumber || 'PAY-00123'}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">{rec.customerName}</td>
                <td className="py-3.5 px-4 text-right font-black text-slate-900">NZ${rec.amount.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-slate-500">{rec.issueDate}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {rec.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => alert(`Downloading Receipt ${rec.documentNumber}.pdf`)}
                    className="px-3 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-lg transition-all shadow-sm active:scale-[0.98] inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
