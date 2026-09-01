'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  CreditCard,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Plus,
  DollarSign,
  Wallet,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ChevronRight,
  FileText,
  Activity,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import {
  FinancePayment,
  AwaitingPaymentItem,
  FinanceTransaction,
  CreditAccount,
  RefundItem,
  FinancialException,
  FinanceStaffUser,
} from '@/types/finance';

export default function FinanceDashboardPage() {
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [awaiting, setAwaiting] = useState<AwaitingPaymentItem[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [exceptions, setExceptions] = useState<FinancialException[]>([]);
  const [currentUser, setCurrentUser] = useState<FinanceStaffUser>(() => financeService.getDefaultUser());

  const loadData = () => {
    setPayments(financeService.getPayments());
    setAwaiting(financeService.getAwaitingPayments());
    setTransactions(financeService.getTransactions());
    setAccounts(financeService.getCreditAccounts());
    setRefunds(financeService.getRefunds());
    setExceptions(financeService.getExceptions());
    setCurrentUser(financeService.getCurrentUser());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  // Attention Items
  const failedPayments = payments.filter((p) => p.status === 'Failed');
  const overdueAwaiting = awaiting.filter((a) => a.status === 'Overdue' || a.daysOutstanding > 0);
  const pendingRefunds = refunds.filter((r) => r.status === 'Requested' || r.status === 'Under Review');
  const activeExceptions = exceptions.filter((e) => e.status !== 'Closed');

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>PROCURly Financial Control Centre</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Kia Ora, {currentUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Financial operations overview. Today: <span className="text-emerald-300 font-bold">NZ$12,450 revenue recorded</span>,{' '}
              <span className="text-amber-300 font-bold">NZ$7,250 awaiting settlement</span>, and{' '}
              <span className="text-red-300 font-bold">{failedPayments.length} payment retries requiring action</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/finance/reports"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 backdrop-blur-md"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Financial Reports</span>
            </Link>
            <Link
              href="/finance/approved-orders"
              className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-xs font-bold text-white transition-all shadow-glow flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clear Orders ({payments.filter((p) => p.status === 'Received').length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards (Matching Exact Specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">NZ$12,450</div>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +18.4% vs yesterday
            </p>
          </div>
        </div>

        {/* Payments Received */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Payments Received</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">NZ$9,820</div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">8 transactions settled</p>
          </div>
        </div>

        {/* Awaiting Payment */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Awaiting Payment</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">NZ$7,250</div>
            <p className="text-[10px] text-amber-600 font-bold mt-0.5">4 open customer orders</p>
          </div>
        </div>

        {/* Payment Failed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Payment Failed</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-red-600 tracking-tight">04</div>
            <p className="text-[10px] text-red-500 font-bold mt-0.5">Immediate action req.</p>
          </div>
        </div>

        {/* Credit Approved */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Credit Approved</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-indigo-900 tracking-tight">12</div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Active trade accounts</p>
          </div>
        </div>

        {/* Refunds */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Refunds Settled</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">NZ$1,240</div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">1 processed this week</p>
          </div>
        </div>
      </div>

      {/* 3. Payment Attention Queue */}
      <div className="bg-white rounded-2xl border border-red-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-red-100 bg-red-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Payment Attention Queue</h2>
              <p className="text-xs text-slate-500">
                Critical items requiring finance officer intervention (failed cards, overdue invoices, credit holds).
              </p>
            </div>
          </div>
          <Link
            href="/finance/exceptions"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>View All ({activeExceptions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Failed Item 1 */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider shrink-0 mt-0.5">
                Card Failed
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">PAY-00121</span>
                  <span className="text-xs font-bold text-slate-700">West Auto</span>
                  <span className="text-xs text-slate-400">• NZ$310.00</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Declined: Daily limit / card block. Follow up with workshop manager.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/finance/exceptions/EXC-FIN-0041"
                className="px-3.5 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
              >
                Investigate
              </Link>
            </div>
          </div>

          {/* Overdue Item 2 */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider shrink-0 mt-0.5">
                3 Days Overdue
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">AH-P-000125</span>
                  <span className="text-xs font-bold text-slate-700">West Auto</span>
                  <span className="text-xs text-slate-400">• NZ$2,450.00</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Quote accepted on 22 Aug. Direct reminder dispatched.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/finance/awaiting-payment"
                className="px-3.5 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
              >
                Send Reminder
              </Link>
            </div>
          </div>

          {/* Credit Cap Item 3 */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider shrink-0 mt-0.5">
                Credit Cap 94.7%
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Central Motors</span>
                  <span className="text-xs text-slate-400">• $14,200 used of $15,000</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Customer approved new $1,820 order. Limit expansion or interim payment required.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/finance/credit-accounts/cus_central_motors"
                className="px-3.5 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
              >
                Manage Credit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payment Status Overview & Revenue Snapshot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Settlement Channels</h3>
            <span className="text-[11px] font-semibold text-slate-400">August 2026</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Approved Trade Credit (20th Mth Following)</span>
                <span className="text-slate-900 font-bold">62% (NZ$57.6k)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[62%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Direct Bank Wire (BNZ / ANZ)</span>
                <span className="text-slate-900 font-bold">24% (NZ$22.3k)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[24%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Account2Account Direct Clearing</span>
                <span className="text-slate-900 font-bold">14% (NZ$13.0k)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full w-[14%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Refunds & Rebates</span>
                <span className="text-purple-600 font-bold">2% (-NZ$1.8k)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[2%]" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Average Order Value (AOV)</span>
            <span className="font-bold text-slate-900 text-xs">NZ$1,280.00</span>
          </div>
        </div>

        {/* Outstanding Aging Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Outstanding Aging Buckets</h3>
            <Link href="/finance/reports/outstanding" className="text-xs font-bold text-emerald-700 hover:underline">
              Full Report →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Current (0-7d)</span>
              <p className="text-base font-black text-emerald-950 mt-1">NZ$3,120</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">2 orders due</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-800 uppercase">8–30 Days</span>
              <p className="text-base font-black text-amber-950 mt-1">NZ$1,680</p>
              <p className="text-[10px] text-amber-700 mt-0.5">1 account follow-up</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <span className="text-[10px] font-bold text-red-800 uppercase">30+ Days (Overdue)</span>
              <p className="text-base font-black text-red-950 mt-1">NZ$2,450</p>
              <p className="text-[10px] text-red-700 mt-0.5">West Auto facility</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Total Outstanding</span>
              <p className="text-base font-black text-slate-900 mt-1">NZ$7,250</p>
              <p className="text-[10px] text-slate-500 mt-0.5">4 receivables</p>
            </div>
          </div>

          <Link
            href="/finance/awaiting-payment"
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Collections Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Trade Credit Risk Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Trade Credit Exposure</h3>
            <Link href="/finance/credit-accounts" className="text-xs font-bold text-indigo-700 hover:underline">
              Directory →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Credit Available:</span>
              <span className="font-bold text-slate-900">NZ$112,000</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Credit Utilised:</span>
              <span className="font-bold text-indigo-700">NZ$53,250 (47.5%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Accounts on Hold / Suspended:</span>
              <span className="font-bold text-red-600">2 accounts</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
            <p className="font-bold text-indigo-950">Active Credit Health: Strong</p>
            <p className="text-[11px] text-indigo-800">
              88% of credit customers have a Low/Medium risk rating with automatic 20th-of-month direct debit settlements.
            </p>
          </div>

          <Link
            href="/finance/credit-accounts"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Review Credit Limits & Terms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Recent Payments Table (Table as per specification) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Payment Transactions</h3>
            <p className="text-xs text-slate-500">Live incoming customer payments and clearance statuses.</p>
          </div>
          <Link
            href="/finance/payments"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Payments ({payments.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Amount (NZD)</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.slice(0, 5).map((p) => {
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
                    <td className="py-3.5 px-4 font-mono text-slate-600">{p.requestNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      NZ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.method}</td>
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
                        className="px-3 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] rounded-lg transition-all shadow-sm active:scale-[0.98] inline-block"
                      >
                        Detail
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
