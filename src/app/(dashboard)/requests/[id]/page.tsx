'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Timeline } from '@/components/ui/Timeline';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';
import { requestsService } from '@/services/requestsService';
import { PartRequest } from '@/types';
import { formatNZD, formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Car,
  Plane,
  Ship,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  PhoneCall,
  Mail,
  Compass,
  AlertTriangle,
  Building2,
  FileCheck,
} from 'lucide-react';

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [request, setRequest] = useState<PartRequest | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!requestId) return;
    try {
      const data = await requestsService.getRequestById(requestId);
      setRequest(data);
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
  }, [requestId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !request) return;
    try {
      await requestsService.sendMessage(request.id, chatInput.trim());
      setChatInput('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 space-y-2">
        <p className="text-sm font-semibold">Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Request Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested consignment reference may have been moved or removed.
        </p>
        <Link href="/requests">
          <Button variant="outline" size="sm">
            Return to Requests
          </Button>
        </Link>
      </div>
    );
  }

  const isQuoteReady = request.status === 'Quote Ready';
  const isApproved = request.status === 'Quote Approved' || request.status.includes('In Transit') || request.status === 'Delivered';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/requests">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {request.referenceNumber}
              </h1>
              <Badge variant="status" status={request.status} dot={true} />
              {request.urgency.includes('Urgent') && (
                <Badge variant="urgent">URGENT HOIST</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Submitted on {formatDate(request.createdAt)} • Vehicle: {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isQuoteReady && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setQuoteModalOpen(true)}
              className="font-bold text-xs shadow-md tracking-wide"
            >
              Review & Approve Landed Quotes
            </Button>
          )}

          {request.status.includes('In Transit') && (
            <Link href={`/tracking/${request.id}`}>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Compass className="w-4 h-4" />}
                className="font-bold text-xs tracking-wide"
              >
                Live Consignment Tracking
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (8 cols): Parts details, Vehicle info, Landed Quotes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Vehicle Information Card */}
          <Card>
            <CardHeader className="bg-slate-50/60 flex flex-row items-center justify-between py-3.5">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-brand-blue" />
                <CardTitle className="text-sm font-bold">Vehicle Specifications</CardTitle>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Fitment Certified
              </span>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Make & Model</span>
                  <span className="font-bold text-slate-900">{request.vehicle.year} {request.vehicle.make} {request.vehicle.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">VIN / Chassis</span>
                  <span className="font-mono font-bold text-slate-900">{request.vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Engine Code</span>
                  <span className="font-semibold text-slate-800">{request.vehicle.engineCode || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Origin Market</span>
                  <span className="font-semibold text-slate-800">{request.vehicle.originMarket || 'Japan'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requested Parts List Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Requested Components ({request.parts.length})</CardTitle>
              <CardDescription>Verified parts matched against OEM parts catalogue</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {request.parts.map((p, idx) => (
                  <div key={p.id || idx} className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                        {p.partNumber && (
                          <p className="text-xs font-mono text-brand-blue font-semibold">
                            OEM Part #: {p.partNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="blue">{p.conditionRequired}</Badge>
                        <Badge variant="neutral">Qty: {p.quantity}</Badge>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {p.description}
                      </p>
                    )}

                    {p.damagePhotos && p.damagePhotos.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Attached Damage / Fitment Photos:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {p.damagePhotos.map((url, pIdx) => (
                            <div key={pIdx} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="Damage photo" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Landed Cost Quotations / Freight Selection Section */}
          {request.quoteOptions && request.quoteOptions.length > 0 && (
            <Card className={isQuoteReady ? "border-2 border-[#ed2025]/40 shadow-card" : ""}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                      REQUEST DETAILED QUOTE: {request.referenceNumber}
                    </span>
                    {isQuoteReady && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                        Action Required
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base font-black text-slate-900 mt-1">
                    FREIGHT SELECTION (Choose Shipping Option)
                  </CardTitle>
                </div>
                {isQuoteReady && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setQuoteModalOpen(true)}
                    className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-md tracking-wide"
                  >
                    Open Full Review Modal
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.quoteOptions.map((opt) => {
                    const isSelected = request.approvedQuoteId === opt.id || (!request.approvedQuoteId && opt.isRecommended);
                    const isAir = opt.type === 'air_express';
                    const title = isAir ? 'AIR FREIGHT - FASTEST' : 'SEA FREIGHT - ECONOMY';

                    return (
                      <div
                        key={opt.id}
                        onClick={() => isQuoteReady && setQuoteModalOpen(true)}
                        className={`p-5 rounded-2xl border-2 transition-all relative ${
                          isQuoteReady ? 'cursor-pointer hover:border-slate-400' : ''
                        } ${
                          isSelected
                            ? 'border-[#ed2025] bg-red-50/20 ring-2 ring-red-100 shadow-md'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-[#ed2025] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            {request.approvedQuoteId ? <CheckCircle2 className="w-3 h-3" /> : null}
                            {request.approvedQuoteId ? 'Approved' : 'Recommended'}
                          </span>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 rounded-xl ${isAir ? 'bg-red-50 text-[#ed2025]' : 'bg-blue-50 text-brand-blue'}`}>
                            {isAir ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{title}</h4>
                            <p className="text-[11px] text-slate-500">Transit Time: <strong>{opt.transitDays}</strong></p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Landed Price:</span>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {formatNZD(opt.totalLandedCostNZD)} NZD
                          </p>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                            Inc. Freight, Customs, GST
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Estimated Delivery:</span>
                            <span className="font-bold text-emerald-700">{opt.estimatedDeliveryDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Part Cost:</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.partCostNZD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>International Freight:</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.freightCostNZD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duties & GST (15%):</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.dutiesAndBiosecurityNZD + opt.gstNZD)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isQuoteReady && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Delivery Address: <strong>Premier Motors, 45 Great South Rd, Auckland</strong>
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setQuoteModalOpen(true)}
                      className="w-full sm:w-auto bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-6 py-2.5 shadow-md"
                    >
                      Review & Confirm Freight
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tracking Milestones Preview (if active) */}
          {request.trackingMilestones && request.trackingMilestones.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Consignment Milestone History</CardTitle>
                  <CardDescription>Real-time updates from international dispatch to workshop handover</CardDescription>
                </div>
                <Link href={`/tracking/${request.id}`}>
                  <Button variant="outline" size="sm" className="text-xs font-semibold">
                    Full Tracking Map
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-6">
                <Timeline milestones={request.trackingMilestones} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col (4 cols): Specialist chat, Delivery setup, Assigned desk */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assigned Specialist Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Dedicated Sourcing Specialist
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center font-bold text-base shadow-sm">
                BD
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Brendon Davies</h4>
                <p className="text-xs text-slate-400">Senior Sourcing Lead</p>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available Now
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-brand-red" />
                <span className="font-mono">09 525 6814</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-red" />
                <span>brendon.d@autohub.co.nz</span>
              </div>
            </div>
          </div>

          {/* Live Specialist Messaging Box */}
          <Card className="flex flex-col h-[400px]">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                Direct Specialist Messages
              </CardTitle>
            </CardHeader>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {request.messages && request.messages.length > 0 ? (
                request.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-brand-blue text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      <p className="text-[10px] font-bold opacity-75 mb-0.5">{m.senderName}</p>
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">{m.timestamp}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No messages yet. Ask your specialist anything about this request.
                </p>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Reply to Brendon..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
              <Button type="submit" variant="primary" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>

          {/* Delivery Destination Address */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                Workshop Delivery Site
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-2">
              <p className="font-bold text-slate-900">{request.deliveryAddress?.businessName || 'Premier Motors NZ'}</p>
              <p className="text-slate-600">
                {request.deliveryAddress?.street || '45 Great South Rd'}, {request.deliveryAddress?.suburb || 'Penrose'}, {request.deliveryAddress?.city || 'Auckland'} {request.deliveryAddress?.postcode || '1061'}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-500">
                <span>Forklift: {request.deliveryAddress?.hasForklift ? '✓ Yes' : 'No'}</span>
                <span>Dock: {request.deliveryAddress?.hasLoadingDock ? '✓ Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quote Comparison Modal */}
      <QuoteComparisonModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        request={request}
        onApproved={loadData}
      />
    </div>
  );
}
