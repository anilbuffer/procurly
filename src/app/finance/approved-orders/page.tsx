'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Zap,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { ApprovedOrderFinance, OrderClearanceStatus } from '@/types/finance';
import { FinancialClearanceModal } from '@/components/finance/modals/FinancialClearanceModal';

export default function ApprovedOrdersPage() {
  const [orders, setOrders] = useState<ApprovedOrderFinance[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApprovedOrderFinance | null>(null);

  const loadData = () => {
    setOrders(financeService.getApprovedOrders());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.clearanceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearedCount = orders.filter((o) => o.clearanceStatus === 'Financially Cleared').length;
  const awaitingCount = orders.filter((o) => o.clearanceStatus === 'Awaiting Payment').length;
  const verificationCount = orders.filter((o) => o.clearanceStatus === 'Credit Verification').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Approved Orders & Financial Clearance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear customer-approved orders for international procurement once payment or trade credit is verified.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{clearedCount} Orders Released to Procurement</span>
          </div>
        </div>
      </div>

      {/* Core Finance Workflow Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Core Finance Workflow Stage
        </span>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 bg-slate-800 rounded-xl text-slate-300">1. Customer Approval</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-3 py-1.5 bg-indigo-900/60 text-indigo-300 rounded-xl border border-indigo-700">
            2. Payment / Credit Verification
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-3 py-1.5 bg-[#ed2025] text-white rounded-xl shadow-glow">
            3. Financial Clearance
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-3 py-1.5 bg-emerald-900/60 text-emerald-300 rounded-xl border border-emerald-700">
            4. Release to Procurement
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Financially Cleared', 'Awaiting Payment', 'Credit Verification', 'Customer Approved'] as const).map(
          (status) => (
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
              {status === 'All' ? 'All Orders' : status}
            </button>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Order Value</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Clearance Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No orders match the selected clearance criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCleared = order.clearanceStatus === 'Financially Cleared';
                  const isAwaiting = order.clearanceStatus === 'Awaiting Payment';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/finance/approved-orders/${order.id}`} className="hover:text-emerald-700 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{order.requestNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{order.customerName}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        NZ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{order.paymentMethod}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-extrabold',
                            (order.paymentStatus === 'Received' || order.paymentStatus === 'Credit Approved') &&
                              'bg-emerald-100 text-emerald-800',
                            order.paymentStatus === 'Pending' && 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            isCleared && 'bg-emerald-100 text-emerald-800',
                            isAwaiting && 'bg-amber-100 text-amber-800',
                            order.clearanceStatus === 'Credit Verification' && 'bg-indigo-100 text-indigo-800'
                          )}
                        >
                          {isCleared && <CheckCircle2 className="w-3 h-3" />}
                          {isAwaiting && <Clock className="w-3 h-3" />}
                          {order.clearanceStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/finance/approved-orders/${order.id}`}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors inline-block"
                          >
                            Review
                          </Link>
                          {!isCleared && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setClearanceModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] rounded-lg transition-all shadow-sm active:scale-[0.98]"
                            >
                              Clear & Release
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

      {/* Clearance Modal */}
      {selectedOrder && (
        <FinancialClearanceModal
          isOpen={clearanceModalOpen}
          onClose={() => {
            setClearanceModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.orderNumber}
          customerName={selectedOrder.customerName}
          amount={selectedOrder.totalAmount}
        />
      )}
    </div>
  );
}
