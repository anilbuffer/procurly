'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Search,
  Receipt,
  CreditCard,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Truck,
  PlusCircle,
  ShieldAlert,
  ChevronRight,
  User,
  Zap,
  Calendar,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationsStaffUser, OperationalReportMetrics } from '@/types/operations';
import { QuickCreateModal } from '@/components/operations/layout/QuickCreateModal';
import { cn } from '@/lib/utils';

export default function OperationsDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [metrics, setMetrics] = useState<OperationalReportMetrics>(operationsService.getReportMetrics());
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const loadData = () => {
    setCurrentUser(operationsService.getCurrentUser());
    setMetrics(operationsService.getReportMetrics());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const pipelineStages = [
    { name: 'Submitted', count: 48, filter: 'Submitted', color: 'border-slate-300 hover:border-slate-400 bg-slate-50' },
    { name: 'Sourcing', count: 21, filter: 'Sourcing', color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50' },
    { name: 'Quote Ready', count: 12, filter: 'Quote Ready', color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50' },
    { name: 'Customer Approval', count: 9, filter: 'Awaiting Customer Approval', color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50' },
    { name: 'Paid', count: 7, filter: 'Payment Received', color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' },
    { name: 'Procurement', count: 24, filter: 'Ordered From Supplier', color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50' },
    { name: 'Shipping', count: 18, filter: 'In Transit', color: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/50' },
    { name: 'Delivered', count: 31, filter: 'Delivered', color: 'border-teal-200 hover:border-teal-400 bg-teal-50/50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 12. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, {currentUser.name.split(' ')[0]}.
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s what&apos;s happening across Procurly procurement operations today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today, 28 Aug 2026</span>
          </div>

          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-glow transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* 13. KPI Cards Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Open Requests */}
        <Link
          href="/operations/requests"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#2B4499] hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Open Requests</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2B4499]">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-[#2B4499] transition-colors">
            {metrics.openRequestsCount}
          </p>
          <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <span>+8 this week</span>
          </p>
        </Link>

        {/* Awaiting Quotes */}
        <Link
          href="/operations/sourcing"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#2B4499] hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Awaiting Quotes</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-[#2B4499] transition-colors">
            {metrics.awaitingQuotesCount}
          </p>
          <p className="text-[11px] font-medium text-amber-600 mt-1 flex items-center gap-1">
            <span>4 overdue</span>
          </p>
        </Link>

        {/* Awaiting Customer Approval */}
        <Link
          href="/operations/customer-quotes"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#2B4499] hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Awaiting Approval</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-[#2B4499] transition-colors">
            0{metrics.awaitingApprovalCount}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Requires follow-up</p>
        </Link>

        {/* Awaiting Payment */}
        <Link
          href="/operations/payments"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#2B4499] hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Awaiting Payment</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-[#2B4499] transition-colors">
            0{metrics.awaitingPaymentCount}
          </p>
          <p className="text-[11px] font-medium text-amber-700 mt-1 truncate">NZ$4,850 outstanding</p>
        </Link>

        {/* Procurement In Progress */}
        <Link
          href="/operations/procurement-orders"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#2B4499] hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">In Procurement</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 group-hover:text-[#2B4499] transition-colors">
            {metrics.procurementInProgressCount}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Active orders</p>
        </Link>

        {/* Exceptions (STRONG RED VISUAL PRIORITY) */}
        <Link
          href="/operations/exceptions"
          className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-white border-2 border-[#ed2025] hover:shadow-lg hover:shadow-red-500/10 transition-all group relative overflow-hidden ring-2 ring-red-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-red-700 uppercase tracking-wider">Exceptions</span>
            <div className="p-1.5 rounded-lg bg-[#ed2025] text-white shadow-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#ed2025]">0{metrics.exceptionsCount}</p>
          <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
            <span>Requires attention</span>
          </p>
        </Link>
      </div>

      {/* 14. Operational Priority Queue ("Needs Attention") */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ed2025] animate-ping" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">Needs Attention</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              3 Critical Items
            </span>
          </div>
          <Link
            href="/operations/tasks"
            className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
          >
            <span>View all queue tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Payment Failed */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col justify-between hover:border-red-400 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#ed2025]">
                  <span className="w-2 h-2 rounded-full bg-[#ed2025]" />
                  AH-P-000108
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  Critical
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 mb-0.5">Payment Failed</p>
              <p className="text-xs text-slate-600 mb-2">Hyundai Santa Fe · Brake Booster Unit</p>
              <div className="text-[11px] text-slate-500 mb-3 space-y-0.5">
                <p>Owner: <span className="font-semibold text-slate-700">Michael Chen</span></p>
                <p>Customer: <span className="font-semibold text-slate-700">AutoCare Auckland</span></p>
              </div>
            </div>
            <Link
              href="/operations/requests/AH-P-000108"
              className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-red-200 hover:bg-[#ed2025] hover:text-white text-xs font-bold text-[#ed2025] transition-all shadow-xs"
            >
              <span>Review Payment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Supplier Quote Expiring */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between hover:border-amber-400 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  AH-P-000118
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Expires Today
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 mb-0.5">Supplier Quote Expiring</p>
              <p className="text-xs text-slate-600 mb-2">Toyota Hilux · VNT Turbocharger</p>
              <div className="text-[11px] text-slate-500 mb-3 space-y-0.5">
                <p>Wholesale Rate: <span className="font-semibold text-slate-700">NZ$1,605 total landed</span></p>
                <p>Owner: <span className="font-semibold text-slate-700">Sarah Wilson</span></p>
              </div>
            </div>
            <Link
              href="/operations/requests/AH-P-000118"
              className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-600 hover:text-white text-xs font-bold text-amber-700 transition-all shadow-xs"
            >
              <span>Review Quote</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Logistics Exception */}
          <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/40 flex flex-col justify-between hover:border-yellow-400 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-yellow-800">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  AH-P-000104
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded">
                  LOG-00042
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 mb-0.5">Logistics Exception</p>
              <p className="text-xs text-slate-600 mb-2">Mazda CX-5 · Tailgate Assembly</p>
              <div className="text-[11px] text-slate-500 mb-3 space-y-0.5">
                <p>Status: <span className="font-semibold text-slate-700">Oversize Crate Flight Rebooking</span></p>
                <p>Owner: <span className="font-semibold text-slate-700">Sarah Wilson</span></p>
              </div>
            </div>
            <Link
              href="/operations/exceptions/LOG-00042"
              className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-yellow-200 hover:bg-yellow-600 hover:text-white text-xs font-bold text-yellow-800 transition-all shadow-xs"
            >
              <span>Resolve Exception</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 15. Procurement Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Procurement Pipeline</h2>
            <p className="text-xs text-slate-500">
              Live lifecycle state across all active procurement orders. Click any stage to filter the workspace.
            </p>
          </div>
          <Link
            href="/operations/requests"
            className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
          >
            <span>Open requests table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {pipelineStages.map((st, idx) => (
            <button
              key={st.name}
              onClick={() => router.push(`/operations/requests?status=${encodeURIComponent(st.filter)}`)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between',
                st.color
              )}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 mb-1">
                <span>{idx + 1}.</span>
                <span className="truncate">{st.name}</span>
              </div>
              <p className="text-xl font-black text-slate-900">{st.count}</p>
              <span className="text-[10px] font-semibold text-[#2B4499] mt-1 opacity-0 hover:opacity-100 transition-opacity">
                Filter →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lower Row: Recent Activity & Performance Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 16. Request Activity (Timeline) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Recent Activity</h2>
            <Link
              href="/operations/audit"
              className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
            >
              <span>Full audit log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-black text-[#2B4499] shrink-0 mt-0.5">10:42 AM</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Customer Quote Generated</span>
                  <Link
                    href="/operations/requests/AH-P-000123"
                    className="text-xs font-black text-[#2B4499] hover:underline"
                  >
                    AH-P-000123
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Michael Chen generated Quote QUO-000123-v3 (NZ$485.00) for Toyota Hiace Control Arm
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-black text-emerald-700 shrink-0 mt-0.5">10:18 AM</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Payment Received & Verified</span>
                  <Link
                    href="/operations/requests/AH-P-000120"
                    className="text-xs font-black text-[#2B4499] hover:underline"
                  >
                    AH-P-000120
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  James Taylor reconciled NZ$420.00 settlement for Nissan Navara Alternator
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-black text-indigo-700 shrink-0 mt-0.5">09:45 AM</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Supplier Quotation Added</span>
                  <Link
                    href="/operations/requests/AH-P-000118"
                    className="text-xs font-black text-[#2B4499] hover:underline"
                  >
                    AH-P-000118
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sarah Wilson logged wholesale rate from Tokyo Auto Spares (TAS-JP) for Hilux Turbo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-black text-slate-600 shrink-0 mt-0.5">09:20 AM</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Request Assigned</span>
                  <Link
                    href="/operations/requests/AH-P-000117"
                    className="text-xs font-black text-[#2B4499] hover:underline"
                  >
                    AH-P-000117
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Michael Chen assigned Subaru Outback Steering Rack sourcing to Sarah Wilson
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 17. PERFORMANCE SNAPSHOT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Performance Snapshot</h2>
              <div className="p-1 rounded-lg bg-blue-50 text-[#2B4499]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Average Processing Time</p>
                  <p className="text-lg font-black text-slate-900">{metrics.avgProcessingDays} days</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Within SLA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Quote Conversion</p>
                  <p className="text-base font-black text-slate-900">{metrics.quoteConversionRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Payment Conversion</p>
                  <p className="text-base font-black text-slate-900">{metrics.paymentConversionRate}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Procurement Value</p>
                  <p className="text-lg font-black text-[#2B4499]">
                    NZ${metrics.activeProcurementValueNZD.toLocaleString()}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-500">24 active POs</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div>
                  <p className="text-xs text-amber-900 font-medium">Outstanding Customer Payments</p>
                  <p className="text-lg font-black text-amber-900">
                    NZ${metrics.outstandingPaymentsNZD.toLocaleString()}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  7 Invoices
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <Link
              href="/operations/reports"
              className="text-xs font-bold text-[#2B4499] hover:underline inline-flex items-center gap-1"
            >
              <span>View detailed operational & financial reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Create Modal */}
      <QuickCreateModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} />
    </div>
  );
}
