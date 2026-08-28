'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { requestsService } from '@/services/requestsService';
import { PartRequest } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  PlusCircle,
  Search,
} from 'lucide-react';

function RequestsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get('q') || '' : '';

  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await requestsService.getRequests(statusFilter, searchQuery);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            All Part Procurement Requests
          </h1>
          <p className="text-xs text-slate-500">
            View, search, and manage all your workshop parts sourcing and logistics requests.
          </p>
        </div>

        <Link href="/requests/new">
          <Button
            variant="primary"
            size="md"
            className="font-bold text-xs shadow-md tracking-wide"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            New Part Request
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ref #, VIN, Make, Model, or Part..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Quote Ready', 'In Transit - Air', 'In Transit - Sea', 'Customs Clearance', 'Delivered', 'Sourcing'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Vehicle Information</th>
                  <th className="px-6 py-3.5">Component & Required Condition</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Landed Quote</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500">
                      No procurement requests found matching your filters.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
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

                        <td className="px-6 py-4 max-w-sm">
                          <Link href={`/requests/${req.id}`} className="block">
                            <span className="font-semibold text-slate-800 block truncate">
                              {req.parts[0]?.name || req.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {req.parts[0]?.conditionRequired} • {req.parts[0]?.category}
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
                            <span className="text-slate-400 italic">Sourcing quotes...</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/requests/${req.id}`}>
                              <Button variant="outline" size="sm" className="text-xs font-semibold">
                                View
                              </Button>
                            </Link>
                            {req.status.includes('In Transit') && (
                              <Link href={`/tracking/${req.id}`}>
                                <Button variant="primary" size="sm" className="text-xs font-semibold">
                                  Track
                                </Button>
                              </Link>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function AllRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading requests...</div>}>
      <RequestsContent />
    </Suspense>
  );
}
