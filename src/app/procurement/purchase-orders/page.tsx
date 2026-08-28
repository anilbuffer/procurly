'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Truck,
  Building2,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { PurchaseOrderItem, POStatus } from '@/types/procurement';
import { CreatePOModal } from '@/components/procurement/modals/CreatePOModal';

function PurchaseOrdersContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');
  const initialReqId = searchParams.get('requestId') || '';
  const initialQuoteId = searchParams.get('quoteId') || '';

  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [createPOOpen, setCreatePOOpen] = useState(initialAction === 'new');

  const loadData = () => {
    setOrders(procurementService.getPurchaseOrders());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const statuses: Array<POStatus | 'All'> = [
    'All',
    'Draft',
    'Pending Approval',
    'Sent to Supplier',
    'Supplier Confirmed',
    'Ordered',
    'Partially Received',
    'Fully Received',
    'Cancelled',
    'Exception',
  ];

  const filteredOrders = orders.filter((po) => {
    if (selectedStatus !== 'All' && po.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        po.poNumber.toLowerCase().includes(q) ||
        po.requestRef.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.customerName.toLowerCase().includes(q) ||
        po.partName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (st: POStatus) => {
    switch (st) {
      case 'Ordered':
      case 'Supplier Confirmed':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Sent to Supplier':
        return 'bg-blue-50 text-brand-blue border-blue-200';
      case 'Fully Received':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Exception':
        return 'bg-red-50 text-brand-red border-red-200 animate-pulse';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Metrics
  const totalValue = orders.reduce((acc, curr) => acc + curr.totalAmountNZD, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Fully Received' && o.status !== 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Purchase Orders Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filteredOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage binding supplier purchase orders, EDI acknowledgments, delivery ETAs, and receiving checkpoints
          </p>
        </div>

        <button
          onClick={() => setCreatePOOpen(true)}
          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Purchase Order
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Active Orders Value
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            NZD ${totalValue.toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Across active international vendors
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Active Purchase Orders
            </span>
            <ShoppingCart className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeOrdersCount}</p>
          <p className="text-[11px] text-brand-blue font-semibold mt-1">
            In supplier dispatch & transit pipeline
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Awaiting NZ Hub Delivery
            </span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {orders.filter((o) => o.status === 'Ordered' || o.status === 'Supplier Confirmed').length}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            ETA within next 3–5 days
          </p>
        </div>
      </div>

      {/* 3. Status Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {statuses.map((st) => {
          const count = st === 'All' ? orders.length : orders.filter((o) => o.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>{st}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  selectedStatus === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, supplier, customer, request ref..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 5. Purchase Order Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">PO #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Customer Request</th>
                <th className="py-3 px-4">Part / Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Target Dispatch</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                      <Link href={`/procurement/purchase-orders/${po.id}`} className="hover:underline">
                        {po.poNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{po.supplierName}</p>
                      <p className="text-[11px] text-slate-500">{po.supplierContact}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-700 block">
                        {po.requestRef}
                      </span>
                      <span className="text-[11px] text-slate-500">{po.customerName}</span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{po.partName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {po.partNumber || 'OEM Standard'}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {po.quantity}
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-brand-blue text-sm">
                      ${po.totalAmountNZD.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap',
                          getStatusBadge(po.status)
                        )}
                      >
                        {po.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {po.expectedDispatchDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/procurement/purchase-orders/${po.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-blue-dark group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Manage PO</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePOModal
        isOpen={createPOOpen}
        onClose={() => setCreatePOOpen(false)}
        defaultRequestId={initialReqId}
        defaultQuoteId={initialQuoteId}
      />
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading purchase orders...</div>}>
      <PurchaseOrdersContent />
    </Suspense>
  );
}
