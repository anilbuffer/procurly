'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Search,
  Navigation,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function ShipmentsCommandPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    setRequests(operationsService.getRequests());
    const handleUpdate = () => setRequests(operationsService.getRequests());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const shipmentRequests = requests.filter((r) => {
    if (!r.shipment && r.status !== 'In Transit' && r.status !== 'Customs Clearance' && r.status !== 'Delivered') {
      return false;
    }
    if (activeFilter === 'in-transit') {
      return r.shipment?.status === 'In Transit' || r.status === 'In Transit';
    }
    if (activeFilter === 'delivery') {
      return r.shipment?.status === 'Delivered' || r.status === 'Delivered' || r.status === 'Out For Delivery';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 36. Header & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Logistics & Shipments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor procurement shipments from dispatch through customs and final workshop delivery.
          </p>
        </div>
      </div>

      {/* 36. Logistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveFilter('All')}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#2B4499] text-left transition-all shadow-xs"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ready to Ship</span>
          <p className="text-xl font-black text-slate-900">04</p>
          <span className="text-[10px] text-slate-500">At origin hubs</span>
        </button>

        <button
          onClick={() => setActiveFilter('in-transit')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all shadow-xs',
            activeFilter === 'in-transit' ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-200' : 'bg-white border-slate-200 hover:border-cyan-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-cyan-700 block mb-1">In Transit</span>
          <p className="text-xl font-black text-cyan-900">08</p>
          <span className="text-[10px] text-cyan-600">Air & Sea cargo</span>
        </button>

        <button
          onClick={() => setActiveFilter('All')}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#2B4499] text-left transition-all shadow-xs"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Arrived NZ</span>
          <p className="text-xl font-black text-slate-900">03</p>
          <span className="text-[10px] text-slate-500">AKL / WLG Ports</span>
        </button>

        <button
          onClick={() => setActiveFilter('All')}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#2B4499] text-left transition-all shadow-xs"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customs Clearance</span>
          <p className="text-xl font-black text-purple-900">02</p>
          <span className="text-[10px] text-purple-600">MPI & Biosecurity</span>
        </button>

        <button
          onClick={() => setActiveFilter('delivery')}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all shadow-xs',
            activeFilter === 'delivery' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-500'
          )}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Delivered</span>
          <p className="text-xl font-black text-emerald-900">31</p>
          <span className="text-[10px] text-emerald-600">Complete & signed</span>
        </button>

        <Link
          href="/operations/exceptions"
          className="p-3.5 bg-red-50/70 rounded-2xl border border-red-300 hover:border-red-500 text-left transition-all shadow-xs"
        >
          <span className="text-[10px] uppercase font-black text-red-700 block mb-1">Exceptions</span>
          <p className="text-xl font-black text-red-700">01</p>
          <span className="text-[10px] text-red-600 font-semibold">LOG-00042</span>
        </Link>
      </div>

      {/* 37. Shipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900">Active Shipments Ledger ({shipmentRequests.length})</h2>
          <span className="text-xs text-slate-500">Live Carrier Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Shipment #</th>
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Carrier / Tracking</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">ETA</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {shipmentRequests.map((req) => {
                const shp = req.shipment;
                const shpNumber = shp?.shipmentNumber || `SHP-${req.referenceNumber.replace('AH-P-', '')}`;
                const carrier = shp?.carrier || 'NZ Post Express Courier';
                const tracking = shp?.trackingCode || 'NZP-CP-9428-1192';
                const eta = shp?.etaDate || '18 Sep 2026';

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#2B4499]">
                      {shpNumber}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <Link href={`/operations/requests/${req.referenceNumber}`} className="hover:underline">
                        {req.referenceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{req.customerName}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{carrier}</p>
                      <p className="text-[10px] font-mono text-slate-500">{tracking}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {shp?.freightMethod || 'Air Freight'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-black border',
                          req.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                        )}
                      >
                        {shp?.status || req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{eta}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/operations/requests/${req.referenceNumber}?tab=freight`}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white text-xs font-bold text-slate-700 transition-colors inline-block"
                      >
                        Timeline →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
