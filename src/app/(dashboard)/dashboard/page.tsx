'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [account, setAccount] = useState<TradeAccount | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const activeCount = requests.filter((r) => r.status !== 'Delivered' && r.status !== 'Cancelled').length;
  const quoteReadyCount = requests.filter((r) => r.status === 'Quote Ready').length;
  const inTransitCount = requests.filter(
    (r) => r.status === 'In Transit - Air' || r.status === 'In Transit - Sea' || r.status === 'Customs Clearance'
  ).length;
  const deliveredCount = requests.filter((r) => r.status === 'Delivered').length;

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'Quote Ready' && req.status !== 'Quote Ready') return false;
    if (activeTab === 'In Transit' && !req.status.includes('In Transit') && req.status !== 'Customs Clearance') return false;
    if (activeTab === 'Delivered' && req.status !== 'Delivered') return false;
    if (activeTab === 'Sourcing' && req.status !== 'Sourcing') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.referenceNumber.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.vehicle.make.toLowerCase().includes(q) ||
        req.vehicle.model.toLowerCase().includes(q) ||
        req.vehicle.vin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome / Trade Status Banner */}
      <div className="bg-gradient-to-r from-brand-blue-navy via-[#1e2f69] to-brand-blue rounded-2xl p-6 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
              Verified NZ Trade Account
            </span>
            <span className="text-xs text-blue-200">
              Credit Limit: $50,000 (20th Month Following)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kia ora, {account?.primaryContact?.name || 'Marcus'}!
          </h1>
          <p className="text-xs text-slate-300">
            {account?.legalBusinessName || 'Apex Precision Automotive Group Ltd'} • {account?.deliverySetup?.city || 'Auckland'} Hub
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/requests/new" className="w-full md:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full md:w-auto font-bold text-xs shadow-md tracking-wide"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Part Request
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Requests"
          value={activeCount}
          changeText="Live Sourcing / In Progress"
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-blue-50 text-brand-blue"
        />
        <StatCard
          title="Quotes Ready"
          value={quoteReadyCount}
          changeText={quoteReadyCount > 0 ? "Action required: Review & dispatch" : "All quotes approved"}
          icon={<Clock className="w-5 h-5" />}
          iconBg={quoteReadyCount > 0 ? "bg-red-50 text-brand-red animate-pulse" : "bg-slate-100 text-slate-600"}
          className={quoteReadyCount > 0 ? "border-brand-red/40 ring-1 ring-red-100" : ""}
        />
        <StatCard
          title="Consignments In Transit"
          value={inTransitCount}
          changeText="Air / Sea Freight Active"
          icon={<Plane className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="Delivered This Month"
          value={deliveredCount}
          changeText="100% Fitment Certified"
          isPositive={true}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Urgent Quote Alert Banner (if quoteReadyCount > 0) */}
      {quoteReadyCount > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-red text-white shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">1 Landed Quotation Ready for Trade Approval</span>
              <span className="text-red-700">
                2022 Ford Ranger Wildtrak (AH-P-000124) - Express Air & Consolidated Sea options available.
              </span>
            </div>
          </div>
          <Link href="/requests/req_102">
            <Button variant="primary" size="sm" className="text-xs font-bold shrink-0">
              Review Quote Options
            </Button>
          </Link>
        </div>
      )}

      {/* Main Content Area: Requests Table with Filters */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Trade Parts Procurement Requests</CardTitle>
            <CardDescription>
              Track all vehicle part requests, quote reviews, and international consignments
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter requests or VIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
        </CardHeader>

        {/* Tab Filters */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {['All', 'Quote Ready', 'In Transit', 'Sourcing', 'Delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === tab
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
              {tab === 'Quote Ready' && quoteReadyCount > 0 && (
                <span className="ml-1.5 bg-brand-red text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {quoteReadyCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Reference & Date</th>
                  <th className="px-6 py-3.5">Vehicle & VIN</th>
                  <th className="px-6 py-3.5">Requested Part(s)</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Landed Cost (NZD)</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No part requests matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const topQuote = req.quoteOptions?.find((q) => q.isRecommended) || req.quoteOptions?.[0];
                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/requests/${req.id}`} className="block">
                            <span className="font-mono font-bold text-slate-900 group-hover:text-brand-blue block">
                              {req.referenceNumber}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(req.createdAt)}
                            </span>
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <Link href={`/requests/${req.id}`} className="block">
                            <span className="font-bold text-slate-900 block">
                              {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              VIN: {req.vehicle.vin}
                            </span>
                          </Link>
                        </td>

                        <td className="px-6 py-4 max-w-xs">
                          <Link href={`/requests/${req.id}`} className="block">
                            <span className="font-semibold text-slate-800 truncate block">
                              {req.parts[0]?.name || req.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {req.parts[0]?.conditionRequired} • Qty: {req.parts[0]?.quantity || 1}
                            </span>
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant="status" status={req.status} dot={true} />
                        </td>

                        <td className="px-6 py-4">
                          {topQuote ? (
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {formatNZD(topQuote.totalLandedCostNZD)}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {topQuote.transitDays}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Calculating quote...</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link href={`/requests/${req.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue"
                            >
                              View Details
                            </Button>
                          </Link>
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

      {/* Bottom Row: Dedicated Specialist & Fast Support */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Need assistance with an urgent vehicle on the hoist?
            </h3>
            <p className="text-xs text-slate-500">
              Your assigned Autohub parts specialist can search live Japanese auctions and European factory inventories directly.
            </p>
          </div>
          <Link href="/requests/new">
            <Button variant="primary" size="md" className="font-bold text-xs shrink-0">
              Submit Fast Request
            </Button>
          </Link>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Specialist
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center font-bold text-sm">
              BD
            </div>
            <div>
              <p className="text-xs font-bold text-white">Brendon Davies</p>
              <p className="text-[11px] text-slate-400">Senior Sourcing Lead</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>Direct: 09 525 6814</span>
            <span className="text-red-400">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
