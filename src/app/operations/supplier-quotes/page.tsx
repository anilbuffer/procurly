'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Lock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest, SupplierQuote } from '@/types/operations';

export default function SupplierQuotesOverviewPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);

  useEffect(() => {
    setRequests(operationsService.getRequests());
    const handleUpdate = () => setRequests(operationsService.getRequests());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  // Aggregate all supplier quotes across requests
  const allQuotes: { request: OperationalPartRequest; quote: SupplierQuote }[] = [];
  requests.forEach((req) => {
    (req.sourcing?.supplierQuotes || []).forEach((sq) => {
      allQuotes.push({ request: req, quote: sq });
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Supplier Wholesale Quotes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal procurement quote register across all Japanese, European, and regional suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Strictly Confidential Internal Data</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900">Wholesale Quotation Ledger ({allQuotes.length})</h2>
          <span className="text-xs text-slate-500">Live Supplier Pricing Matrix</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-3">Vehicle & Part</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3 text-right">Part Wholesale</th>
                <th className="py-3 px-3 text-right">Freight</th>
                <th className="py-3 px-3 text-right">Total Supplier Landed</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {allQuotes.map(({ request, quote }) => {
                const isSelected = quote.isSelected || request.sourcing?.selectedSupplierQuoteId === quote.id;
                return (
                  <tr
                    key={quote.id}
                    className={isSelected ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3.5 px-4 font-black text-[#2B4499]">
                      <Link
                        href={`/operations/requests/${request.referenceNumber}?tab=supplier-quotes`}
                        className="hover:underline"
                      >
                        {request.referenceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{request.part.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-900">
                      {quote.supplierName} ({quote.supplierCode})
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      NZ${quote.partCostNZD.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      NZ${quote.supplierFreightNZD.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-[#2B4499]">
                      NZ${quote.totalSupplierCostNZD.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {quote.availability}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/operations/requests/${request.referenceNumber}?tab=customer-quote`}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white text-xs font-bold text-slate-700 transition-colors inline-block"
                      >
                        Open Quote Builder →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
