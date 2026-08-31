'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FolderOpen,
  FileText,
  Receipt,
  Download,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceDocument } from '@/types/finance';

export default function FinancialDocumentsPage() {
  const [docs, setDocs] = useState<FinanceDocument[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setDocs(financeService.getDocuments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredDocs = docs.filter((d) => {
    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.requestNumber && d.requestNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Financial Documents Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository for Tax Invoices, Payment Confirmation Receipts, Credit Agreements, and IRD GST Statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/finance/documents/invoices"
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            Invoices Manager →
          </Link>
          <Link
            href="/finance/documents/receipts"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition-all shadow-xs active:scale-[0.98]"
          >
            Receipts Manager →
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Invoice', 'Payment Receipt', 'Refund Note', 'Credit Statement', 'Tax Certificate'] as const).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                categoryFilter === cat
                  ? 'bg-[#ed2025] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              )}
            >
              {cat === 'All' ? 'All Document Types' : cat}
            </button>
          )
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Document #, Title, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">{doc.documentNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {doc.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>

              <div className="text-xs text-slate-500 space-y-0.5">
                <p>Customer: <strong>{doc.customerName}</strong></p>
                <p>Issued: {doc.issueDate} • Format: {doc.fileFormat} ({doc.fileSize})</p>
                {doc.amount > 0 && (
                  <p className="font-bold text-slate-900 pt-1">NZ${doc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700">{doc.status}</span>
              <button
                onClick={() => alert(`Downloading document: ${doc.title} (${doc.fileFormat})`)}
                className="px-3 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
