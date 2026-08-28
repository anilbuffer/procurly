'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  FileText,
  DollarSign,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceCustomerQuote } from '@/types/finance';
import { INITIAL_CUSTOMER_QUOTES_FINANCE } from '@/services/finance/mockData';

export default function CustomerQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'QUO-2026-0123';

  const resolveQuote = (id: string): FinanceCustomerQuote => {
    const quotes = financeService.getCustomerQuotes();
    return (
      quotes.find((item) => item.id.toLowerCase() === id.toLowerCase() || item.quoteNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_CUSTOMER_QUOTES_FINANCE.find((item) => item.id.toLowerCase() === id.toLowerCase() || item.quoteNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_CUSTOMER_QUOTES_FINANCE[0]
    );
  };

  const initialQuote = resolveQuote(rawId);
  const [quote, setQuote] = useState<FinanceCustomerQuote>(initialQuote);

  const loadData = () => {
    const q = resolveQuote(rawId);
    setQuote(q);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/customer-quotes"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight">{quote.quoteNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                {quote.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued {quote.quoteDate} • Valid until <strong>{quote.validUntil}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quote.paymentStatus === 'Awaiting Payment' ? (
            <Link
              href="/finance/awaiting-payment"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Follow-up Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/finance/approved-orders"
              className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover flex items-center gap-1.5 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clear Order for Procurement</span>
            </Link>
          )}
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Commercial Quotation Financial Breakdown
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Total Quoted Value</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  NZ${quote.totalAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">15% GST included</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Customer</span>
                <Link
                  href={`/finance/customers/${quote.customerId}`}
                  className="font-bold text-slate-900 hover:text-emerald-700 hover:underline block mt-0.5"
                >
                  {quote.customerName}
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">Req: {quote.requestNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Payment Status</span>
                <span className="font-extrabold text-emerald-700 block mt-0.5">{quote.paymentStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Procurement Ready</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {quote.financialClearanceReady ? 'Yes (Verified)' : 'Pending Settlement'}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parts Subtotal:</span>
                <span className="font-semibold text-slate-900">NZ${quote.partsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Air/Sea Freight Handling:</span>
                <span className="font-semibold text-slate-900">NZ${quote.freightCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customs & Import Duties:</span>
                <span className="font-semibold text-slate-900">NZ${quote.customsDuty.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Commercial Margin:</span>
                <span className="font-semibold text-slate-900">NZ${quote.marginAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>NZ GST (15.0%):</span>
                <span className="font-semibold text-slate-900">NZ${quote.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Quoted Amount:</span>
                <span className="text-emerald-700">NZ${quote.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Vehicle & Policy */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Vehicle Association
            </h3>
            <p className="font-bold text-slate-900">{quote.vehicleSummary}</p>
            <p className="text-slate-600">{quote.partsSummary}</p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <p className="font-bold">Financial Clearance Gate</p>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Procurement specialists cannot issue purchase orders to international suppliers until Finance confirms either settled funds or active trade credit clearance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
