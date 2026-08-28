'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Download,
  Filter,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceCustomerQuote } from '@/types/finance';

export default function FinanceCustomerQuotesPage() {
  const [quotes, setQuotes] = useState<FinanceCustomerQuote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadData = () => {
    setQuotes(financeService.getCustomerQuotes());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.partsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Customer Quotations (Finance View)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify financial margins, freight line-items, and payment terms before releasing procurement purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span>Supplier margins & wholesale rates masked per Finance role security policy.</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Approved by Customer', 'Sent', 'Draft', 'Expired'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              statusFilter === status
                ? 'bg-[#ed2025] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {status === 'All' ? 'All Quotes' : status}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Quote #, Request #, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Quote #</th>
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Customer & Vehicle</th>
                <th className="py-3.5 px-4 text-right">Parts (NZD)</th>
                <th className="py-3.5 px-4 text-right">Freight</th>
                <th className="py-3.5 px-4 text-right">Total (incl. GST)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No quotes found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link href={`/finance/customer-quotes/${q.id}`} className="hover:text-emerald-700 hover:underline">
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{q.requestNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{q.customerName}</span>
                      <span className="text-[11px] text-slate-400 truncate block max-w-xs">{q.partsSummary}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                      NZ${q.partsSubtotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                      NZ${q.freightCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      NZ${q.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                          q.status === 'Approved by Customer' && 'bg-emerald-100 text-emerald-800',
                          q.status === 'Sent' && 'bg-blue-100 text-blue-800',
                          q.status === 'Draft' && 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[10px] font-extrabold',
                          (q.paymentStatus === 'Paid' || q.paymentStatus === 'Credit Approved') && 'bg-emerald-100 text-emerald-800',
                          q.paymentStatus === 'Awaiting Payment' && 'bg-amber-100 text-amber-800',
                          q.paymentStatus === 'Pending' && 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {q.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{q.validUntil}</td>
                    <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/finance/customer-quotes/${q.id}`}
                          className="px-3 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98] inline-block"
                        >
                          Financial Review
                        </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
