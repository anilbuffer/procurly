'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  ArrowLeft,
  Building2,
  Car,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Edit,
  Download,
  MessageSquare,
  Truck,
  GitCompare,
  ShoppingCart,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { SupplierQuoteItem, ProcurementRequest, SupplierSummary } from '@/types/procurement';

export default function SupplierQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.quoteId as string;

  const [quote, setQuote] = useState<SupplierQuoteItem | null>(null);
  const [request, setRequest] = useState<ProcurementRequest | null>(null);
  const [supplier, setSupplier] = useState<SupplierSummary | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [actionDone, setActionDone] = useState(false);

  const loadData = () => {
    const q = procurementService.getQuoteById(quoteId);
    if (q) {
      setQuote(q);
      const r = procurementService.getRequestById(q.requestId);
      if (r) setRequest(r);
      const s = procurementService.getSupplierById(q.supplierId);
      if (s) setSupplier(s);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [quoteId]);

  if (!quote) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-base font-bold text-slate-800">Quote Not Found</h2>
        <Link href="/procurement/supplier-quotes" className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg inline-block mt-4">
          Back to Supplier Quotes
        </Link>
      </div>
    );
  }

  const handleDecision = (status: 'Accepted' | 'Rejected' | 'Clarification Requested') => {
    if (status === 'Accepted') {
      procurementService.selectPreferredSupplier(quote.requestId, quote.id);
    } else {
      procurementService.updateQuoteStatus(quote.id, status, decisionNote);
    }
    setActionDone(true);
    setTimeout(() => {
      setActionDone(false);
      if (status === 'Accepted') {
        router.push(`/procurement/quote-comparison?requestId=${quote.requestId}`);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/procurement/supplier-quotes"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {quote.quoteNumber}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  quote.status === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : quote.status === 'Rejected'
                    ? 'bg-red-50 text-brand-red border-red-200'
                    : 'bg-blue-50 text-brand-blue border-blue-200'
                )}
              >
                {quote.status}
              </span>
              <span className="text-xs text-slate-400">
                • Valid until: <strong className="text-slate-700">{quote.validUntil}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {quote.partName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/procurement/quote-comparison?requestId=${quote.requestId}`}
            className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare Side-by-Side
          </Link>
          <button
            onClick={() => handleDecision('Accepted')}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Accept & Lock Quote
          </button>
        </div>
      </div>

      {/* 2. Grid Sections: Supplier Info & Vehicle/Part */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-blue" />
            Supplier Information
          </h2>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">{quote.supplierName}</span>
              <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                {quote.supplierCode}
              </span>
            </div>
            {supplier && (
              <>
                <p className="text-slate-600">Location: {supplier.location}, {supplier.country}</p>
                <p className="text-slate-600">Contact: {supplier.contactName} ({supplier.contactEmail})</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span>Response Rate: <strong className="text-emerald-700">{supplier.responseRatePct}%</strong></span>
                  <span>Avg Lead: <strong className="text-slate-800">{supplier.avgLeadTimeDays} Days</strong></span>
                  <span>Reliability Score: <strong className="text-brand-blue">{supplier.reliabilityScore}/100</strong></span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vehicle & Part Requirement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-600" />
            Vehicle & Part Fitment
          </h2>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            {request ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                  </span>
                  <span className="text-brand-blue font-mono font-bold">{request.requestNumber}</span>
                </div>
                <p className="font-mono text-slate-600">VIN: {request.vehicle.vin}</p>
                <p className="text-slate-700 font-medium">Part: {quote.partName}</p>
                <p className="text-slate-600">
                  OEM Part #: <strong className="font-mono text-slate-900">{quote.partNumber || 'Direct'}</strong>
                </p>
              </>
            ) : (
              <p className="text-slate-500">{quote.partName}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Cost Breakdown & Availability Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Quotation Pricing, Freight & Landed Breakdown (NZD)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Unit Cost</span>
            <span className="text-lg font-black text-slate-900">${quote.unitCostNZD.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">x {quote.quantity} unit(s)</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Supplier Freight</span>
            <span className="text-lg font-black text-slate-900">${quote.freightCostNZD.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">To NZ Logistics Hub</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Handling & Pack</span>
            <span className="text-lg font-black text-slate-900">${quote.handlingCostNZD.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">Export inspection pack</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-brand-blue uppercase font-extrabold block">Total Quoted Cost</span>
            <span className="text-xl font-black text-emerald-700">${quote.totalCostNZD.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Landed at Hub</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Stock Availability</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{quote.availability}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Lead Time to Hub</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{quote.leadTimeDisplay}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Warranty Provided</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{quote.warrantyMonths} Months</span>
          </div>
        </div>
      </div>

      {/* 4. Terms, Notes & Decision Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notes & Terms (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Supplier Terms & Attachments
          </h2>
          <div className="space-y-2 text-xs">
            <p className="text-slate-600">
              Payment Terms: <strong className="text-slate-900">{quote.paymentTerms}</strong>
            </p>
            {quote.notes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold">Supplier Inclusions & Notes: </span>
                <span>{quote.notes}</span>
              </div>
            )}
          </div>

          {quote.attachments && quote.attachments.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700">Attachments ({quote.attachments.length}):</span>
              {quote.attachments.map((att, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{att.name} ({att.size})</span>
                  <button className="text-brand-blue font-bold hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote Decision Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quote Decision & Next Actions
          </h2>

          <div className="space-y-3">
            <textarea
              rows={2}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Add internal clarification note or reason for decision..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleDecision('Accepted')}
                className="btn-red-polished text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Accept Quote
              </button>

              <button
                onClick={() => handleDecision('Clarification Requested')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Request Clarification
              </button>

              <button
                onClick={() => handleDecision('Rejected')}
                className="bg-red-50 hover:bg-red-100 text-brand-red border border-red-200 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors sm:col-span-2"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
