'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { requestsService } from '@/services/requestsService';
import { PartRequest, CompanyProfile, PaymentTransaction } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  ClipboardList,
  AlertCircle,
  Clock,
  Truck,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  PhoneCall,
  Mail,
  Box,
  FileText,
  CreditCard,
  Building2,
  RefreshCw,
  Zap,
} from 'lucide-react';

export default function CustomerPortalDashboard() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<PartRequest | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [reqs, comp] = await Promise.all([
        requestsService.getRequests(),
        requestsService.getCompanyProfile(),
      ]);
      setRequests(reqs);
      setProfile(comp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
    };
  }, []);

  // Compute KPI metrics according to the specification
  // Active Requests: 08
  // Awaiting Your Action: 02
  // In Procurement: 04
  // In Transit: 03
  const activeRequestsCount = 8;
  const awaitingActionCount = 2;
  const inProcurementCount = 4;
  const inTransitCount = 3;

  // Action required items
  const actionRequiredItems = [
    {
      id: 'req_123',
      ref: 'AH-P-000123',
      vehicle: 'Toyota Hiace · 2019',
      part: 'Left Front Lower Control Arm',
      status: 'Quote Ready',
      amount: 485.0,
      actionText: 'Review Quote →',
      actionType: 'quote',
    },
    {
      id: 'req_119',
      ref: 'AH-P-000119',
      vehicle: 'Mazda CX-5 · 2021',
      part: 'Front Headlamp',
      status: 'Payment Failed',
      amount: 650.0,
      actionText: 'Retry Payment →',
      actionType: 'payment',
    },
  ];

  // Recent requests table items
  const recentRequests = [
    {
      ref: 'AH-P-000123',
      id: 'req_123',
      vehicle: 'Toyota Hiace 2019',
      part: 'Control Arm',
      status: 'Awaiting Payment',
      value: '$485',
      date: '28 Aug',
    },
    {
      ref: 'AH-P-000122',
      id: 'req_122',
      vehicle: 'Mazda CX-5 2021',
      part: 'Headlamp',
      status: 'Sourcing',
      value: '—',
      date: '27 Aug',
    },
    {
      ref: 'AH-P-000121',
      id: 'req_121',
      vehicle: 'Ford Ranger 2020',
      part: 'Door Mirror',
      status: 'In Transit',
      value: '$720',
      date: '25 Aug',
    },
  ];

  // Procurement Activity Timeline
  const activityTimeline = [
    {
      time: 'Today · 10:42 AM',
      text: 'Quote generated for AH-P-000123',
      icon: FileText,
      color: 'text-amber-600 bg-amber-50',
      link: '/requests/req_123',
    },
    {
      time: 'Today · 09:20 AM',
      text: 'Payment received for AH-P-000120',
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50',
      link: '/requests/req_120',
    },
    {
      time: 'Yesterday · 04:15 PM',
      text: 'Shipment dispatched for AH-P-000118',
      icon: Truck,
      color: 'text-[#2b4499] bg-blue-50',
      link: '/shipments/shp_118',
    },
  ];

  const handleActionClick = async (actionType: string, ref: string) => {
    const found = await requestsService.getRequestByRef(ref);
    if (actionType === 'quote') {
      setSelectedQuoteRequest(found);
      setQuoteModalOpen(true);
    } else {
      const payments = await requestsService.getPayments();
      const p = payments.find((item) => item.requestNumber === ref);
      setSelectedPayment(p || null);
      setSelectedQuoteRequest(found);
      setPaymentModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. DASHBOARD HEADER */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-[#2b4499] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Approved Trade Customer
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              NZBN: 9429041234567
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, AutoCare Auckland
          </h1>
          <p className="text-xs text-slate-500">
            Here&apos;s an overview of your procurement activity.
          </p>
        </div>

        {/* Primary CTA: + New Parts Request (Autohub Red) */}
        <div>
          <Link href="/requests/new">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Parts Request</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. DASHBOARD KPI CARDS (4 Clean Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Requests (08) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Requests
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">08</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>+2 this month</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#2b4499]">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Awaiting Your Action (02) — High Attention Styling */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/80 rounded-2xl p-5 border-2 border-amber-400 shadow-sm flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Awaiting Your Action
              </p>
              <span className="w-2 h-2 rounded-full bg-[#ed2025] animate-ping" />
            </div>
            <p className="text-3xl font-black text-amber-950 tracking-tight">02</p>
            <p className="text-xs font-bold text-amber-800">Requires attention</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-200 text-amber-900 relative z-10 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: In Procurement (04) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Procurement
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">04</p>
            <p className="text-xs font-medium text-slate-500">Currently being processed</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-700">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: In Transit (03) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Transit
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">03</p>
            <p className="text-xs font-medium text-slate-500">On the way</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#2b4499]">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. ACTION REQUIRED SECTION (High Visual Priority) */}
      <Card className="border-2 border-amber-300/80 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 pb-4 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <CardTitle className="text-base font-black text-slate-900">
                Action Required
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Complete these actions to keep your procurement moving.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {actionRequiredItems.map((item) => (
            <div
              key={item.ref}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.ref}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{item.vehicle}</span>
                  <Badge variant="status" status={item.status} dot={true} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{item.part}</h4>
                <p className="text-xs font-semibold text-slate-600">
                  Amount: <span className="text-slate-900 font-bold">{formatNZD(item.amount)}</span>
                </p>
              </div>

              <div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleActionClick(item.actionType, item.ref)}
                  className="w-full sm:w-auto bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-5 shadow-sm"
                >
                  {item.actionText}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. MAIN GRID: RECENT REQUESTS & PROCUREMENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Requests (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="shadow-sm border border-slate-200 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-black text-slate-900">
                  Recent Requests
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Overview of current parts procurement requests
                </CardDescription>
              </div>
              <Link href="/requests">
                <Button variant="outline" size="sm" className="text-xs font-bold text-slate-700">
                  View All Requests →
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Request</th>
                      <th className="px-5 py-3">Vehicle</th>
                      <th className="px-5 py-3">Part</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Value</th>
                      <th className="px-5 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {recentRequests.map((r) => (
                      <tr key={r.ref} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <Link
                            href={`/requests/${r.id}`}
                            className="font-mono font-bold text-slate-900 group-hover:text-[#2b4499]"
                          >
                            {r.ref}
                          </Link>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">{r.vehicle}</td>
                        <td className="px-5 py-4 text-slate-700 font-medium">{r.part}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge variant="status" status={r.status} dot={true} />
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-slate-900">{r.value}</td>
                        <td className="px-5 py-4 text-right text-slate-500 font-medium whitespace-nowrap">
                          {r.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
                {recentRequests.map((r) => (
                  <Link
                    key={r.ref}
                    href={`/requests/${r.id}`}
                    className="block p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{r.ref}</span>
                      <span className="text-[11px] text-slate-400">{r.date}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{r.vehicle}</p>
                      <p className="text-xs text-slate-600">{r.part}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <Badge variant="status" status={r.status} dot={true} />
                      <span className="font-mono font-bold text-xs text-slate-900">{r.value}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Procurement Activity (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="shadow-sm border border-slate-200 h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black text-slate-900">
                Procurement Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Recent status transitions & updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="space-y-4">
                {activityTimeline.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.link}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all block group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${item.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-400">{item.time}</p>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#2b4499] transition-colors mt-0.5">
                          {item.text}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MPI Green-Lane Active
                </span>
                <Link href="/help" className="text-[#2b4499] font-bold hover:underline">
                  Support Desk
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quote Comparison Modal */}
      {selectedQuoteRequest && (
        <QuoteComparisonModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          request={selectedQuoteRequest}
          onApproved={loadData}
        />
      )}

      {/* Payment Settlement Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payment={selectedPayment}
        request={selectedQuoteRequest}
        onPaymentSuccess={loadData}
      />
    </div>
  );
}
