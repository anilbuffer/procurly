'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  Building2,
  Calendar,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { RefundItem, RefundStatus } from '@/types/finance';
import { ProcessRefundModal } from '@/components/finance/modals/ProcessRefundModal';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);

  const loadData = () => {
    setRefunds(financeService.getRefunds());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRefunded = refunds
    .filter((r) => r.status === 'Refunded')
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const pendingCount = refunds.filter((r) => r.status === 'Requested' || r.status === 'Under Review').length;
  const approvedCount = refunds.filter((r) => r.status === 'Approved').length;
  const refundedCount = refunds.filter((r) => r.status === 'Refunded').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Customer Refunds Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-tracked refund authorization, supplier unavailability rebates, and gateway settlement reversals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-purple-50 text-purple-800 rounded-xl border border-purple-200 text-xs font-bold flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>NZ${totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })} Settled YTD</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Refund Requests</span>
          <p className="text-xl font-black text-slate-900 mt-1">{refunds.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All customer & procurement claims</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <p className="text-xl font-black text-amber-700 mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Awaiting finance approval</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">Approved / Ready to Process</span>
          <p className="text-xl font-black text-blue-700 mt-1">{approvedCount}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">Clearance granted for gateway execution</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs bg-purple-50/20">
          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">Settled & Closed</span>
          <p className="text-xl font-black text-purple-700 mt-1">{refundedCount}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">Funds credited to original card/bank</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Requested', 'Under Review', 'Approved', 'Refunded', 'Rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              statusFilter === status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {status === 'All' ? 'All Refunds' : status}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Refund # (REF-0089), Payment #, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Refund #</th>
                <th className="py-3.5 px-4">Payment #</th>
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No refund records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref) => {
                  const isSettled = ref.status === 'Refunded';
                  const isApproved = ref.status === 'Approved';
                  const isReview = ref.status === 'Under Review' || ref.status === 'Requested';

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/finance/refunds/${ref.id}`} className="hover:text-purple-700 hover:underline">
                          {ref.id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{ref.paymentId}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{ref.requestNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{ref.customerName}</td>
                      <td className="py-3.5 px-4 text-right font-black text-purple-700">
                        NZ${ref.refundAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{ref.reason}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            isSettled && 'bg-purple-100 text-purple-800',
                            isApproved && 'bg-emerald-100 text-emerald-800',
                            isReview && 'bg-amber-100 text-amber-800',
                            ref.status === 'Rejected' && 'bg-red-100 text-red-800'
                          )}
                        >
                          {isSettled && <CheckCircle2 className="w-3 h-3" />}
                          {isReview && <Clock className="w-3 h-3" />}
                          {ref.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{ref.requestedBy}</td>
                      <td className="py-3.5 px-4 text-slate-500">{ref.requestedDate.split(',')[0]}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/finance/refunds/${ref.id}`}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors inline-block"
                          >
                            Detail
                          </Link>
                          {isApproved && (
                            <button
                              onClick={() => {
                                setSelectedRefund(ref);
                                setProcessModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] rounded-lg transition-all shadow-sm active:scale-[0.98]"
                            >
                              Process
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedRefund && (
        <ProcessRefundModal
          isOpen={processModalOpen}
          onClose={() => {
            setProcessModalOpen(false);
            setSelectedRefund(null);
          }}
          refundId={selectedRefund.id}
          paymentId={selectedRefund.paymentId}
          customerName={selectedRefund.customerName}
          defaultAmount={selectedRefund.refundAmount}
        />
      )}
    </div>
  );
}
