'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  History,
  FileText,
  User,
  CreditCard,
  Building2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { RefundItem } from '@/types/finance';
import { ProcessRefundModal } from '@/components/finance/modals/ProcessRefundModal';
import { INITIAL_REFUNDS } from '@/services/finance/mockData';

export default function RefundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.refundId as string) || 'REF-2026-001';

  const resolveRefund = (id: string): RefundItem => {
    return (
      financeService.getRefundById(id) ||
      INITIAL_REFUNDS.find((r) => r.id.toLowerCase() === id.toLowerCase() || r.requestNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_REFUNDS.find((r) => r.id.toLowerCase().includes(id.toLowerCase()) || id.toLowerCase().includes(r.id.toLowerCase())) ||
      INITIAL_REFUNDS[0]
    );
  };

  const initialRefund = resolveRefund(rawId);
  const [refund, setRefund] = useState<RefundItem>(initialRefund);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const loadData = () => {
    const r = resolveRefund(rawId);
    setRefund(r);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  const handleApprove = () => {
    financeService.approveRefund(refund.id, commentText || 'Verified refund justification against logistics & supplier records.');
    loadData();
  };

  const handleReject = () => {
    financeService.rejectRefund(refund.id, commentText || 'Rejected following procurement and parts dispatch verification.');
    loadData();
  };

  const isSettled = refund.status === 'Refunded';
  const isApproved = refund.status === 'Approved';
  const isPending = refund.status === 'Requested' || refund.status === 'Under Review';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/refunds"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight">{refund.id}</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1',
                  isSettled && 'bg-purple-100 text-purple-800',
                  isApproved && 'bg-emerald-100 text-emerald-800',
                  isPending && 'bg-amber-100 text-amber-800',
                  refund.status === 'Rejected' && 'bg-red-100 text-red-800'
                )}
              >
                {isSettled && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isPending && <Clock className="w-3.5 h-3.5" />}
                {refund.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Requested by {refund.requestedBy} on {refund.requestedDate} • Original Payment: <strong>{refund.paymentId}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={handleReject}
                className="px-3.5 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
              >
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Reject Refund</span>
              </button>
              <button
                onClick={handleApprove}
                className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover flex items-center gap-1.5 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Refund</span>
              </button>
            </>
          )}

          {isApproved && (
            <button
              onClick={() => setProcessModalOpen(true)}
              className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover flex items-center gap-1.5 active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Process Gateway Settlement (NZ${refund.refundAmount.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Approval History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Refund Spec Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Refund Claim Specification
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Refund Amount</span>
                <span className="text-lg font-black text-purple-700 block mt-0.5">
                  NZ${refund.refundAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">Original: NZ${refund.originalAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Customer</span>
                <Link
                  href={`/finance/customers/${refund.customerId}`}
                  className="font-bold text-slate-900 hover:text-purple-700 hover:underline block mt-0.5"
                >
                  {refund.customerName}
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">Req: {refund.requestNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Refund Method</span>
                <span className="font-bold text-slate-900 block mt-0.5">{refund.refundMethod}</span>
                <span className="text-[10px] text-slate-400">{refund.destinationAccountRef}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Reviewed By</span>
                <span className="font-bold text-slate-900 block mt-0.5">{refund.reviewedBy || 'Pending Review'}</span>
                <span className="text-[10px] text-slate-400">{refund.reviewedDate}</span>
              </div>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1.5 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block">
                Primary Reason: {refund.reason}
              </span>
              <p className="text-slate-700 leading-relaxed">{refund.detailedReason}</p>
            </div>
          </div>

          {/* Multi-Stage Approval History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Multi-Stage Approval Progression</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h2>

            <div className="space-y-3">
              {refund.approvalHistory && refund.approvalHistory.length > 0 ? (
                refund.approvalHistory.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{step.stage}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                    </div>
                    <p className="text-slate-600">{step.comments || 'Stage approved without additional conditions.'}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="font-semibold text-slate-700">{step.actor}</span>
                      <span>•</span>
                      <span
                        className={cn(
                          'font-bold',
                          step.outcome === 'Approved' ? 'text-emerald-700' : 'text-amber-700'
                        )}
                      >
                        {step.outcome}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No approval stages logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit History & Linked Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Linked Original Payment
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-slate-900">{refund.paymentId}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  Original Settled
                </span>
              </div>
              <p className="text-slate-600">Original Amount: NZ${refund.originalAmount.toFixed(2)}</p>
              <Link
                href={`/finance/payments/${refund.paymentId}`}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Original Payment →</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Audit Compliance Record
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every refund authorization is permanently recorded in the PROCURly commercial ledger and IRD tax audit archive.
            </p>
          </div>
        </div>
      </div>

      {/* Process Modal */}
      <ProcessRefundModal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        refundId={refund.id}
        paymentId={refund.paymentId}
        customerName={refund.customerName}
        defaultAmount={refund.refundAmount}
      />
    </div>
  );
}
