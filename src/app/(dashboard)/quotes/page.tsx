'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';
import { requestsService } from '@/services/requestsService';
import { PartRequest } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  Plane,
  Ship,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export default function QuotesPage() {
  const [requestsWithQuotes, setRequestsWithQuotes] = useState<PartRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PartRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const all = await requestsService.getRequests();
      const withQuotes = all.filter((r) => r.quoteOptions && r.quoteOptions.length > 0);
      setRequestsWithQuotes(withQuotes);
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

  const openCompareModal = (req: PartRequest) => {
    setSelectedRequest(req);
    setModalOpen(true);
  };

  const pendingQuotes = requestsWithQuotes.filter((r) => r.status === 'Quote Ready');
  const approvedQuotes = requestsWithQuotes.filter((r) => r.status !== 'Quote Ready');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Landed Cost Quotes & Freight Approvals
          </h1>
          <p className="text-xs text-slate-500">
            Compare Air vs. Sea options and approve quotes to trigger instant overseas packaging and dispatch.
          </p>
        </div>
      </div>

      {/* Pending Quotes Section (Requires Action) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
            Action Required: Pending Quotes ({pendingQuotes.length})
          </h2>
        </div>

        {pendingQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-500">
            All generated quotations have been approved and scheduled for dispatch!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingQuotes.map((req) => {
              const airOpt = req.quoteOptions?.find((q) => q.type.includes('air'));
              const seaOpt = req.quoteOptions?.find((q) => q.type.includes('sea'));

              return (
                <Card key={req.id} className="border-2 border-brand-red/30 shadow-card">
                  <CardHeader className="bg-red-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{req.referenceNumber}</span>
                        <Badge variant="status" status={req.status} dot={true} />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {req.vehicle.year} {req.vehicle.make} {req.vehicle.model} • {req.parts[0]?.name}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => openCompareModal(req)}
                      className="font-bold text-xs shadow-md tracking-wide"
                    >
                      Compare & Approve Quote
                    </Button>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {airOpt && (
                        <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-brand-red flex items-center gap-1.5">
                              <Plane className="w-4 h-4" /> Priority Air Express (Recommended)
                            </span>
                            <span className="text-xs font-bold text-slate-900">{airOpt.transitDays}</span>
                          </div>
                          <p className="text-2xl font-black text-slate-900">
                            {formatNZD(airOpt.totalLandedCostNZD)}{' '}
                            <span className="text-xs font-normal text-slate-500">Landed NZD</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            Estimated delivery to your workshop: <strong>{airOpt.estimatedDeliveryDate}</strong>
                          </p>
                        </div>
                      )}

                      {seaOpt && (
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
                              <Ship className="w-4 h-4" /> Consolidated Sea Freight
                            </span>
                            <span className="text-xs font-bold text-slate-900">{seaOpt.transitDays}</span>
                          </div>
                          <p className="text-2xl font-black text-slate-900">
                            {formatNZD(seaOpt.totalLandedCostNZD)}{' '}
                            <span className="text-xs font-normal text-slate-500">Landed NZD</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            Estimated delivery to your workshop: <strong>{seaOpt.estimatedDeliveryDate}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Approved / Completed Quotes Table */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Approved & Active Consignments ({approvedQuotes.length})
        </h2>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Ref & Date</th>
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Part Description</th>
                    <th className="px-6 py-3.5">Approved Freight</th>
                    <th className="px-6 py-3.5">Total Landed (NZD)</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedQuotes.map((req) => {
                    const approvedQuote =
                      req.quoteOptions?.find((q) => q.id === req.approvedQuoteId) ||
                      req.quoteOptions?.[0];

                    return (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {req.referenceNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{req.parts[0]?.name}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-brand-blue">
                            {req.selectedFreight || 'Air Freight (Express)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {approvedQuote ? formatNZD(approvedQuote.totalLandedCostNZD) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/requests/${req.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal for quote comparison */}
      {selectedRequest && (
        <QuoteComparisonModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          request={selectedRequest}
          onApproved={loadData}
        />
      )}
    </div>
  );
}
