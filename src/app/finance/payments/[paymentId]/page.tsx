'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ArrowLeft,
  Download,
  Building2,
  FileText,
  ShieldCheck,
  Receipt,
  User,
  Plus,
  History,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinancePayment } from '@/types/finance';
import { ProcessRefundModal } from '@/components/finance/modals/ProcessRefundModal';
import { AuditHistoryModal } from '@/components/finance/modals/AuditHistoryModal';
import { INITIAL_FINANCE_PAYMENTS } from '@/services/finance/mockData';
import { EndToEndFlowNavigator } from '@/components/ui/EndToEndFlowNavigator';
import { syncRequestStatusAcrossRoles } from '@/lib/syncCrossRoleStore';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.paymentId as string) || 'PAY-000123';

  const resolvePayment = (id: string): FinancePayment => {
    return (
      financeService.getPaymentById(id) ||
      INITIAL_FINANCE_PAYMENTS.find((p) => p.id.toLowerCase() === id.toLowerCase() || p.requestNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_FINANCE_PAYMENTS.find((p) => p.id.toLowerCase().includes(id.toLowerCase()) || id.toLowerCase().includes(p.id.toLowerCase())) ||
      INITIAL_FINANCE_PAYMENTS[0]
    );
  };

  const initialPayment = resolvePayment(rawId);
  const [payment, setPayment] = useState<FinancePayment>(initialPayment);
  const [newNote, setNewNote] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const loadData = () => {
    const p = resolvePayment(rawId);
    setPayment(p);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    financeService.addPaymentNote(payment.id, newNote);
    setNewNote('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 2000);
    loadData();
  };

  const isReceived = payment.status === 'Received' || payment.status === 'Credit Approved';
  const isFailed = payment.status === 'Failed';
  const isRefunded = payment.status === 'Refunded';

  const resolveCurrentStatus = () => {
    if (typeof window !== 'undefined') {
      try {
        const rawProc = localStorage.getItem('procurly_proc_requests_v2');
        if (rawProc) {
          const procReqs = JSON.parse(rawProc);
          const req = procReqs.find(
            (r: any) => r.requestNumber === payment.requestNumber || r.id === 'req_123'
          );
          if (req?.status) return req.status;
        }
      } catch (e) {}
    }
    return payment.status === 'Received' ? 'Payment Received' : 'Awaiting Payment';
  };

  return (
    <div className="space-y-6">
      {/* 0. INTERACTIVE END-TO-END FLOW NAVIGATOR & ROLE SWITCHER */}
      <EndToEndFlowNavigator
        requestId={payment.requestNumber || 'AH-P-000123'}
        currentStatus={resolveCurrentStatus()}
        onStatusChanged={loadData}
      />
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/payments"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight">{payment.id}</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1',
                  isReceived && 'bg-emerald-100 text-emerald-800',
                  isFailed && 'bg-red-100 text-red-800',
                  isRefunded && 'bg-purple-100 text-purple-800',
                  payment.status === 'Pending' && 'bg-amber-100 text-amber-800'
                )}
              >
                {isReceived && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isFailed && <AlertTriangle className="w-3.5 h-3.5" />}
                {isRefunded && <RotateCcw className="w-3.5 h-3.5" />}
                {payment.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Settled on {payment.paymentDate} • Linked to Request <strong>{payment.requestNumber}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isReceived && (
            <button
              onClick={() => {
                financeService.updatePaymentStatus(payment.id, 'Received', 'Payment confirmed & reconciled via BNZ wire');
                syncRequestStatusAcrossRoles(payment.requestNumber, 'Payment Received', {
                  actorName: 'Finance Specialist',
                  note: `Payment of NZ$${payment.amount.toFixed(2)} reconciled. Procurement released.`,
                });
                loadData();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Reconcile Payment →</span>
            </button>
          )}

          <button
            onClick={() => setAuditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit History</span>
          </button>

          {isReceived && (
            <button
              onClick={() => setRefundModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Issue Refund</span>
            </button>
          )}

          <button
            onClick={() => {
              alert(`Downloading official receipt ${payment.receiptNumber || payment.id}.pdf`);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-glow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Breakdown, Timeline, Gateway */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Payment Summary & Financial Breakdown
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Total Amount</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  NZ${payment.amount.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">15% NZ GST Included</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Payment Method</span>
                <span className="font-bold text-slate-900 block mt-0.5">{payment.method}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {payment.gatewayReference || payment.bankReference || 'REF-PENDING'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Customer</span>
                <Link
                  href={`/finance/customers/${payment.customerId}`}
                  className="font-bold text-slate-900 hover:text-emerald-700 hover:underline block mt-0.5"
                >
                  {payment.customerName}
                </Link>
                <span className="text-[10px] text-slate-400">{payment.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Invoice / Receipt</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {payment.invoiceNumber || 'INV-2026-PENDING'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{payment.receiptNumber}</span>
              </div>
            </div>

            {/* Financial Line Item Breakdown */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parts Subtotal:</span>
                <span className="font-semibold text-slate-900">NZ${payment.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Logistics & Freight Handling:</span>
                <span className="font-semibold text-slate-900">NZ${payment.freight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (15.0% NZ IRD):</span>
                <span className="font-semibold text-slate-900">NZ${payment.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Net Total Settled:</span>
                <span className="text-emerald-700">NZ${payment.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Linked Vehicle & Parts Spec */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Procurement & Vehicle Association
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Vehicle Specification</span>
                <p className="font-bold text-slate-900">{payment.vehicleSummary}</p>
                <p className="text-[11px] text-slate-500 font-mono">Request: {payment.requestNumber}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Parts Procurement Item</span>
                <p className="font-bold text-slate-900">{payment.partsSummary}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Cleared for Procurement</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/finance/customer-quotes`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Linked Quote</span>
              </Link>
              <Link
                href={`/finance/approved-orders`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Approved Order</span>
              </Link>
            </div>
          </div>

          {/* Payment Gateway & Technical Authorization */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Gateway Settlement Technical Record
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Gateway Reference</span>
                <span className="font-mono font-bold text-slate-900 text-[11px] block mt-0.5">
                  {payment.gatewayReference || payment.bankReference || 'BNZ-CLEAR-REC'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Auth / Confirmation Code</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {payment.authCode || 'BNZ-CLEAR-991'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Card Brand / Account</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {payment.cardBrand
                    ? `${payment.cardBrand} •••• ${payment.cardLast4 || '••••'}`
                    : payment.bankAccountLast4
                    ? `Bank Acc •••• ${payment.bankAccountLast4}`
                    : payment.method}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Allocating Specialist</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {payment.allocatedBy || 'Automated Clearing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Notes, Internal Audit, Documents */}
        <div className="space-y-6">
          {/* Internal Notes Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Finance Internal Notes</span>
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </h2>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal ledger or reconciliation note..."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between">
                {noteSuccess && <span className="text-[11px] text-emerald-600 font-bold">Note saved!</span>}
                <button
                  type="submit"
                  className="ml-auto px-3.5 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
                >
                  Add Note
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2 divide-y divide-slate-100">
              {payment.internalNotes && payment.internalNotes.length > 0 ? (
                payment.internalNotes.map((note, idx) => (
                  <div key={idx} className="pt-2 text-xs text-slate-600">
                    <p>{note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">No internal notes added.</p>
              )}
            </div>
          </div>

          {/* Linked Documents */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Generated Financial Documents</h2>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Tax Invoice ({payment.invoiceNumber})</p>
                    <p className="text-[10px] text-slate-400">PDF • 142 KB</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Downloading Invoice ${payment.invoiceNumber}.pdf`)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Receipt className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Payment Confirmation Receipt</p>
                    <p className="text-[10px] text-slate-400">PDF • 118 KB</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Downloading Receipt ${payment.receiptNumber}.pdf`)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProcessRefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        paymentId={payment.id}
        customerName={payment.customerName}
        defaultAmount={payment.amount}
      />
      <AuditHistoryModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title={payment.id}
        auditTrail={payment.auditTrail}
      />
    </div>
  );
}
