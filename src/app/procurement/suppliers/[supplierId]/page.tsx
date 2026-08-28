'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ShoppingCart,
  FileText,
  MessageSquare,
  Activity,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { SupplierSummary, PurchaseOrderItem, SupplierQuoteItem } from '@/types/procurement';
import { INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, INITIAL_SUPPLIER_QUOTES } from '@/services/procurement/mockData';

export default function SupplierDetailPage() {
  const params = useParams();
  const rawId = (params?.supplierId as string) || 'sup_01';

  const resolveSupplier = (id: string): SupplierSummary => {
    return (
      procurementService.getSupplierById(id) ||
      INITIAL_SUPPLIERS.find((s) => s.id.toLowerCase() === id.toLowerCase()) ||
      INITIAL_SUPPLIERS.find((s) => s.name.toLowerCase().includes(id.toLowerCase())) ||
      INITIAL_SUPPLIERS[0]
    );
  };

  const initialSupplier = resolveSupplier(rawId);
  const [supplier, setSupplier] = useState<SupplierSummary>(initialSupplier);
  const [orders, setOrders] = useState<PurchaseOrderItem[]>(() => {
    const pos = procurementService.getPurchaseOrders().filter((p) => p.supplierId === initialSupplier.id);
    return pos.length > 0 ? pos : INITIAL_PURCHASE_ORDERS.slice(0, 3);
  });
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>(() => {
    const qs = procurementService.getSupplierQuotes().filter((q) => q.supplierId === initialSupplier.id);
    return qs.length > 0 ? qs : INITIAL_SUPPLIER_QUOTES.slice(0, 3);
  });
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Orders' | 'Quotes' | 'Performance' | 'Communications' | 'Documents' | 'Activity'
  >('Overview');

  const loadData = () => {
    const s = resolveSupplier(rawId);
    setSupplier(s);
    const pos = procurementService.getPurchaseOrders().filter((p) => p.supplierId === s.id);
    setOrders(pos.length > 0 ? pos : INITIAL_PURCHASE_ORDERS.slice(0, 3));
    const qs = procurementService.getSupplierQuotes().filter((q) => q.supplierId === s.id);
    setQuotes(qs.length > 0 ? qs : INITIAL_SUPPLIER_QUOTES.slice(0, 3));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [rawId]);

  const tabs: Array<'Overview' | 'Orders' | 'Quotes' | 'Performance' | 'Communications' | 'Documents' | 'Activity'> = [
    'Overview',
    'Orders',
    'Quotes',
    'Performance',
    'Communications',
    'Documents',
    'Activity',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/procurement/suppliers"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {supplier.code}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  supplier.status === 'Preferred'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-brand-blue border-blue-200'
                )}
              >
                {supplier.status}
              </span>
              <span className="text-xs text-slate-400">
                • Reliability Score: <strong className="text-brand-blue">{supplier.reliabilityScore}/100</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {supplier.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/procurement/supplier-communications?supplierId=${supplier.id}`}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Open Communications
          </Link>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Response Rate</span>
          <span className="text-xl font-black text-emerald-700">{supplier.responseRatePct}%</span>
          <span className="text-[10px] text-slate-400 block">RFQ conversion rate</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Response Time</span>
          <span className="text-xl font-black text-slate-900">{supplier.avgResponseTimeHours} hrs</span>
          <span className="text-[10px] text-slate-400 block">Fastest response tier</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Lead Time</span>
          <span className="text-xl font-black text-slate-900">{supplier.avgLeadTimeDays} Days</span>
          <span className="text-[10px] text-slate-400 block">Dispatch to NZ hub</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Order Fulfilment</span>
          <span className="text-xl font-black text-brand-blue">{supplier.orderCompletionPct}%</span>
          <span className="text-[10px] text-slate-400 block">Completed on schedule</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Exception Rate</span>
          <span className="text-xl font-black text-slate-700">{supplier.exceptionRatePct}%</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Extremely low</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
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
              {tab === 'Orders' && orders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {orders.length}
                </span>
              )}
              {tab === 'Quotes' && quotes.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {quotes.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. Tab Panels */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company & Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Company Information
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
              <p className="text-sm font-bold text-slate-900">{supplier.name}</p>
              <p className="text-slate-600">Location: {supplier.location}, {supplier.country}</p>
              <p className="text-slate-600">Primary Contact: {supplier.contactName}</p>
              <p className="text-slate-600">Email: {supplier.contactEmail}</p>
              <p className="text-slate-600">Phone: {supplier.contactPhone}</p>
              <p className="text-slate-500 italic mt-2">{supplier.notes}</p>
            </div>
          </div>

          {/* Specialization & Regions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Specialization & Operating Regions
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Brand Specializations
                </span>
                <div className="flex flex-wrap gap-1">
                  {supplier.specialization.map((sp, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-semibold text-[11px]">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Operating Regions
                </span>
                <div className="flex flex-wrap gap-1">
                  {supplier.operatingRegions.map((reg, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-brand-blue font-semibold text-[11px]">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Purchase Orders Placed ({orders.length})</h3>
          <div className="space-y-2">
            {orders.map((po) => (
              <div key={po.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-brand-blue">{po.poNumber}</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{po.partName}</p>
                  <p className="text-slate-500 text-[11px]">Customer: {po.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900">NZD ${po.totalAmountNZD.toFixed(2)}</span>
                  <Link href={`/procurement/purchase-orders/${po.id}`} className="text-xs font-bold text-brand-blue hover:underline block mt-0.5">
                    Open PO →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Quotes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Quotation History ({quotes.length})</h3>
          <div className="space-y-2">
            {quotes.map((q) => (
              <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-brand-blue">{q.quoteNumber}</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{q.partName}</p>
                  <p className="text-slate-500 text-[11px]">Lead: {q.leadTimeDisplay} • Status: {q.status}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700">NZD ${q.totalCostNZD.toFixed(2)}</span>
                  <Link href={`/procurement/supplier-quotes/${q.id}`} className="text-xs font-bold text-brand-blue hover:underline block mt-0.5">
                    View Quote →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Operational Intelligence Scorecard</h3>
          <p className="text-xs text-slate-600">
            Automated KPI analytics derived from historical RFQ response timestamps, packaging damage flags, and transit delivery integrity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Quote Conversion Rate</span>
              <p className="text-2xl font-black text-brand-blue">{supplier.responseRatePct}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Delivery Reliability</span>
              <p className="text-2xl font-black text-emerald-700">{supplier.orderCompletionPct}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Exception & RMA Rate</span>
              <p className="text-2xl font-black text-slate-700">{supplier.exceptionRatePct}%</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Communications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-brand-blue mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Supplier Communications Thread</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Directly message supplier sales and warehouse dispatch reps.
          </p>
          <Link
            href={`/procurement/supplier-communications?supplierId=${supplier.id}`}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl inline-block"
          >
            Open Dedicated Thread
          </Link>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Supplier Documents & Invoices</h3>
          <p className="text-slate-500">Repository of signed vendor agreements, proforma invoices, and compliance certs.</p>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Vendor Activity Stream</h3>
          <p className="text-slate-500">Vendor audit logs and quotation submissions logged on system.</p>
        </div>
      )}
    </div>
  );
}
