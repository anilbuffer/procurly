'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  GitCompare,
  CheckCircle,
  Zap,
  Building2,
  DollarSign,
  Clock,
  Truck,
  ShieldCheck,
  Award,
  ChevronDown,
  ArrowRight,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, SupplierQuoteItem, SupplierSummary } from '@/types/procurement';
import { AddQuoteModal } from '@/components/procurement/modals/AddQuoteModal';

function QuoteComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRequestId = searchParams.get('requestId') || '';

  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [addQuoteOpen, setAddQuoteOpen] = useState(false);
  const [selectionLocked, setSelectionLocked] = useState(false);

  const loadData = () => {
    const reqs = procurementService.getRequests();
    const sups = procurementService.getSuppliers();
    setRequests(reqs);
    setSuppliers(sups);

    const targetReqId = initialRequestId || (reqs.length > 0 ? reqs[0].id : '');
    setSelectedRequestId(targetReqId);

    if (targetReqId) {
      const qList = procurementService.getQuotesByRequestId(targetReqId);
      setQuotes(qList);
      const pref = qList.find((q) => q.isPreferred || q.status === 'Accepted');
      if (pref) setSelectedQuoteId(pref.id);
      else if (qList.length > 0) setSelectedQuoteId(qList[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [initialRequestId]);

  const handleRequestChange = (reqId: string) => {
    setSelectedRequestId(reqId);
    const qList = procurementService.getQuotesByRequestId(reqId);
    setQuotes(qList);
    const pref = qList.find((q) => q.isPreferred || q.status === 'Accepted');
    if (pref) setSelectedQuoteId(pref.id);
    else if (qList.length > 0) setSelectedQuoteId(qList[0].id);
    else setSelectedQuoteId('');
  };

  const handleSelectSupplier = (quoteId: string) => {
    procurementService.selectPreferredSupplier(selectedRequestId, quoteId);
    setSelectedQuoteId(quoteId);
    setSelectionLocked(true);
    setTimeout(() => {
      setSelectionLocked(false);
    }, 2000);
  };

  const currentReq = requests.find((r) => r.id === selectedRequestId);

  // Find lowest cost & fastest lead time
  const minCost = quotes.length > 0 ? Math.min(...quotes.map((q) => q.totalCostNZD)) : 0;
  const minLead = quotes.length > 0 ? Math.min(...quotes.map((q) => q.leadTimeDays)) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Multi-Supplier Quotation Comparison Matrix
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
              Side-by-Side Sourcing Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare unit costs, international freight, lead time, stock availability, and supplier reliability score
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddQuoteOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier Option
          </button>
          {currentReq && (
            <Link
              href={`/procurement/purchase-orders?action=new&requestId=${currentReq.id}&quoteId=${selectedQuoteId}`}
              className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Generate PO with Selected
            </Link>
          )}
        </div>
      </div>

      {/* 2. Request Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap uppercase tracking-wider">
            Select Request:
          </span>
          <select
            value={selectedRequestId}
            onChange={(e) => handleRequestChange(e.target.value)}
            className="w-full sm:w-96 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          >
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.requestNumber} — {r.part.name} ({r.customerName} • {r.vehicle.make} {r.vehicle.model})
              </option>
            ))}
          </select>
        </div>

        {currentReq && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              Quantity: <strong className="text-slate-900">{currentReq.part.quantity} unit(s)</strong>
            </span>
            <span className="text-slate-500">
              Pref: <strong className="text-emerald-700">{currentReq.part.qualityPreference}</strong>
            </span>
            <span className="text-slate-500">
              Quotes: <strong className="text-brand-blue">{quotes.length} Options</strong>
            </span>
          </div>
        )}
      </div>

      {/* Selection Confirmation Banner */}
      {selectionLocked && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Preferred Supplier Successfully Selected & Locked!</p>
              <p className="text-emerald-700">
                The procurement request status has transitioned to &ldquo;Quote Ready&rdquo; and is ready for customer sign-off / PO generation.
              </p>
            </div>
          </div>
          <Link
            href={`/procurement/purchase-orders?action=new&requestId=${selectedRequestId}&quoteId=${selectedQuoteId}`}
            className="btn-red-polished text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs shrink-0"
          >
            Proceed to PO →
          </Link>
        </div>
      )}

      {/* 3. Comparison Matrix Table / Cards */}
      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-3">
          <GitCompare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Supplier Quotes for this Request</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click below to record received quotes from suppliers in Japan, Germany, or Australia.
          </p>
          <button
            onClick={() => setAddQuoteOpen(true)}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier Quotation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Comparative Analysis Matrix ({quotes.length} Suppliers)
            </h3>
            <span className="text-[11px] text-slate-400">
              Highlighted in green: Best values in class
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70">
                  <th className="py-3 px-4 text-slate-600 font-bold uppercase text-[10px] tracking-wider w-48">
                    Metric / Feature
                  </th>
                  {quotes.map((q, idx) => {
                    const isBestPrice = q.totalCostNZD === minCost;
                    const isFastest = q.leadTimeDays === minLead;
                    const isSelected = q.id === selectedQuoteId || q.isPreferred;

                    return (
                      <th
                        key={q.id}
                        className={cn(
                          'py-3.5 px-5 font-bold text-slate-900 border-l border-slate-200 min-w-[220px]',
                          isSelected ? 'bg-blue-50/80 border-b-2 border-b-brand-blue' : ''
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-slate-500 font-mono">
                            Option {String.fromCharCode(65 + idx)} ({q.quoteNumber})
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-brand-blue text-white shadow-xs">
                              Selected Preferred
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-slate-950 truncate">
                          {q.supplierName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {isBestPrice && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                              <Award className="w-3 h-3" /> Best Price
                            </span>
                          )}
                          {isFastest && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 flex items-center gap-0.5">
                              <Zap className="w-3 h-3" /> Fastest
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {/* Row 1: Part Cost */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Part Unit Cost</td>
                  {quotes.map((q) => (
                    <td key={q.id} className="py-3 px-5 border-l border-slate-200 font-mono font-bold text-slate-900">
                      ${q.unitCostNZD.toFixed(2)} NZD
                    </td>
                  ))}
                </tr>

                {/* Row 2: Freight Cost */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Supplier Freight</td>
                  {quotes.map((q) => (
                    <td key={q.id} className="py-3 px-5 border-l border-slate-200 font-mono font-medium text-slate-800">
                      ${q.freightCostNZD.toFixed(2)} NZD
                    </td>
                  ))}
                </tr>

                {/* Row 3: Handling & Packaging */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Handling & Pack</td>
                  {quotes.map((q) => (
                    <td key={q.id} className="py-3 px-5 border-l border-slate-200 font-mono text-slate-600">
                      ${q.handlingCostNZD.toFixed(2)} NZD
                    </td>
                  ))}
                </tr>

                {/* Row 4: Total Landed Cost */}
                <tr className="bg-slate-50/80 font-black">
                  <td className="py-3.5 px-4 text-slate-900 uppercase text-[11px] tracking-wider">
                    Total Landed Cost
                  </td>
                  {quotes.map((q) => {
                    const isLowest = q.totalCostNZD === minCost;
                    return (
                      <td
                        key={q.id}
                        className={cn(
                          'py-3.5 px-5 border-l border-slate-200 text-base',
                          isLowest ? 'text-emerald-700 bg-emerald-50/60 font-black' : 'text-slate-900'
                        )}
                      >
                        ${q.totalCostNZD.toFixed(2)} NZD
                      </td>
                    );
                  })}
                </tr>

                {/* Row 5: Availability */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Stock Availability</td>
                  {quotes.map((q) => (
                    <td key={q.id} className="py-3 px-5 border-l border-slate-200 font-semibold text-slate-900">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                        {q.availability}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Row 6: Lead Time */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Lead Time to NZ Hub</td>
                  {quotes.map((q) => {
                    const isFastest = q.leadTimeDays === minLead;
                    return (
                      <td
                        key={q.id}
                        className={cn(
                          'py-3 px-5 border-l border-slate-200 font-bold',
                          isFastest ? 'text-sky-700 bg-sky-50/50' : 'text-slate-800'
                        )}
                      >
                        {q.leadTimeDisplay}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 7: Warranty */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Warranty Term</td>
                  {quotes.map((q) => (
                    <td key={q.id} className="py-3 px-5 border-l border-slate-200 text-slate-800">
                      {q.warrantyMonths} Months
                    </td>
                  ))}
                </tr>

                {/* Row 8: Supplier Reliability */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-700">Supplier Reliability</td>
                  {quotes.map((q) => {
                    const sup = suppliers.find((s) => s.id === q.supplierId);
                    return (
                      <td key={q.id} className="py-3 px-5 border-l border-slate-200 text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-brand-blue">
                            {sup?.reliabilityScore || 92}/100
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({sup?.responseRatePct || 95}% response)
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 9: Primary Selection Action */}
                <tr className="bg-slate-50">
                  <td className="py-4 px-4 font-bold text-slate-900">Procurement Action</td>
                  {quotes.map((q) => {
                    const isSelected = q.id === selectedQuoteId || q.isPreferred;
                    return (
                      <td key={q.id} className="py-4 px-5 border-l border-slate-200">
                        {isSelected ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle className="w-4 h-4" /> Preferred Option
                            </span>
                            <button
                              onClick={() =>
                                router.push(
                                  `/procurement/purchase-orders?action=new&requestId=${selectedRequestId}&quoteId=${q.id}`
                                )
                              }
                              className="btn-red-polished w-full text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 shadow-xs"
                            >
                              Create Purchase Order →
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectSupplier(q.id)}
                            className="w-full py-2 rounded-lg bg-white border border-slate-300 hover:border-brand-blue hover:text-brand-blue text-slate-700 text-xs font-bold transition-all shadow-xs"
                          >
                            Select Supplier
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add quote modal */}
      <AddQuoteModal
        isOpen={addQuoteOpen}
        onClose={() => setAddQuoteOpen(false)}
        defaultRequestId={selectedRequestId}
      />
    </div>
  );
}

export default function QuoteComparisonPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading quote comparison...</div>}>
      <QuoteComparisonContent />
    </Suspense>
  );
}
