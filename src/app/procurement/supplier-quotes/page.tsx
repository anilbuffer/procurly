'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Plus,
  CheckCircle,
  XCircle,
  HelpCircle,
  DollarSign,
  Clock,
  Building2,
  GitCompare,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { SupplierQuoteItem, SupplierQuoteStatus } from '@/types/procurement';
import { AddQuoteModal } from '@/components/procurement/modals/AddQuoteModal';

export default function SupplierQuotesPage() {
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addQuoteOpen, setAddQuoteOpen] = useState(false);

  const loadData = () => {
    setQuotes(procurementService.getSupplierQuotes());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const statuses: Array<SupplierQuoteStatus | 'All'> = [
    'All',
    'Received',
    'Under Review',
    'Accepted',
    'Rejected',
    'Clarification Requested',
  ];

  const filteredQuotes = quotes.filter((q) => {
    if (selectedStatus !== 'All' && q.status !== selectedStatus) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return (
        q.quoteNumber.toLowerCase().includes(s) ||
        q.requestRef.toLowerCase().includes(s) ||
        q.supplierName.toLowerCase().includes(s) ||
        q.partName.toLowerCase().includes(s) ||
        (q.partNumber && q.partNumber.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const handleQuickStatus = (quoteId: string, status: SupplierQuoteStatus) => {
    procurementService.updateQuoteStatus(quoteId, status);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supplier Quotations Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filteredQuotes.length} Quotes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Internal quotation review, cost verification, availability checking, and supplier selection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/quote-comparison"
            className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Side-by-Side Comparison
          </Link>
          <button
            onClick={() => setAddQuoteOpen(true)}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Supplier Quote
          </button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {statuses.map((st) => {
          const count = st === 'All' ? quotes.length : quotes.filter((q) => q.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedStatus === st
                  ? 'bg-[#ed2025] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>{st}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  selectedStatus === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote #, request ref, supplier, part number..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Supplier Quotes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Part Offered</th>
                <th className="py-3 px-3 text-right">Supplier Cost (NZD)</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-3">Lead Time</th>
                <th className="py-3 px-3">Valid Until</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No supplier quotes found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                      <Link href={`/procurement/supplier-quotes/${q.id}`} className="hover:underline">
                        {q.quoteNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      <Link href={`/procurement/requests/${q.requestId}`} className="hover:text-brand-blue">
                        {q.requestRef}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {q.supplierName}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{q.partName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {q.partNumber || 'OEM Spec'} • {q.condition}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 text-right font-extrabold text-emerald-700 text-sm">
                      ${q.totalCostNZD.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {q.availability}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {q.leadTimeDisplay}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {q.validUntil}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                          q.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : q.status === 'Rejected'
                            ? 'bg-red-50 text-brand-red border-red-200'
                            : q.status === 'Clarification Requested'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-brand-blue border-blue-200'
                        )}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickStatus(q.id, 'Accepted')}
                          title="Accept Quote"
                          className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickStatus(q.id, 'Clarification Requested')}
                          title="Request Clarification"
                          className="p-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/procurement/supplier-quotes/${q.id}`}
                          className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="View Full Breakdown"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddQuoteModal
        isOpen={addQuoteOpen}
        onClose={() => setAddQuoteOpen(false)}
      />
    </div>
  );
}
