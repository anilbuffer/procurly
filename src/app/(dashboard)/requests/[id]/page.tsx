'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';
import { DocumentPreviewModal } from '@/components/ui/DocumentPreviewModal';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { EndToEndFlowNavigator } from '@/components/ui/EndToEndFlowNavigator';
import { requestsService } from '@/services/requestsService';
import { PartRequest, PortalDocument, PaymentTransaction } from '@/types';
import { formatNZD, formatDate, getStatusDescription } from '@/lib/utils';
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
  AlertCircle,
  Building2,
  FileCheck,
  Download,
  MessageSquare,
  Truck,
  Box,
  CreditCard,
} from 'lucide-react';

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [request, setRequest] = useState<PartRequest | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [documentToView, setDocumentToView] = useState<PortalDocument | null>(null);
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
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
    };
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

  const handleDownloadQuote = async () => {
    if (!request) return;
    const docs = await requestsService.getDocuments('Quotes');
    const doc = docs.find((d) => d.requestId === request.id || d.requestNumber === request.referenceNumber);
    if (doc) {
      setDocumentToView(doc);
    } else {
      const topQuote = request.quoteOptions?.find((q) => q.isRecommended) || request.quoteOptions?.[0];
      const generatedDoc: PortalDocument = {
        id: `doc_${request.id}`,
        title: `Quotation — ${request.referenceNumber}`,
        category: 'Quotes',
        requestId: request.id,
        requestNumber: request.referenceNumber,
        date: formatDate(request.createdAt),
        fileFormat: 'PDF',
        fileSizeBytes: 245000,
        fileSizeFormatted: '245 KB',
        documentType: 'Quotation',
        previewData: {
          quoteNumber: `AH-Q-${request.referenceNumber.replace('AH-P-', '')}`,
          customerName: 'AutoCare Auckland (James Wilson)',
          vehicleDetails: `${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model} (VIN: ${request.vehicle.vin})`,
          partDetails: `${request.parts[0]?.name || request.title} (OEM: ${request.parts[0]?.partNumber || 'Verified Fitment'})`,
          items: [
            { desc: `${request.parts[0]?.name || request.title} (Genuine OEM)`, qty: 1, unitPrice: topQuote?.partCostNZD || 350.0, total: topQuote?.partCostNZD || 350.0 },
            { desc: 'International Freight (Priority Express)', qty: 1, unitPrice: topQuote?.freightCostNZD || 85.0, total: topQuote?.freightCostNZD || 85.0 },
            { desc: 'Autohub Verified Procurement & Logistics Service', qty: 1, unitPrice: topQuote?.procurementServiceNZD || 50.0, total: topQuote?.procurementServiceNZD || 50.0 },
          ],
          subtotal: topQuote?.totalLandedCostNZD || 485.0,
          gst: 0.0,
          total: topQuote?.totalLandedCostNZD || 485.0,
        },
      };
      setDocumentToView(generatedDoc);
    }
    setDocModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 space-y-2">
        <div className="w-8 h-8 border-2 border-[#ed2025] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Loading procurement request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-900">Request Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested consignment reference may have been moved or removed.
        </p>
        <Link href="/requests">
          <Button variant="outline" size="sm">
            Return to Requests List
          </Button>
        </Link>
      </div>
    );
  }

  // 8-stage primary workflow timeline definition
  const primaryWorkflow = [
    { id: 'Request Submitted', label: 'Request Submitted' },
    { id: 'Sourcing', label: 'Sourcing' },
    { id: 'Quote Ready', label: 'Quote Ready' },
    { id: 'Customer Approval', label: 'Customer Approval' },
    { id: 'Payment', label: 'Payment' },
    { id: 'Procurement', label: 'Procurement' },
    { id: 'Shipping', label: 'Shipping' },
    { id: 'Delivered', label: 'Delivered' },
  ];

  // Map request status to timeline index
  const getWorkflowStageIndex = (status: string) => {
    if (status === 'Request Submitted') return 0;
    if (status === 'Sourcing') return 1;
    if (status === 'Quote Ready' || status === 'Quoted' || status === 'Awaiting Customer Approval') return 2;
    if (status === 'Customer Approved') return 3;
    if (status === 'Awaiting Payment' || status === 'Payment Pending') return 4;
    if (status === 'Payment Received' || status === 'Ordered From Supplier' || status === 'Received At Shipping Facility') return 5;
    if (status.includes('In Transit') || status === 'Customs Clearance' || status === 'Out For Delivery') return 6;
    if (status === 'Delivered' || status === 'Completed') return 7;
    return 2;
  };

  const currentStageIndex = getWorkflowStageIndex(request.status);
  const isQuoteReady = request.status === 'Quote Ready' || request.status === 'Quoted' || request.status === 'Awaiting Customer Approval';
  const isAwaitingPayment = request.status === 'Awaiting Payment' || request.paymentStatus === 'Awaiting Payment';
  const isPaymentFailed = request.status === 'Payment Failed' || request.paymentStatus === 'Payment Failed';

  const topQuote = request.quoteOptions?.find((q) => q.isRecommended) || request.quoteOptions?.[0];

  return (
    <div className="space-y-6">
      {/* 0. INTERACTIVE END-TO-END FLOW NAVIGATOR & ROLE SWITCHER */}
      <EndToEndFlowNavigator
        requestId={request.referenceNumber}
        currentStatus={request.status}
        onStatusChanged={loadData}
      />

      {/* 1. TOP HEADER & THE 5 CRITICAL QUESTIONS BOX */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Link href="/requests">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {request.referenceNumber}
                </h1>
                <Badge variant="status" status={request.status} dot={true} />
              </div>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {request.vehicle.make} {request.vehicle.model} · {request.vehicle.year} — {request.parts[0]?.name || request.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQuote}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs font-semibold"
            >
              Download Quote
            </Button>

            {isQuoteReady && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setQuoteModalOpen(true)}
                className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-5 shadow-md"
              >
                Review Quote →
              </Button>
            )}

            {(isAwaitingPayment || isPaymentFailed) && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setPaymentModalOpen(true)}
                className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-5 shadow-md"
              >
                Pay Now →
              </Button>
            )}
          </div>
        </div>

        {/* The 5 Critical Questions Highlight Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block">01 — Request #</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{request.referenceNumber}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block">02 — Requested Item</span>
            <span className="font-bold text-slate-900 truncate block">{request.parts[0]?.name || request.title}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block">03 — Current Stage</span>
            <span className="font-bold text-brand-blue truncate block">{request.status}</span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 lg:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-brand-blue block">04 — What Happens Next?</span>
              <p className="text-[11px] text-slate-700 font-medium line-clamp-2">
                {getStatusDescription(request.status)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REQUEST PROGRESS TIMELINE (Visually Dominant) */}
      <Card className="shadow-card border border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 py-3.5 border-b border-slate-200">
          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">
            Request Progress Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {primaryWorkflow.map((step, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isFuture = idx > currentStageIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center text-center space-y-1.5 min-w-[80px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-[#ed2025] text-white ring-4 ring-red-100 shadow-md scale-110'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? '●' : '○'}
                    </div>
                    <span
                      className={`text-[11px] leading-tight ${
                        isCurrent
                          ? 'font-black text-[#ed2025]'
                          : isPast
                          ? 'font-bold text-slate-800'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < primaryWorkflow.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        idx < currentStageIndex ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Quotation breakdown, Freight options, Vehicle Specs, Parts info */}
        <div className="lg:col-span-8 space-y-6">
          {/* QUOTATION BREAKDOWN & FREIGHT OPTIONS */}
          {request.quoteOptions && request.quoteOptions.length > 0 && (
            <Card className="border-2 border-slate-200 shadow-card">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ed2025] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Your Procurement Quote
                  </span>
                  <CardTitle className="text-base font-black text-slate-900 mt-1">
                    Quotation & Freight Options
                  </CardTitle>
                </div>
                {isQuoteReady && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setQuoteModalOpen(true)}
                    className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs"
                  >
                    Accept Quote & Order
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Freight Options Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {request.quoteOptions.map((opt) => {
                    const isAir = opt.type === 'air' || opt.type === 'air_express';

                    return (
                      <div
                        key={opt.id}
                        className={`p-5 rounded-2xl border-2 transition-all relative ${
                          opt.isRecommended
                            ? 'border-[#ed2025] bg-red-50/20 shadow-sm'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {opt.isRecommended && (
                          <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-[#ed2025] text-white px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}

                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`p-2 rounded-xl ${
                              isAir ? 'bg-red-50 text-[#ed2025]' : 'bg-blue-50 text-brand-blue'
                            }`}
                          >
                            {isAir ? <Plane className="w-5 h-5" /> : <Ship className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{opt.name}</h4>
                            <p className="text-[11px] text-slate-500">
                              Estimated delivery: <strong>{opt.transitDays}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Total Landed Cost:
                          </span>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {formatNZD(opt.totalLandedCostNZD)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Transparent Landed Cost Breakdown */}
                {topQuote && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider block">
                      Procurement Cost Breakdown ({topQuote.name})
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-slate-700">
                        <span>Part</span>
                        <span className="font-mono font-bold text-slate-900">{formatNZD(topQuote.partCostNZD)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Freight</span>
                        <span className="font-mono font-bold text-slate-900">{formatNZD(topQuote.freightCostNZD)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Procurement Service</span>
                        <span className="font-mono font-bold text-slate-900">{formatNZD(topQuote.procurementServiceNZD || 50.0)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                        <span>TOTAL</span>
                        <span className="font-mono text-base text-[#ed2025]">{formatNZD(topQuote.totalLandedCostNZD)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* REQUEST OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Card */}
            <Card>
              <CardHeader className="bg-slate-50/60 py-3 px-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Car className="w-4 h-4 text-brand-blue" />
                  <span>Vehicle Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Make</span>
                    <span className="font-bold text-slate-900">{request.vehicle.make}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Model</span>
                    <span className="font-bold text-slate-900">{request.vehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Year</span>
                    <span className="font-bold text-slate-900">{request.vehicle.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">VIN</span>
                    <span className="font-mono font-bold text-slate-900">{request.vehicle.vin}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Part Card */}
            <Card>
              <CardHeader className="bg-slate-50/60 py-3 px-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Box className="w-4 h-4 text-brand-blue" />
                  <span>Requested Part Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Part</span>
                  <span className="font-bold text-slate-900">{request.parts[0]?.name || request.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity: <strong>{request.parts[0]?.quantity || 1}</strong></span>
                  <span>Preference: <strong>{request.parts[0]?.qualityPreference || 'Genuine'}</strong></span>
                </div>
                {request.parts[0]?.partNumber && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">OEM Part Code:</span>
                    <span className="font-mono font-bold text-brand-blue">{request.parts[0].partNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (4 cols): Messaging thread, Delivery Info, Assigned Specialist */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assigned Specialist Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Assigned Sourcing Specialist
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue text-white font-bold flex items-center justify-center">
                BD
              </div>
              <div>
                <p className="text-xs font-bold text-white">Brendon Davies</p>
                <p className="text-[11px] text-slate-400">Autohub Procurement Lead</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#ed2025]" />
                <span className="font-mono">09 525 6814</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ed2025]" />
                <span>brendon.d@autohub.co.nz</span>
              </div>
            </div>
          </div>

          {/* Customer Messages Thread Box */}
          <Card className="flex flex-col h-[380px]">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-blue" />
                <span>Message Autohub</span>
              </CardTitle>
            </CardHeader>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs custom-scrollbar">
              {request.messages && request.messages.length > 0 ? (
                request.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      <p className="text-[10px] font-bold opacity-75 mb-0.5">{m.senderName}</p>
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">{m.timestamp}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-10">
                  No messages yet. Ask anything about part fitment or transit.
                </p>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Write a message to Autohub..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
              <Button type="submit" variant="primary" size="icon" className="h-8 w-8 rounded-xl shrink-0">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>

          {/* Delivery Destination Card */}
          <Card>
            <CardHeader className="py-3 px-4 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-1.5">
              <p className="font-bold text-slate-900">{request.deliveryAddress?.businessName || 'AutoCare Auckland'}</p>
              <p className="text-slate-600">
                {request.deliveryAddress?.street || '12 Example Street'}, {request.deliveryAddress?.city || 'Auckland'}
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Submitted: <strong>{formatDate(request.createdAt)}</strong>
              </p>
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

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        document={documentToView}
      />

      {/* Payment Settlement Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payment={null}
        request={request}
        onPaymentSuccess={loadData}
      />
    </div>
  );
}
