'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { requestsService } from '@/services/requestsService';
import { PaymentTransaction } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Receipt,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = async () => {
    try {
      const data = await requestsService.getPayments(searchQuery);
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    const handleUpdate = () => loadPayments();
    window.addEventListener('procurly_data_updated', handleUpdate);
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, [searchQuery]);

  // Compute metrics: Amount Due, Paid, Pending, Failed, Refunded
  const amountDue = payments
    .filter((p) => p.status === 'Awaiting Payment' || p.status === 'Payment Failed')
    .reduce((sum, p) => sum + p.amountNZD, 0);

  const amountPaid = payments
    .filter((p) => p.status === 'Payment Received' || p.status === 'Credit Approved')
    .reduce((sum, p) => sum + p.amountNZD, 0);

  const pendingCount = payments.filter((p) => p.status === 'Payment Pending').length;
  const failedCount = payments.filter((p) => p.status === 'Payment Failed').length;
  const refundedCount = payments.filter((p) => p.status === 'Refunded').length;

  const filteredPayments = payments.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Amount Due') return p.status === 'Awaiting Payment' || p.status === 'Payment Failed';
    if (activeFilter === 'Paid') return p.status === 'Payment Received' || p.status === 'Credit Approved';
    if (activeFilter === 'Pending') return p.status === 'Payment Pending';
    if (activeFilter === 'Failed') return p.status === 'Payment Failed';
    if (activeFilter === 'Refunded') return p.status === 'Refunded';
    return true;
  });

  const handlePayClick = (p: PaymentTransaction) => {
    setSelectedPayment(p);
    setPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage parts procurement billing, credit account settlements, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Credit Limit: $50,000 (20th Mth Following)</span>
          </span>
        </div>
      </div>

      {/* Summary KPI Cards: Amount Due, Paid, Pending, Failed, Refunded */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Amount Due */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount Due</p>
          <p className="text-xl sm:text-2xl font-black text-[#ed2025] tracking-tight">{formatNZD(amountDue)}</p>
          <p className="text-[11px] text-slate-400">Awaiting clearance</p>
        </div>

        {/* Paid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid / Settled</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">{formatNZD(amountPaid)}</p>
          <p className="text-[11px] text-emerald-600">Processed this cycle</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{pendingCount}</p>
          <p className="text-[11px] text-slate-400">Processing in bank</p>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card space-y-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed</p>
          <p className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">{failedCount}</p>
          <p className="text-[11px] text-red-500 font-semibold">Requires retry</p>
        </div>

        {/* Refunded */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refunded</p>
          <p className="text-xl sm:text-2xl font-black text-slate-700 tracking-tight">{refundedCount}</p>
          <p className="text-[11px] text-slate-400">Credit notes returned</p>
        </div>
      </div>

      {/* Payments List Card */}
      <Card className="shadow-card border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All', 'Amount Due', 'Paid', 'Pending', 'Failed', 'Refunded'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeFilter === filter
                    ? 'bg-[#ed2025] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ref # or part..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <p className="text-sm font-bold text-slate-800">No payment records found</p>
              <p className="text-xs text-slate-400">No transactions match your selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const isAwaiting = p.status === 'Awaiting Payment';
                const isFailed = p.status === 'Payment Failed';

                return (
                  <div
                    key={p.id}
                    className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.requestNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{p.vehicleSummary}</span>
                        <Badge variant="status" status={p.status} dot={true} />
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{p.partSummary}</h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Amount: <strong className="text-slate-900 font-mono">{formatNZD(p.amountNZD)} NZD</strong></span>
                        <span>•</span>
                        <span>Due Date: <strong>{p.dueDate}</strong></span>
                        {p.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{p.paymentMethod}</span>
                          </>
                        )}
                        {p.receiptNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px]">Receipt: {p.receiptNumber}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isAwaiting && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayClick(p)}
                          className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-sm"
                        >
                          Pay Now →
                        </Button>
                      )}

                      {isFailed && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayClick(p)}
                          className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-sm"
                        >
                          Try Again →
                        </Button>
                      )}

                      <Link href={`/requests/${p.requestId}`}>
                        <Button variant="outline" size="sm" className="text-xs font-semibold">
                          View Request
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Settlement Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payment={selectedPayment}
        onPaymentSuccess={loadPayments}
      />
    </div>
  );
}
