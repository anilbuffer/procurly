'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { requestsService } from '@/services/requestsService';
import { PartRequest } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  Car,
  Clock,
  ArrowRight,
  Plane,
  Truck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';

export default function RequestsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All Vehicles');
  const [isLoading, setIsLoading] = useState(true);

  // Quote modal
  const [selectedQuoteRequest, setSelectedQuoteRequest] = useState<PartRequest | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const loadRequests = async () => {
    try {
      const data = await requestsService.getRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const handleUpdate = () => loadRequests();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
    };
  }, []);

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Awaiting Action', label: 'Awaiting Action' },
    { id: 'Sourcing', label: 'Sourcing' },
    { id: 'Quoted', label: 'Quoted' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
  ];

  // Vehicles list for filtering
  const vehicles = ['All Vehicles', ...Array.from(new Set(requests.map((r) => `${r.vehicle.make} ${r.vehicle.model}`)))];

  const filteredRequests = requests.filter((req) => {
    // Tab filter
    if (activeTab === 'Awaiting Action') {
      const isAction =
        req.status === 'Quote Ready' ||
        req.status === 'Quoted' ||
        req.status === 'Awaiting Customer Approval' ||
        req.status === 'Payment Failed' ||
        req.paymentStatus === 'Awaiting Payment' ||
        req.paymentStatus === 'Payment Failed';
      if (!isAction) return false;
    } else if (activeTab === 'Sourcing') {
      if (req.status !== 'Sourcing' && req.status !== 'Request Submitted') return false;
    } else if (activeTab === 'Quoted') {
      if (req.status !== 'Quote Ready' && req.status !== 'Quoted') return false;
    } else if (activeTab === 'In Progress') {
      const inProg =
        req.status === 'Customer Approved' ||
        req.status === 'Ordered From Supplier' ||
        req.status === 'Received At Shipping Facility' ||
        req.status.includes('In Transit') ||
        req.status === 'Customs Clearance' ||
        req.status === 'Out For Delivery';
      if (!inProg) return false;
    } else if (activeTab === 'Completed') {
      if (req.status !== 'Delivered' && req.status !== 'Closed') return false;
    }

    // Vehicle dropdown filter
    if (selectedVehicleFilter !== 'All Vehicles') {
      const vName = `${req.vehicle.make} ${req.vehicle.model}`;
      if (vName !== selectedVehicleFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        req.referenceNumber.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.vehicle.make.toLowerCase().includes(q) ||
        req.vehicle.model.toLowerCase().includes(q) ||
        req.vehicle.vin.toLowerCase().includes(q) ||
        (req.vehicle.regoNumber && req.vehicle.regoNumber.toLowerCase().includes(q)) ||
        req.parts.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.partNumber && p.partNumber.toLowerCase().includes(q))
        )
      );
    }

    return true;
  });

  const awaitingActionCount = requests.filter(
    (r) =>
      r.status === 'Quote Ready' ||
      r.status === 'Quoted' ||
      r.status === 'Awaiting Customer Approval' ||
      r.status === 'Payment Failed' ||
      r.paymentStatus === 'Awaiting Payment' ||
      r.paymentStatus === 'Payment Failed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View and manage all your automotive parts procurement requests.
          </p>
        </div>

        {/* Primary CTA: + New Parts Request */}
        <Link href="/requests/new">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-glow transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Parts Request</span>
          </button>
        </Link>
      </div>

      {/* Tabs & Search Filter Bar */}
      <Card className="shadow-card border border-slate-200">
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#ed2025] text-[#ed2025]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.id === 'Awaiting Action' && awaitingActionCount > 0 && (
                    <span className="bg-[#ed2025] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {awaitingActionCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pb-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests, VIN, part #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests List */}
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No Requests Yet</p>
                <p className="text-xs text-slate-400">
                  You haven&apos;t submitted a procurement request matching this filter.
                </p>
              </div>
              <Link href="/requests/new">
                <Button variant="primary" size="sm">
                  Start Your First Request →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const topQuote =
                  req.quoteOptions?.find((q) => q.isRecommended) || req.quoteOptions?.[0];
                const quoteVal = topQuote ? formatNZD(topQuote.totalLandedCostNZD) : '—';
                const isQuoteReady = req.status === 'Quote Ready' || req.status === 'Quoted';

                return (
                  <div
                    key={req.id}
                    className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Request Ref + Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/requests/${req.id}`}
                          className="font-mono text-sm font-black text-slate-900 hover:text-brand-blue"
                        >
                          {req.referenceNumber}
                        </Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-800">
                          {req.vehicle.make} {req.vehicle.model} · {req.vehicle.year}
                        </span>
                        <Badge variant="status" status={req.status} dot={true} />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {req.parts[0]?.name || req.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Submitted: <strong>{formatDate(req.createdAt)}</strong></span>
                        <span>•</span>
                        <span>VIN: <span className="font-mono">{req.vehicle.vin}</span></span>
                        <span>•</span>
                        <span>Quote: <strong className="text-slate-900 font-mono">{quoteVal}</strong></span>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {isQuoteReady && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedQuoteRequest(req);
                            setQuoteModalOpen(true);
                          }}
                          className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-sm"
                        >
                          Review Quote →
                        </Button>
                      )}

                      <Link href={`/requests/${req.id}`}>
                        <Button variant="outline" size="sm" className="text-xs font-semibold">
                          View Request →
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

      {/* Quote Comparison Modal */}
      {selectedQuoteRequest && (
        <QuoteComparisonModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          request={selectedQuoteRequest}
          onApproved={loadRequests}
        />
      )}
    </div>
  );
}
