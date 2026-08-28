'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Eye,
  Building2,
  DollarSign,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function CustomerQuotesPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);

  useEffect(() => {
    setRequests(operationsService.getRequests());
    const handleUpdate = () => setRequests(operationsService.getRequests());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const quotedRequests = requests.filter(
    (r) => r.customerQuote || r.status === 'Quote Ready' || r.status === 'Awaiting Customer Approval' || r.status === 'Customer Approved'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Customer Quotations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor customer quotations, authorization records, and conversion rates.
          </p>
        </div>
      </div>

      {/* Customer Quotes List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900">Quotations Register ({quotedRequests.length})</h2>
          <span className="text-xs text-slate-500">Quotes Generated for Workshops</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle & Part</th>
                <th className="py-3 px-3 text-right">Total (NZD)</th>
                <th className="py-3 px-3">Quote Status</th>
                <th className="py-3 px-3">Validity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {quotedRequests.map((req) => {
                const quote = req.customerQuote;
                const total = quote?.totalAmountNZD || req.landedCost?.finalCustomerPriceNZD || 485;
                const isApproved = req.status === 'Customer Approved' || quote?.status === 'Approved';

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#2B4499]">
                      {quote?.quoteNumber || `QUO-${req.referenceNumber.replace('AH-P-', '')}-v1`}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <Link href={`/operations/requests/${req.referenceNumber}`} className="hover:underline">
                        {req.referenceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{req.customerName}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{req.part.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">
                      NZ${total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-black border',
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        )}
                      >
                        {isApproved ? 'Customer Approved' : quote?.status || 'Sent'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">
                      {quote?.validUntil || '15 Sep 2026'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/operations/requests/${req.referenceNumber}?tab=customer-quote`}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white text-xs font-bold text-slate-700 transition-colors inline-block"
                      >
                        Workspace →
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
