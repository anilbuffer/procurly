'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  DollarSign,
  Lock,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest, OperationsStaffUser } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function PaymentsManagementPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [refundTarget, setRefundTarget] = useState<OperationalPartRequest | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const loadData = () => {
    setRequests(operationsService.getRequests());
    setCurrentUser(operationsService.getCurrentUser());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    window.addEventListener('procurly_ops_updated', handleUpdate);
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    window.addEventListener('procurly_finance_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
      window.removeEventListener('procurly_ops_updated', handleUpdate);
      window.removeEventListener('procurly_procurement_updated', handleUpdate);
      window.removeEventListener('procurly_finance_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const paymentList = requests.map((r) => ({
    request: r,
    payment: r.payment,
  }));

  const filteredPayments = paymentList.filter(({ payment }) => {
    if (selectedStatus !== 'All' && payment.status !== selectedStatus) return false;
    return true;
  });

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget || !refundAmount) return;

    operationsService.processRefund(
      refundTarget.payment.paymentNumber,
      Number(refundAmount),
      refundReason || 'Commercial adjustment authorized by Finance.'
    );

    setRefundTarget(null);
    setRefundReason('');
    setRefundAmount('');
    loadData();
  };

  const handleRecordSettlement = (paymentNumber: string) => {
    operationsService.recordPayment(paymentNumber, 'Verified Account2Account Direct Settlement');
    loadData();
  };

  const canRefund = currentUser.permissions.canIssueRefunds;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 32. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payment Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor customer invoice settlements, trade credit billing, and refund workflows.
          </p>
        </div>

        <Link
          href="/operations/refunds"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-purple-600" />
          <span>Refund Ledger →</span>
        </Link>
      </div>

      {/* 32. Payment KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <button
          onClick={() => setSelectedStatus('Payment Received')}
          className={cn(
            'p-4 rounded-2xl border text-left transition-all shadow-xs',
            selectedStatus === 'Payment Received' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Received</span>
          <p className="text-2xl font-black text-emerald-900">
            {paymentList.filter((p) => p.payment.status === 'Payment Received').length}
          </p>
          <span className="text-[10px] text-emerald-600">Settled to bank</span>
        </button>

        <button
          onClick={() => setSelectedStatus('Awaiting Payment')}
          className={cn(
            'p-4 rounded-2xl border text-left transition-all shadow-xs',
            selectedStatus === 'Awaiting Payment' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' : 'bg-white border-slate-200 hover:border-amber-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">Awaiting Payment</span>
          <p className="text-2xl font-black text-amber-900">
            {paymentList.filter((p) => p.payment.status === 'Awaiting Payment').length}
          </p>
          <span className="text-[10px] text-amber-600">NZ$4,850 open</span>
        </button>

        <button
          onClick={() => setSelectedStatus('Payment Failed')}
          className={cn(
            'p-4 rounded-2xl border text-left transition-all shadow-xs',
            selectedStatus === 'Payment Failed' ? 'bg-red-50 border-red-300 ring-2 ring-red-200' : 'bg-white border-slate-200 hover:border-red-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-red-700 block mb-1">Failed</span>
          <p className="text-2xl font-black text-red-700">
            {paymentList.filter((p) => p.payment.status === 'Payment Failed').length}
          </p>
          <span className="text-[10px] text-red-600 font-semibold">Requires retry</span>
        </button>

        <button
          onClick={() => setSelectedStatus('Credit Approved')}
          className={cn(
            'p-4 rounded-2xl border text-left transition-all shadow-xs',
            selectedStatus === 'Credit Approved' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white border-slate-200 hover:border-blue-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-blue-700 block mb-1">Credit Approved</span>
          <p className="text-2xl font-black text-blue-900">
            {paymentList.filter((p) => p.payment.status === 'Credit Approved' || p.payment.creditApproved).length}
          </p>
          <span className="text-[10px] text-blue-600">20th Month Terms</span>
        </button>

        <button
          onClick={() => setSelectedStatus('Refunded')}
          className={cn(
            'p-4 rounded-2xl border text-left transition-all shadow-xs',
            selectedStatus === 'Refunded' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200' : 'bg-white border-slate-200 hover:border-purple-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">Refunded</span>
          <p className="text-2xl font-black text-purple-900">
            {paymentList.filter((p) => p.payment.status === 'Refunded').length}
          </p>
          <span className="text-[10px] text-purple-600">Credit notes</span>
        </button>
      </div>

      {/* 33. Payment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900">Transactions Ledger ({filteredPayments.length})</h2>
            {selectedStatus !== 'All' && (
              <button
                onClick={() => setSelectedStatus('All')}
                className="text-[10px] font-bold text-[#2B4499] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500">RBAC Role: {currentUser.roleTitle}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3 text-right">Amount (NZD)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date / Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredPayments.map(({ request: req, payment: pay }) => {
                const isReceived = pay.status === 'Payment Received';
                const isFailed = pay.status === 'Payment Failed';
                const isRefunded = pay.status === 'Refunded';

                return (
                  <tr key={pay.paymentNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#2B4499]">
                      {pay.paymentNumber}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <Link href={`/operations/requests/${req.referenceNumber}`} className="hover:underline">
                        {req.referenceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{req.customerName}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">
                      NZ${pay.amountNZD.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-black border',
                          isReceived
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isFailed
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isRefunded
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">{pay.dueDate}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isReceived && (
                          <button
                            onClick={() => handleRecordSettlement(pay.paymentNumber)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-[11px] font-bold transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}

                        {canRefund && !isRefunded && (
                          <button
                            onClick={() => {
                              setRefundTarget(req);
                              setRefundAmount(pay.amountNZD.toString());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 text-[11px] font-bold transition-colors"
                          >
                            Refund
                          </button>
                        )}

                        <Link
                          href={`/operations/requests/${req.referenceNumber}?tab=customer-quote`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#ed2025] hover:text-white text-slate-700 text-[11px] font-bold transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 68. REFUND CONFIRMATION MODAL */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setRefundTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-slide-up text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Process Customer Refund</h3>
                <p className="text-slate-500">
                  {refundTarget.customerName} ({refundTarget.referenceNumber})
                </p>
              </div>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Refund Amount (NZD) *</label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Refund *</label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Duplicate credit authorization or customer cancellation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-2.5 bg-purple-50 rounded-xl text-[11px] text-purple-900">
                Logged by Finance Controller: <strong>{currentUser.name}</strong>. Credit note will be generated in audit trail.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
                >
                  Confirm & Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
