'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  ArrowLeft,
  Building2,
  Car,
  DollarSign,
  Clock,
  Send,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Printer,
  ShieldCheck,
  Truck,
  MessageSquare,
  Activity,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { PurchaseOrderItem, POStatus, ProcurementRequest } from '@/types/procurement';
import { POPreviewModal } from '@/components/procurement/modals/POPreviewModal';
import { ReportExceptionModal } from '@/components/procurement/modals/ReportExceptionModal';
import { INITIAL_PURCHASE_ORDERS, INITIAL_PROCUREMENT_REQUESTS } from '@/services/procurement/mockData';
import { EndToEndFlowNavigator } from '@/components/ui/EndToEndFlowNavigator';

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.orderId as string) || 'po_01';

  const resolvePO = (id: string): PurchaseOrderItem => {
    return (
      procurementService.getPurchaseOrderById(id) ||
      INITIAL_PURCHASE_ORDERS.find((p) => p.id.toLowerCase() === id.toLowerCase() || p.poNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_PURCHASE_ORDERS[0]
    );
  };

  const initialPO = resolvePO(rawId);
  const [po, setPo] = useState<PurchaseOrderItem>(initialPO);
  const [request, setRequest] = useState<ProcurementRequest | null>(() => {
    return procurementService.getRequestById(initialPO.requestId) || INITIAL_PROCUREMENT_REQUESTS[0];
  });
  const [etaDate, setEtaDate] = useState(initialPO.expectedDispatchDate);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportExceptionOpen, setReportExceptionOpen] = useState(false);
  const [actionDoneMsg, setActionDoneMsg] = useState('');

  const loadData = () => {
    const p = resolvePO(rawId);
    setPo(p);
    setEtaDate(p.expectedDispatchDate);
    const r = procurementService.getRequestById(p.requestId) || INITIAL_PROCUREMENT_REQUESTS[0];
    setRequest(r);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [rawId]);

  const handleUpdateStatus = (status: POStatus, msg: string) => {
    procurementService.updatePOStatus(po.id, status);
    setActionDoneMsg(msg);
    setTimeout(() => setActionDoneMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* End-to-End Order Flow Engine Bar */}
      <EndToEndFlowNavigator
        requestId={po.requestRef || 'AH-P-000123'}
        currentStatus={
          po.status === 'Fully Received'
            ? 'Delivered'
            : po.status === 'Supplier Confirmed' || po.status === 'Ordered' || po.status === 'Sent to Supplier'
            ? 'Ordered From Supplier'
            : 'Customer Approved'
        }
        onStatusChanged={loadData}
      />

      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/procurement/purchase-orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {po.poNumber}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  po.status === 'Ordered' || po.status === 'Supplier Confirmed'
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : po.status === 'Exception'
                    ? 'bg-red-50 text-brand-red border-red-200 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                )}
              >
                {po.status}
              </span>
              <span className="text-xs text-slate-400">
                • Ref Request: <strong className="text-slate-700">{po.requestRef}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              PO: {po.partName}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Download / Print PO
          </button>

          {po.status === 'Draft' && (
            <button
              onClick={() => handleUpdateStatus('Sent to Supplier', 'Purchase order officially transmitted to supplier.')}
              className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
            >
              <Send className="w-3.5 h-3.5" />
              Send PO to Supplier
            </button>
          )}

          {po.status === 'Sent to Supplier' && (
            <button
              onClick={() => handleUpdateStatus('Supplier Confirmed', 'Supplier confirmed order acceptance.')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Confirmed by Supplier
            </button>
          )}

          {po.status === 'Ordered' || po.status === 'Supplier Confirmed' ? (
            <button
              onClick={() => handleUpdateStatus('Fully Received', 'Goods successfully received and inspected at NZ facility.')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Received at NZ Facility
            </button>
          ) : null}

          <button
            onClick={() => setReportExceptionOpen(true)}
            className="px-3 py-2 rounded-xl bg-red-50 text-brand-red border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Exception
          </button>
        </div>
      </div>

      {actionDoneMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {actionDoneMsg}
        </div>
      )}

      {/* Grid: Supplier + Request & Part Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier & Delivery Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-blue" />
            Supplier & Delivery Details
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-sm font-bold text-slate-900">{po.supplierName}</p>
              <p className="text-slate-600">Contact: {po.supplierContact} ({po.supplierEmail})</p>
              <p className="text-slate-600 font-medium">Payment Terms: {po.paymentTerms}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Receiving Hub: {po.deliveryHub}</p>
              <p className="text-slate-600 text-[11px]">{po.deliveryAddress}</p>
              <p className="text-slate-600 font-medium mt-1">Incoterms: {po.shippingTerms}</p>
            </div>
          </div>
        </div>

        {/* Customer Request & Vehicle */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-600" />
            Customer Request & Part Details
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Customer: {po.customerName}</p>
              <p className="text-slate-600">Vehicle: {po.vehicleSummary}</p>
              <p className="text-brand-blue font-mono font-bold mt-1">Request Ref: {po.requestRef}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Part: {po.partName}</p>
              <p className="text-slate-600 font-mono">OEM #: {po.partNumber || 'Direct'}</p>
              <p className="font-extrabold text-slate-900">Quantity Ordered: {po.quantity} Unit(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Summary Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Purchase Order Financial Summary (NZD)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Unit Price</span>
            <span className="text-lg font-black text-slate-900">${po.unitPriceNZD.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">x {po.quantity} unit(s)</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Supplier Freight</span>
            <span className="text-lg font-black text-slate-900">${po.freightCostNZD.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">Air / Sea transit to NZ</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Export Tax / Duties</span>
            <span className="text-lg font-black text-slate-900">${po.taxNZD.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">Zero-rated export</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-brand-blue uppercase font-black block">Total PO Amount</span>
            <span className="text-2xl font-black text-brand-blue">${po.totalAmountNZD.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-700 font-semibold block">NZD Total Landed</span>
          </div>
        </div>
      </div>

      {/* Timeline & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-blue" />
            Order Execution Timeline
          </h2>

          <div className="space-y-3">
            {po.timeline.map((st, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5',
                    st.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {st.done ? '✓' : i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{st.stage}</p>
                  <p className="text-[11px] text-slate-400">Date: {st.date}</p>
                  {st.note && <p className="text-slate-600 text-[11px] mt-0.5">{st.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents & Notes (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Order Documents & Notes
          </h2>

          <div className="space-y-2">
            {po.documents.map((doc, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{doc.title}</p>
                  <p className="text-[11px] text-slate-400">{doc.size}</p>
                </div>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="text-brand-blue font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> View
                </button>
              </div>
            ))}
          </div>

          {po.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Handling Instructions:</span>
              <p className="text-[11px] leading-relaxed">{po.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <POPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        po={po}
      />
      <ReportExceptionModal
        isOpen={reportExceptionOpen}
        onClose={() => setReportExceptionOpen(false)}
        defaultRequestId={po.requestId}
      />
    </div>
  );
}
