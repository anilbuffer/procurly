'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  FileText,
  CheckCircle2,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  Building2,
  Truck,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  ProcurementRequest,
  SupplierQuoteItem,
  PurchaseOrderItem,
  ProcurementTaskItem,
  ProcurementExceptionItem,
  ProcurementStaffUser,
} from '@/types/procurement';

export default function ProcurementDashboardPage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>([]);
  const [pos, setPos] = useState<PurchaseOrderItem[]>([]);
  const [tasks, setTasks] = useState<ProcurementTaskItem[]>([]);
  const [exceptions, setExceptions] = useState<ProcurementExceptionItem[]>([]);
  const [currentUser, setCurrentUser] = useState<ProcurementStaffUser>(() => procurementService.getDefaultUser());

  const loadData = () => {
    setRequests(procurementService.getRequests());
    setQuotes(procurementService.getSupplierQuotes());
    setPos(procurementService.getPurchaseOrders());
    setTasks(procurementService.getTasks());
    setExceptions(procurementService.getExceptions());
    setCurrentUser(procurementService.getCurrentUser());
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

  // Calculated KPI metrics directly mapped to 8 Engine statuses
  const newRequestsCount = requests.filter((r) => (r.status as string) === 'New' || (r.status as string) === 'Submitted' || (r.status as string) === 'Request Submitted').length;
  const sourcingInProgressCount = requests.filter((r) => (r.status as string) === 'Sourcing' || (r.status as string) === 'Awaiting Supplier').length;
  const quotesAwaitingReviewCount = quotes.filter((q) => q.status === 'Received' || q.status === 'Under Review').length;
  const approvedForProcurementCount = requests.filter((r) => (r.status as string) === 'Payment Received' || (r.status as string) === 'Ready for Procurement' || (r.status as string) === 'Financially Cleared').length;
  const activePOsCount = pos.filter((p) => p.status !== 'Fully Received' && p.status !== 'Cancelled').length;
  const exceptionsCount = exceptions.filter((e) => e.stage !== 'Close').length;

  const urgentTasks = tasks.filter((t) => !t.isCompleted).slice(0, 4);
  const activeSourcingReqs = requests.filter((r) => r.sourcingStatus !== 'Sourcing Complete').slice(0, 4);
  const recentQuotes = quotes.slice(0, 4);
  const recentPOs = pos.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Procurement Command Centre</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Kia Ora, {currentUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Active procurement workstation. You have{' '}
              <span className="text-amber-300 font-bold">{urgentTasks.length} pending action tasks</span>,{' '}
              <span className="text-sky-300 font-bold">{sourcingInProgressCount} requests in sourcing</span>, and{' '}
              <span className="text-red-300 font-bold">{exceptionsCount} active exceptions</span> requiring resolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/procurement/quote-comparison"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Compare Quotes
            </Link>
            <Link
              href="/procurement/sourcing"
              className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-brand-red/40"
            >
              <Search className="w-3.5 h-3.5" />
              Open Sourcing Queue
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Today's Procurement Summary & 6 KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today&apos;s Procurement Summary & KPIs
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Live auto-synced with Japanese & European supply networks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: New Requests */}
          <Link
            href="/procurement/requests?status=New"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                New Requests
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {newRequestsCount}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>Awaiting review</span>
            </p>
          </Link>

          {/* Card 2: Sourcing in Progress */}
          <Link
            href="/procurement/sourcing"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Sourcing Active
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {sourcingInProgressCount}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              RFQs in market
            </p>
          </Link>

          {/* Card 3: Quotes Awaiting Review */}
          <Link
            href="/procurement/supplier-quotes"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Quotes Pending
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {quotesAwaitingReviewCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Received quotes
            </p>
          </Link>

          {/* Card 4: Approved for Procurement */}
          <Link
            href="/procurement/requests?status=Payment+Received"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Ready to Order
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {approvedForProcurementCount}
            </p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">
              Payment confirmed
            </p>
          </Link>

          {/* Card 5: Active Purchase Orders */}
          <Link
            href="/procurement/purchase-orders"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Active POs
              </span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {activePOsCount}
            </p>
            <p className="text-[11px] text-sky-600 font-semibold mt-1">
              Orders placed
            </p>
          </Link>

          {/* Card 6: Procurement Exceptions */}
          <Link
            href="/procurement/exceptions"
            className="bg-white rounded-xl p-4 border border-red-200/80 bg-red-50/20 shadow-xs hover:shadow-md hover:border-red-300 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red">
                Exceptions
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-100 text-brand-red flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-brand-red leading-tight">
              {exceptionsCount}
            </p>
            <p className="text-[11px] text-brand-red font-bold mt-1 animate-pulse">
              Action required
            </p>
          </Link>
        </div>
      </div>

      {/* 3. Two-Column Operational Layout: Priority Tasks & Active Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Procurement Tasks (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  Priority Procurement Tasks
                </h3>
              </div>
              <Link
                href="/procurement/tasks"
                className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1"
              >
                View all tasks ({tasks.length}) <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {urgentTasks.map((t) => (
                <div
                  key={t.id}
                  className="py-3 flex items-start justify-between gap-3 group hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => procurementService.toggleTaskComplete(t.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-emerald-600 flex items-center justify-center shrink-0 text-white hover:bg-emerald-50 transition-colors"
                      title="Mark task completed"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded',
                            t.priority === 'Urgent'
                              ? 'bg-red-100 text-brand-red border border-red-200'
                              : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {t.priority}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {t.requestRef}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          • {t.customerName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-1">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Vehicle: {t.vehicleSummary} • Assigned: {t.assignedTo}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={t.targetUrl}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-red hover:text-white text-[11px] font-semibold text-slate-700 transition-all shrink-0 self-center"
                  >
                    Action →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active Sourcing Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Sourcing Queue
                </h3>
                <p className="text-xs text-slate-600">
                  Sourcing live quotes across OEM and aftermarket distributors
                </p>
              </div>
              <Link
                href="/procurement/sourcing"
                className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1"
              >
                Full Sourcing Queue <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2">
                  <tr>
                    <th className="py-2">Request</th>
                    <th className="py-2">Part Required</th>
                    <th className="py-2 text-center">Quotes</th>
                    <th className="py-2">Sourcing Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeSourcingReqs.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 pr-2">
                        <span className="font-bold text-slate-900 block">{req.requestNumber}</span>
                        <span className="text-[11px] text-slate-600 truncate block max-w-[120px]">
                          {req.customerName}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="font-medium text-slate-800 line-clamp-1 block">
                          {req.part.name}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                          {req.quotesCount}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            req.sourcingStatus === 'Quote Received'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : req.sourcingStatus === 'Supplier Contacted'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {req.sourcingStatus}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/procurement/sourcing/${req.id}`}
                          className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark"
                        >
                          Source →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Supplier Quote Activity & Purchase Orders (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Supplier Quote Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Supplier Quotes
              </h3>
              <Link
                href="/procurement/supplier-quotes"
                className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1"
              >
                All Quotes <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/procurement/supplier-quotes/${q.id}`}
                  className="block p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-blue">
                      {q.quoteNumber} • {q.supplierName}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      NZD ${q.totalCostNZD.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{q.partName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Lead Time: <strong className="text-slate-700">{q.leadTimeDisplay}</strong></span>
                    <span>Ref: <strong className="text-slate-700">{q.requestRef}</strong></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Purchase Order Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Purchase Order Status
              </h3>
              <Link
                href="/procurement/purchase-orders"
                className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1"
              >
                All POs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentPOs.map((po) => (
                <Link
                  key={po.id}
                  href={`/procurement/purchase-orders/${po.id}`}
                  className="block p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-blue font-mono">
                      {po.poNumber}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        po.status === 'Ordered' || po.status === 'Supplier Confirmed'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : po.status === 'Exception'
                          ? 'bg-red-50 text-brand-red border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {po.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{po.partName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{po.supplierName}</span>
                    <span className="font-bold text-slate-800">NZD ${po.totalAmountNZD.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Procurement Timeline & Recent Activity Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-slate-900">
              Procurement Audit & Operational Activity Timeline
            </h3>
          </div>
          <span className="text-xs text-slate-400">Live event stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {requests.slice(0, 3).map((r) => (
            <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{r.requestNumber}</span>
                <span className="text-[10px] font-semibold text-slate-500">{r.updatedAt.split('T')[0]}</span>
              </div>
              <p className="text-xs font-medium text-slate-700 line-clamp-1">{r.part.name}</p>
              <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                {r.timeline.slice(0, 2).map((tl, i) => (
                  <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">{tl.title}: </span>
                      <span>{tl.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
