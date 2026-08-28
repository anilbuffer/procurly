'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ArrowRight,
  Download,
  Plus,
  Calendar,
  Building2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinancePayment, PaymentStatusType, PaymentMethodType } from '@/types/finance';
import { RecordPaymentModal } from '@/components/finance/modals/RecordPaymentModal';

export default function FinancePaymentsPage() {
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  const loadData = () => {
    setPayments(financeService.getPayments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partsSummary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'All' || p.method.toLowerCase().includes(methodFilter.toLowerCase());
    const matchesCustomer = customerFilter === 'All' || p.customerId === customerFilter;

    return matchesSearch && matchesStatus && matchesMethod && matchesCustomer;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.status !== 'Failed' ? p.amount : 0), 0);
  const receivedCount = payments.filter((p) => p.status === 'Received').length;
  const pendingCount = payments.filter((p) => p.status === 'Pending').length;
  const failedCount = payments.filter((p) => p.status === 'Failed').length;
  const creditApprovedCount = payments.filter((p) => p.status === 'Credit Approved').length;
  const refundedCount = payments.filter((p) => p.status === 'Refunded').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Payments Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time incoming customer settlements, credit allocations, payment statuses, and verification history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecordModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs flex items-center gap-1.5 shadow-btn-primary hover:shadow-btn-primary-hover transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Payment ID,Request,Customer,Amount NZD,Method,Status,Date']
                  .concat(
                    filteredPayments.map(
                      (p) => `${p.id},${p.requestNumber},"${p.customerName}",${p.amount},${p.method},${p.status},${p.paymentDate}`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `PROCURly_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Status Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('All')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all',
            statusFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
          )}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">All Payments</span>
          <span className="text-base sm:text-lg font-black tracking-tight">{payments.length}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Received')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all',
            statusFilter === 'Received'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-emerald-50/50'
          )}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block text-emerald-600">Received</span>
          <span className="text-base sm:text-lg font-black tracking-tight">{receivedCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all',
            statusFilter === 'Pending'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-amber-50/50'
          )}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block text-amber-600">Pending</span>
          <span className="text-base sm:text-lg font-black tracking-tight">{pendingCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Failed')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all',
            statusFilter === 'Failed'
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-red-50/50'
          )}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block text-red-600">Failed</span>
          <span className="text-base sm:text-lg font-black tracking-tight">{failedCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Credit Approved')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all',
            statusFilter === 'Credit Approved'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-indigo-50/50'
          )}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block text-indigo-600">Credit Approved</span>
          <span className="text-base sm:text-lg font-black tracking-tight">{creditApprovedCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('Refunded')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all',
            statusFilter === 'Refunded'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-purple-50/50'
          )}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block text-purple-600">Refunded</span>
          <span className="text-base sm:text-lg font-black tracking-tight">{refundedCount}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Payment #, Request #, Customer..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Payment Methods</option>
            <option value="Card">Card (Stripe)</option>
            <option value="Bank">Bank Transfer</option>
            <option value="Account2Account">Account2Account</option>
            <option value="Trade Credit">Trade Credit</option>
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Customers</option>
            <option value="cus_autocare_akl">AutoCare Auckland</option>
            <option value="cus_central_motors">Central Motors</option>
            <option value="cus_west_auto">West Auto</option>
            <option value="cus_tauranga_euro">Tauranga Euro Specialists</option>
            <option value="cus_south_island_fleet">South Island Fleet Services</option>
            <option value="cus_north_shore_auto">North Shore Auto Group</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Payment #</th>
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No payment records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isReceived = p.status === 'Received' || p.status === 'Credit Approved';
                  const isFailed = p.status === 'Failed';
                  const isRefunded = p.status === 'Refunded';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/finance/payments/${p.id}`} className="hover:text-emerald-700 hover:underline">
                          {p.id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <Link href={`/finance/payments/${p.id}`} className="hover:underline">
                          {p.requestNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{p.customerName}</span>
                        <span className="text-[11px] text-slate-400 truncate block max-w-xs">{p.partsSummary}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        NZ${p.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.method}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            isReceived && 'bg-emerald-100 text-emerald-800',
                            isFailed && 'bg-red-100 text-red-800',
                            isRefunded && 'bg-purple-100 text-purple-800',
                            p.status === 'Pending' && 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {isReceived && <CheckCircle2 className="w-3 h-3" />}
                          {isFailed && <AlertTriangle className="w-3 h-3" />}
                          {isRefunded && <RotateCcw className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{p.paymentDate.split(',')[0]}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/finance/payments/${p.id}`}
                          className="px-3 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover transition-all active:scale-[0.98] inline-block"
                        >
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredPayments.length} of {payments.length} payments</span>
          <span>Settled Total: <strong className="text-slate-900">NZ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
      />
    </div>
  );
}
