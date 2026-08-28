'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Activity,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  Building2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Plane,
  Ship,
  Search,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { PurchaseOrderItem, ShipmentDispatchItem, ProcurementRequest } from '@/types/procurement';

export default function ProcurementTrackingPage() {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [shipments, setShipments] = useState<ShipmentDispatchItem[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setOrders(procurementService.getPurchaseOrders());
    setShipments(procurementService.getShipments());
    setRequests(procurementService.getRequests());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const trackingStages = [
    { title: 'Active Procurement', icon: Building2 },
    { title: 'Supplier Confirmed', icon: CheckCircle },
    { title: 'Awaiting Dispatch', icon: Clock },
    { title: 'Dispatched', icon: Truck },
    { title: 'Received at Facility', icon: PackageCheck },
    { title: 'Ready for Logistics', icon: Navigation },
  ];

  const filteredOrders = orders.filter((o) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.poNumber.toLowerCase().includes(q) ||
        o.requestRef.toLowerCase().includes(q) ||
        o.supplierName.toLowerCase().includes(q) ||
        o.partName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Procurement Order Tracking Pipeline
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
              Live Milestone Tracker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual milestone status system tracking orders from supplier lock-in through international freight handover
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/ready-for-dispatch"
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Ready for Dispatch Queue
          </Link>
        </div>
      </div>

      {/* 2. Pipeline Stage Summary Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs overflow-x-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Procurement Lifecycle Stage Progression
        </h3>

        <div className="flex items-center justify-between min-w-[700px] relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 -z-0" />

          {trackingStages.map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  <Icon className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-xs font-bold text-slate-900">{st.title}</span>
                <span className="text-[10px] text-slate-400">Step {i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, supplier, part, reference..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Active Orders Live Visual Timeline Cards */}
      <div className="space-y-4">
        {filteredOrders.map((po) => {
          const shp = shipments.find((s) => s.poNumber === po.poNumber);

          return (
            <div
              key={po.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-black text-brand-blue bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {po.poNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{po.partName}</h3>
                    <p className="text-xs text-slate-500">
                      Supplier: <strong className="text-slate-800">{po.supplierName}</strong> • Ref: {po.requestRef}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Landed Value:</span>
                    <span className="text-sm font-black text-emerald-700">NZD ${po.totalAmountNZD.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/procurement/purchase-orders/${po.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Progress Tracker Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {po.timeline.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 rounded-xl border flex flex-col justify-between transition-colors',
                      step.done
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase">
                          Stage 0{i + 1}
                        </span>
                        {step.done ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                      <p className="font-bold text-xs">{step.stage}</p>
                    </div>
                    <span className="text-[10px] opacity-80 mt-2 block">{step.date}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Hub Context */}
              <div className="p-3 bg-slate-50 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-600">
                <span>Receiving Hub: <strong className="text-slate-900">{po.deliveryHub}</strong></span>
                <span>Expected Dispatch: <strong className="text-brand-blue">{po.expectedDispatchDate}</strong></span>
                <span>Terms: <strong className="text-slate-900">{po.shippingTerms}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
