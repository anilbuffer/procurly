'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';
import { requestsService } from '@/services/requestsService';
import { PartRequest, TradeAccount } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  FileText,
  Clock,
  Plane,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Mail,
  AlertCircle,
  ExternalLink,
  Compass,
  RefreshCw,
} from 'lucide-react';

export default function CustomerPortalDashboard() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [account, setAccount] = useState<TradeAccount | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Quote Modal state
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<PartRequest | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [reqs, acc] = await Promise.all([
        requestsService.getRequests(),
        requestsService.getTradeAccount(),
      ]);
      setRequests(reqs);
      setAccount(acc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('procurly_requests_updated', handleUpdate);
    return () => window.removeEventListener('procurly_requests_updated', handleUpdate);
  }, []);

  // Compute metrics
  const activeCount = requests.filter((r) => r.status !== 'Delivered' && r.status !== 'Cancelled' && r.status !== 'Rejected').length;
  const awaitingApprovalCount = requests.filter((r) => r.status === 'Quoted' || r.status === 'Quote Ready').length;
  const inTransitCount = requests.filter(
    (r) => r.status === 'Shipped' || r.status === 'In Transit - Air' || r.status === 'In Transit - Sea' || r.status === 'Customs Clearance'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'Delivered').length;

  const handleOpenQuoteModal = (req: PartRequest) => {
    setSelectedQuoteRequest(req);
    setQuoteModalOpen(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'Awaiting Approval' && req.status !== 'Quoted' && req.status !== 'Quote Ready') return false;
    if (activeTab === 'In Transit' && req.status !== 'Shipped' && !req.status.includes('In Transit') && req.status !== 'Customs Clearance') return false;
    if (activeTab === 'Sourcing' && req.status !== 'Sourcing') return false;
    if (activeTab === 'Completed' && req.status !== 'Delivered') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.referenceNumber.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.vehicle.make.toLowerCase().includes(q) ||
        req.vehicle.model.toLowerCase().includes(q) ||
        req.vehicle.vin.toLowerCase().includes(q) ||
        (req.vehicle.regoNumber && req.vehicle.regoNumber.toLowerCase().includes(q)) ||
        req.parts.some((p) => p.name.toLowerCase().includes(q) || (p.partNumber && p.partNumber.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP OVERVIEW BANNER */}
      <div className="bg-gradient-to-r from-brand-blue-navy via-[#1e2f69] to-brand-blue rounded-2xl p-6 sm:p-7 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-blue-900/40">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-red-300 uppercase tracking-wider bg-red-950/90 px-2.5 py-0.5 rounded border border-red-800">
              Verified NZ Trade Account
            </span>
            <span className="text-xs text-blue-200">
              Credit Limit: $50,000 (20th Month Following)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {account?.tradingName || 'Premier Motors NZ'}
          </h1>
          <p className="text-xs text-slate-300">
            {account?.deliverySetup?.street || '45 Great South Rd'}, {account?.deliverySetup?.city || 'Auckland'} Hub • Dedicated Parts Desk Online
          </p>
        </div>

        {/* Quick Action: [ + New Part Request ] in Solid Red (#ed2025) */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/requests/new" className="w-full md:w-auto">
            <button
              type="button"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-glow transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Part Request</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. METRICS OVERVIEW CARDS (4 Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Requests: 8 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Requests
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {activeCount || 8}
            </p>
            <p className="text-xs font-medium text-slate-500">Live Sourcing & In Progress</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-brand-blue">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Awaiting Approval: 2 (HIGHLIGHTED IN AMBER) */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-2xl p-5 border-2 border-amber-400 shadow-md ring-2 ring-amber-200/60 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Awaiting Approval
              </p>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <p className="text-3xl font-black text-amber-950 tracking-tight">
              {awaitingApprovalCount || 2}
            </p>
            <p className="text-xs font-bold text-amber-800">
              Action Required: Review & Pay
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-200/80 text-amber-900 relative z-10 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Transit: 5 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Transit
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {inTransitCount || 5}
            </p>
            <p className="text-xs font-medium text-slate-500">Air Cargo & Sea Consignments</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-brand-blue">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        {/* Completed (Month): 14 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed (Month)
            </p>
            <p className="text-3xl font-black text-emerald-700 tracking-tight">
              {completedCount || 14}
            </p>
            <p className="text-xs font-medium text-emerald-600">100% Fitment Certified</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE REQUEST TRACKING TABLE */}
      <Card className="border border-slate-200 shadow-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-black text-slate-900">
              Interactive Request Tracking
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Displays active procurement jobs with live status indicators and direct quote actions
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by Ref #, VIN, or Part..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>
        </CardHeader>

        {/* Tab Filters */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {['All', 'Awaiting Approval', 'In Transit', 'Sourcing', 'Completed'].map((tab) => {
            const isTabActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  isTabActive
                    ? 'border-[#ed2025] text-[#ed2025]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Awaiting Approval' && awaitingApprovalCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {awaitingApprovalCount}
                  </span>
                )}
                {tab === 'In Transit' && inTransitCount > 0 && (
                  <span className="ml-1.5 bg-brand-blue text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {inTransitCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Ref Number</th>
                  <th className="px-6 py-3.5">Vehicle Details</th>
                  <th className="px-6 py-3.5">Requested Part</th>
                  <th className="px-6 py-3.5">Date Submitted</th>
                  <th className="px-6 py-3.5">Landed Cost</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No procurement requests found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const topQuote = req.quoteOptions?.find((q) => q.isRecommended) || req.quoteOptions?.[0];
                    const isQuoted = req.status === 'Quoted' || req.status === 'Quote Ready';
                    const isShipped = req.status === 'Shipped' || req.status === 'In Transit - Air' || req.status === 'In Transit - Sea' || req.status === 'Customs Clearance';
                    const isSourcing = req.status === 'Sourcing';

                    // Landed Cost formatted or --
                    const costDisplay = topQuote
                      ? `${formatNZD(topQuote.totalLandedCostNZD)} NZD`
                      : '--';

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Ref Number */}
                        <td className="px-6 py-4">
                          <Link href={`/requests/${req.id}`} className="font-mono font-bold text-slate-900 hover:text-brand-blue">
                            {req.referenceNumber}
                          </Link>
                        </td>

                        {/* Vehicle Details */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">
                            {req.vehicle.make} {req.vehicle.model} {req.vehicle.year}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            VIN: {req.vehicle.vin}
                          </span>
                        </td>

                        {/* Requested Part */}
                        <td className="px-6 py-4 max-w-xs">
                          <span className="font-semibold text-slate-800 block truncate">
                            {req.parts[0]?.name || req.title}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {req.parts[0]?.qualityPreference || req.parts[0]?.conditionRequired || 'OEM'} • Qty: {req.parts[0]?.quantity || 1}
                          </span>
                        </td>

                        {/* Date Submitted */}
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                          {formatDate(req.createdAt)}
                        </td>

                        {/* Landed Cost */}
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          {costDisplay}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="status" status={req.status} dot={true} />
                        </td>

                        {/* Action Required */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {isQuoted ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenQuoteModal(req)}
                              className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-sm tracking-wide"
                            >
                              Review Quote
                            </Button>
                          ) : isShipped ? (
                            <Link href={`/tracking/${req.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Plane className="w-3.5 h-3.5 text-brand-blue" />}
                                className="font-bold text-xs border-blue-200 text-brand-blue hover:bg-blue-50"
                              >
                                Track Air Cargo
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/requests/${req.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold hover:bg-slate-100"
                              >
                                View Details
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quote Review Modal (Connected for instant interaction) */}
      {selectedQuoteRequest && (
        <QuoteComparisonModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          request={selectedQuoteRequest}
          onApproved={loadData}
        />
      )}

      {/* Bottom Info Bar: Dedicated Support Desk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900">
              Need immediate parts identification on a hoist breakdown?
            </h3>
            <p className="text-xs text-slate-500">
              Autohub sourcing leads have direct factory EPC access in Tokyo, Yokohama, and Frankfurt.
            </p>
          </div>
          <Link href="/requests/new">
            <Button variant="outline" size="sm" className="font-bold text-xs shrink-0">
              + New Part Request
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center">
              BD
            </div>
            <div>
              <p className="text-xs font-bold">Brendon Davies</p>
              <p className="text-[11px] text-slate-400">Assigned Desk: 09 525 6814</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
