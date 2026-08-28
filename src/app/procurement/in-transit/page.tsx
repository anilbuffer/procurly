'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Navigation,
  Search,
  Truck,
  Plane,
  Ship,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ShipmentDispatchItem } from '@/types/procurement';

export default function InTransitPage() {
  const [shipments, setShipments] = useState<ShipmentDispatchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreightMethod, setSelectedFreightMethod] = useState<string>('All');

  const loadData = () => {
    setShipments(procurementService.getShipments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const filteredShipments = shipments.filter((s) => {
    if (selectedFreightMethod !== 'All' && s.freightMethod !== selectedFreightMethod) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.shipmentNumber.toLowerCase().includes(q) ||
        s.requestRef.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.partName.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q) ||
        s.currentLocation.toLowerCase().includes(q)
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
              In-Transit Procurement Freight Monitor
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-brand-blue">
              Live Air & Sea Consignments
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry and carrier milestones from Tokyo, Munich, Melbourne to Auckland Logistics Terminal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/exceptions"
            className="px-3.5 py-2 rounded-xl bg-red-50 text-brand-red border border-red-200 hover:bg-red-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Exceptions Board
          </Link>
        </div>
      </div>

      {/* 2. Search & Method Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search consignment #, part, carrier, hub location..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Mode:</span>
          <select
            value={selectedFreightMethod}
            onChange={(e) => setSelectedFreightMethod(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Freight Modes</option>
            <option value="Air Freight">Air Freight</option>
            <option value="Air Express">Air Express</option>
            <option value="Sea Freight">Sea Freight</option>
          </select>
        </div>
      </div>

      {/* 3. In-Transit Consignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Shipment #</th>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Part Specification</th>
                <th className="py-3 px-3">Freight Method</th>
                <th className="py-3 px-4">Current Location</th>
                <th className="py-3 px-3">Target ETA</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Exception / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Shipment # */}
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                    <span className="block">{s.shipmentNumber}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{s.trackingCode}</span>
                  </td>

                  {/* Request # */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    <Link href={`/procurement/requests/${s.requestId}`} className="hover:text-brand-blue">
                      {s.requestRef}
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.customerName}
                  </td>

                  {/* Part */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">{s.partName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">PO: {s.poNumber}</p>
                  </td>

                  {/* Freight Method */}
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px]">
                      {s.freightMethod.includes('Air') ? (
                        <Plane className="w-3 h-3 text-brand-blue" />
                      ) : (
                        <Ship className="w-3 h-3 text-cyan-700" />
                      )}
                      {s.freightMethod}
                    </span>
                  </td>

                  {/* Current Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {s.currentLocation}
                      </span>
                    </div>
                  </td>

                  {/* ETA */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {s.eta}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap',
                        s.status === 'In Transit'
                          ? 'bg-blue-50 text-brand-blue border-blue-200 animate-pulse'
                          : s.status === 'Ready for Dispatch'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-brand-red border-red-200'
                      )}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* Exception / Notes */}
                  <td className="py-3.5 px-4">
                    {s.exceptionNote ? (
                      <span className="text-xs font-bold text-brand-red flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{s.exceptionNote}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium">On Schedule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
