'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  ArrowLeft,
  Search,
  FileText,
  GitCompare,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Download,
  MessageSquare,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  ProcurementRequest,
  SupplierQuoteItem,
  PurchaseOrderItem,
  ProcurementRequestStatus,
  SourcingStatus,
} from '@/types/procurement';
import { AddQuoteModal } from '@/components/procurement/modals/AddQuoteModal';
import { CreatePOModal } from '@/components/procurement/modals/CreatePOModal';
import { ReportExceptionModal } from '@/components/procurement/modals/ReportExceptionModal';
import { EndToEndFlowNavigator } from '@/components/ui/EndToEndFlowNavigator';
import {
  INITIAL_PROCUREMENT_REQUESTS,
  INITIAL_SUPPLIER_QUOTES,
  INITIAL_PURCHASE_ORDERS,
} from '@/services/procurement/mockData';

export default function ProcurementRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.requestId as string) || 'req_01';

  const resolveRequest = (id: string): ProcurementRequest => {
    return (
      procurementService.getRequestById(id) ||
      INITIAL_PROCUREMENT_REQUESTS.find((r) => r.id.toLowerCase() === id.toLowerCase() || r.requestNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_PROCUREMENT_REQUESTS[0]
    );
  };

  const [mounted, setMounted] = useState(false);
  const [request, setRequest] = useState<ProcurementRequest>(() => resolveRequest(rawId));
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>(() => {
    const list = procurementService.getQuotesByRequestId(resolveRequest(rawId).id);
    return list.length > 0 ? list : INITIAL_SUPPLIER_QUOTES.slice(0, 3);
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>(() => {
    const initReq = resolveRequest(rawId);
    const pos = procurementService.getPurchaseOrders().filter((p) => p.requestId === initReq.id || p.requestRef === initReq.requestNumber);
    return pos.length > 0 ? pos : INITIAL_PURCHASE_ORDERS.slice(0, 2);
  });
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Sourcing' | 'Supplier Quotes' | 'Purchase Order' | 'Documents' | 'Messages' | 'Activity'
  >('Overview');

  const [newNoteText, setNewNoteText] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [addQuoteOpen, setAddQuoteOpen] = useState(false);
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [reportExceptionOpen, setReportExceptionOpen] = useState(false);

  const loadData = () => {
    const req = resolveRequest(rawId);
    setRequest(req);
    const qList = procurementService.getQuotesByRequestId(req.id);
    setQuotes(qList.length > 0 ? qList : INITIAL_SUPPLIER_QUOTES.slice(0, 3));
    const pos = procurementService.getPurchaseOrders().filter((p) => p.requestId === req.id || p.requestRef === req.requestNumber);
    setPurchaseOrders(pos.length > 0 ? pos : INITIAL_PURCHASE_ORDERS.slice(0, 2));
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [rawId]);

  const handleStatusChange = (newStatus: ProcurementRequestStatus) => {
    procurementService.updateRequestStatus(request.id, newStatus);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    procurementService.addRequestInternalNote(request.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    procurementService.sendSupplierMessage('sup_tokyo_oem', newMessageText.trim(), false, request.id);
    setNewMessageText('');
  };

  const tabs: Array<'Overview' | 'Sourcing' | 'Supplier Quotes' | 'Purchase Order' | 'Documents' | 'Messages' | 'Activity'> = [
    'Overview',
    'Sourcing',
    'Supplier Quotes',
    'Purchase Order',
    'Documents',
    'Messages',
    'Activity',
  ];

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="space-y-6 animate-pulse">
        <div className="h-44 bg-[#0B1120] rounded-2xl border border-slate-800" />
        <div className="h-16 bg-white rounded-2xl border border-slate-200" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 0. INTERACTIVE END-TO-END FLOW NAVIGATOR & ROLE SWITCHER */}
      <EndToEndFlowNavigator
        requestId={request.requestNumber}
        currentStatus={request.status}
        onStatusChanged={loadData}
      />

      {/* 1. Top Back Button & Request Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/procurement/requests"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {request.requestNumber}
              </span>
              <span
                className={cn(
                  'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border',
                  request.priority === 'Urgent'
                    ? 'bg-red-50 text-brand-red border-red-200 animate-pulse'
                    : request.priority === 'High'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}
              >
                {request.priority} Priority
              </span>
              <span className="text-xs text-slate-400">• Created: {request.createdAt.split('T')[0]}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {request.part.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAddQuoteOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier Quote
          </button>
          <Link
            href={`/procurement/quote-comparison?requestId=${request.id}`}
            className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare Quotes ({quotes.length})
          </Link>
          <button
            onClick={() => setCreatePOOpen(true)}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Issue PO
          </button>
        </div>
      </div>

      {/* 2. Status & Owner Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Status
            </span>
            <select
              value={request.status}
              onChange={(e) => handleStatusChange(e.target.value as ProcurementRequestStatus)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none mt-0.5"
            >
              <option value="New">New</option>
              <option value="Sourcing">Sourcing</option>
              <option value="Awaiting Supplier">Awaiting Supplier</option>
              <option value="Quote Ready">Quote Ready</option>
              <option value="Customer Approved">Customer Approved</option>
              <option value="Payment Received">Payment Received</option>
              <option value="Ready for Procurement">Ready for Procurement</option>
              <option value="Ordered">Ordered</option>
              <option value="On Hold">On Hold</option>
              <option value="Exception">Exception</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sourcing Phase
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-1">
              {request.sourcingStatus}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Specialist
            </span>
            <span className="text-xs font-bold text-brand-blue block mt-1">
              {request.assignedTo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportExceptionOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-brand-red border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Exception
          </button>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all',
                activeTab === tab
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab}
              {tab === 'Supplier Quotes' && quotes.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {quotes.length}
                </span>
              )}
              {tab === 'Purchase Order' && purchaseOrders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
                  {purchaseOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. Tab Content Panels */}
      {/* TAB: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 Cols): Vehicle & Part & Sourcing Summary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Customer Summary & Vehicle Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-brand-blue" />
                Vehicle & Customer Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Customer */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Customer</p>
                  <p className="text-sm font-bold text-slate-900">{request.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {request.customerEmail}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {request.customerPhone}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {request.customerBranch}
                  </p>
                </div>

                {/* Vehicle */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Vehicle Specification</p>
                  <p className="text-sm font-bold text-slate-900">
                    {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                  </p>
                  <p className="text-slate-700 font-mono mt-1">
                    VIN: <span className="font-bold">{request.vehicle.vin}</span>
                  </p>
                  {request.vehicle.rego && (
                    <p className="text-slate-600">Rego: {request.vehicle.rego}</p>
                  )}
                  {request.vehicle.engineCode && (
                    <p className="text-slate-600">Engine: {request.vehicle.engineCode}</p>
                  )}
                  {request.vehicle.transmission && (
                    <p className="text-slate-600">Transmission: {request.vehicle.transmission}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Part Requirement Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                Part Requirement Specification
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Part Name</span>
                  <span className="font-bold text-slate-900">{request.part.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">OEM Part #</span>
                  <span className="font-mono font-bold text-brand-blue">{request.part.partNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Quantity</span>
                  <span className="font-extrabold text-slate-900">{request.part.quantity} Unit(s)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Quality Pref</span>
                  <span className="font-semibold text-emerald-700">{request.part.qualityPreference}</span>
                </div>
              </div>

              {request.part.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">Customer Notes: </span>
                  <span>{request.part.notes}</span>
                </div>
              )}
            </div>

            {/* Sourcing Workspace Summary & Quotes Matrix Link */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-sky-600" />
                  Sourcing Workspace & Quotes ({quotes.length})
                </h3>
                <Link
                  href={`/procurement/quote-comparison?requestId=${request.id}`}
                  className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
                >
                  Side-by-Side Comparison Matrix →
                </Link>
              </div>

              <div className="space-y-2.5">
                {quotes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No supplier quotes recorded yet. Click &ldquo;Add Supplier Quote&rdquo; to input quotes received from Japan, Europe, or Australia.
                  </div>
                ) : (
                  quotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{q.supplierName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {q.quoteNumber}
                          </span>
                          {q.isPreferred && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Selected Preferred
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5">{q.condition} • Lead Time: {q.leadTimeDisplay}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-700 block">
                          NZD ${q.totalCostNZD.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">Valid: {q.validUntil}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4 Cols): Timeline & Internal Notes */}
          <div className="lg:col-span-4 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-blue" />
                Procurement Timeline
              </h3>

              <div className="space-y-3">
                {request.timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-5 pb-3 border-l-2 border-slate-200 last:border-l-transparent text-xs">
                    <span className="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full bg-brand-blue" />
                    <p className="font-bold text-slate-900 leading-tight">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.timestamp.replace('T', ' ').slice(0, 16)}</p>
                    <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Notes Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Internal Procurement Notes
              </h3>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add confidential internal note..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="btn-red-polished text-white text-[11px] font-bold px-3 py-1 rounded-md shadow-xs disabled:opacity-50"
                >
                  Save Note
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                {request.internalNotes.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No notes yet.</p>
                ) : (
                  request.internalNotes.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{n.author}</span>
                        <span>{n.timestamp.slice(0, 10)}</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SOURCING */}
      {activeTab === 'Sourcing' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sourcing Workspace</h3>
              <p className="text-xs text-slate-500">Contact suppliers, send RFQs, and track responses</p>
            </div>
            <Link
              href={`/procurement/sourcing/${request.id}`}
              className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              Open Interactive Sourcing Screen →
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            Click above to access the dedicated 5-step sourcing workflow with supplier search, RFQ transmitter, and direct quote input.
          </p>
        </div>
      )}

      {/* TAB: SUPPLIER QUOTES */}
      {activeTab === 'Supplier Quotes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Supplier Quotations ({quotes.length})</h3>
            <button
              onClick={() => setAddQuoteOpen(true)}
              className="btn-red-polished text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Quote
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <div key={q.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{q.supplierName}</span>
                    <span className="font-mono text-xs text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {q.quoteNumber}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{q.partName} • {q.condition}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lead time: {q.leadTimeDisplay} • Freight: NZD ${q.freightCostNZD} • Valid: {q.validUntil}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    NZD ${q.totalCostNZD.toFixed(2)}
                  </span>
                  <Link
                    href={`/procurement/supplier-quotes/${q.id}`}
                    className="text-xs font-bold text-brand-blue hover:underline mt-1 inline-block"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PURCHASE ORDER */}
      {activeTab === 'Purchase Order' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          {/* Hard Rule 2 Banner */}
          {!['Payment Received', 'Ordered', 'Ordered From Supplier', 'Received At Shipping Facility', 'In Transit', 'Customs Clearance', 'Delivered', 'Closed'].includes(request.status) && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black uppercase tracking-wider block text-amber-800">
                  Hard Rule 2 Enforcement — Financial Clearance Required
                </span>
                <p className="mt-0.5 text-amber-700">
                  &ldquo;No procurement activity shall commence until payment confirmation or approved credit account verification.&rdquo; PO creation to overseas supplier (Tokyo Auto Spares) will unlock once Finance marks payment as received.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Purchase Orders Issued ({purchaseOrders.length})</h3>
            <button
              onClick={() => setCreatePOOpen(true)}
              className="btn-red-polished text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Issue Supplier PO
            </button>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No purchase orders issued yet for this request.
            </div>
          ) : (
            <div className="space-y-3">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">{po.poNumber}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {po.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{po.supplierName} • {po.partName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-brand-blue block">NZD ${po.totalAmountNZD.toFixed(2)}</span>
                    <Link
                      href={`/procurement/purchase-orders/${po.id}`}
                      className="text-xs font-bold text-brand-blue hover:underline mt-1 inline-block"
                    >
                      Open PO →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: DOCUMENTS */}
      {activeTab === 'Documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Attached Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {request.customerAttachments.map((att, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{att.name}</p>
                  <p className="text-[11px] text-slate-400">{att.size}</p>
                </div>
                <button className="text-brand-blue font-semibold hover:underline flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MESSAGES */}
      {activeTab === 'Messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Supplier & Internal Communications
          </h3>
          <p className="text-xs text-slate-500">
            Send internal notes or transmit messages to supplier contact representative.
          </p>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type message to supplier or internal record..."
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessageText.trim()}
              className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* TAB: ACTIVITY */}
      {activeTab === 'Activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Complete Audit Trail</h3>
          <div className="space-y-3">
            {request.timeline.map((tl, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{tl.title}</span>
                  <span className="text-[10px] text-slate-400">{tl.timestamp}</span>
                </div>
                <p className="text-slate-600">{tl.description}</p>
                <p className="text-[10px] text-slate-400">Actor: {tl.actor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddQuoteModal
        isOpen={addQuoteOpen}
        onClose={() => setAddQuoteOpen(false)}
        defaultRequestId={request.id}
      />
      <CreatePOModal
        isOpen={createPOOpen}
        onClose={() => setCreatePOOpen(false)}
        defaultRequestId={request.id}
      />
      <ReportExceptionModal
        isOpen={reportExceptionOpen}
        onClose={() => setReportExceptionOpen(false)}
        defaultRequestId={request.id}
      />
    </div>
  );
}
