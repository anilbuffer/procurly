'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest } from '@/types/operations';

export default function RefundsPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);

  useEffect(() => {
    setRequests(operationsService.getRequests());
    const handleUpdate = () => setRequests(operationsService.getRequests());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const refundedRequests = requests.filter(
    (r) => r.payment.status === 'Refunded' || r.status === 'Refunded' || r.payment.refundDetails
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/operations/payments"
              className="text-xs font-bold text-slate-500 hover:text-[#2B4499] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Payments</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Refunds Ledger</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Credit adjustments, refunds, and financial compensation records.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900">Processed Refunds ({refundedRequests.length})</h2>
          <span className="text-xs text-slate-500">Finance Controller Authorizations</span>
        </div>

        {refundedRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RotateCcw className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No active refunds</p>
            <p className="mt-0.5">All transactions and credit accounts are currently in standard standing.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {refundedRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[#2B4499]">{req.payment.paymentNumber}</span>
                    <span className="font-bold text-slate-900">{req.customerName}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      Refunded
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Related Request:{' '}
                    <Link href={`/operations/requests/${req.referenceNumber}`} className="font-bold text-[#2B4499]">
                      {req.referenceNumber}
                    </Link>{' '}
                    ({req.vehicle.make} {req.vehicle.model})
                  </p>
                  {req.payment.refundDetails && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reason: <em>&quot;{req.payment.refundDetails.reason}&quot;</em> · Processed by {req.payment.refundDetails.processedBy}
                    </p>
                  )}
                </div>
                <div className="text-right font-mono font-black text-base text-purple-900">
                  NZ${req.payment.refundDetails?.amountNZD || req.payment.amountNZD || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
