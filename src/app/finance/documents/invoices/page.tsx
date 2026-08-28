'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceDocument } from '@/types/finance';

export default function InvoicesManagerPage() {
  const [invoices, setInvoices] = useState<FinanceDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const all = financeService.getDocuments().filter((d) => d.category === 'Invoice');
    setInvoices(all);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filtered = invoices.filter(
    (i) =>
      i.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Tax Invoices Manager</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official GST Tax Invoices generated for commercial customers.
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
            placeholder="Search by Invoice #, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Request #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
              <th className="py-3.5 px-4">Issue Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.documentNumber}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{inv.requestNumber}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">{inv.customerName}</td>
                <td className="py-3.5 px-4 text-right font-black text-slate-900">NZ${inv.amount.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-slate-500">{inv.issueDate}</td>
                <td className="py-3.5 px-4 text-slate-500">{inv.dueDate || 'Upon Receipt'}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => alert(`Downloading Tax Invoice ${inv.documentNumber}.pdf`)}
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
