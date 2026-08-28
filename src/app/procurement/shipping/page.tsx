'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Truck,
  Package,
  Plane,
  Ship,
  FileText,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Download,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ShipmentDispatchItem } from '@/types/procurement';

export default function ShippingHandoverPage() {
  const [shipments, setShipments] = useState<ShipmentDispatchItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [freightMethod, setFreightMethod] = useState<'Air Freight' | 'Sea Freight' | 'Air Express'>('Air Freight');
  const [carrier, setCarrier] = useState('Air New Zealand Cargo / Nippon Express');
  const [trackingCode, setTrackingCode] = useState('NZ-CARGO-7749219');
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  const loadData = () => {
    const list = procurementService.getShipments();
    setShipments(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id);
      setFreightMethod(list[0].freightMethod);
      setCarrier(list[0].carrier);
      setTrackingCode(list[0].trackingCode);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const currentShipment = shipments.find((s) => s.id === selectedId);

  const handleSelect = (s: ShipmentDispatchItem) => {
    setSelectedId(s.id);
    setFreightMethod(s.freightMethod);
    setCarrier(s.carrier);
    setTrackingCode(s.trackingCode);
  };

  const handleHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShipment) return;

    procurementService.handoverToLogistics(currentShipment.id, trackingCode, carrier);
    setHandoverSuccess(true);
    setTimeout(() => {
      setHandoverSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Shipping & Logistics Handover Workspace
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              Carrier Manifesting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Procurement-to-logistics manifest creation, international air waybill generation, and carrier dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/in-transit"
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Truck className="w-3.5 h-3.5" />
            In-Transit Freight Monitor →
          </Link>
        </div>
      </div>

      {/* 2. Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shipping Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Shipping Queue ({shipments.length})
          </h2>

          <div className="space-y-3">
            {shipments.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelect(s)}
                className={cn(
                  'p-4 rounded-2xl border transition-all cursor-pointer space-y-2',
                  selectedId === s.id
                    ? 'bg-white border-brand-blue ring-2 ring-brand-blue/20 shadow-md'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {s.shipmentNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {s.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">{s.partName}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-700">{s.customerName}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>{s.originHub} → {s.destinationHub}</span>
                  <span className="font-bold text-slate-700">{s.freightMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Handover Form & Manifest Generator (7 Cols) */}
        <div className="lg:col-span-7">
          {currentShipment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Carrier Handover Specification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Consignment Ref: {currentShipment.shipmentNumber} • PO: {currentShipment.poNumber}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✓ Dispatch Verified
                </span>
              </div>

              {handoverSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-slide-up">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Shipment successfully handed over to Logistics! Carrier manifest broadcasted.
                </div>
              )}

              <form onSubmit={handleHandover} className="space-y-4 text-xs">
                {/* Freight Method Selection */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Select Freight Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFreightMethod('Air Freight')}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1',
                        freightMethod === 'Air Freight'
                          ? 'bg-blue-50 border-brand-blue ring-2 ring-brand-blue/30 text-brand-blue font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Plane className="w-5 h-5" />
                      <span>Air Freight (3–5d)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFreightMethod('Air Express')}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1',
                        freightMethod === 'Air Express'
                          ? 'bg-red-50 border-brand-red ring-2 ring-brand-red/30 text-brand-red font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Plane className="w-5 h-5 text-brand-red" />
                      <span>Air Express (1–2d)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFreightMethod('Sea Freight')}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1',
                        freightMethod === 'Sea Freight'
                          ? 'bg-cyan-50 border-cyan-600 ring-2 ring-cyan-600/30 text-cyan-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Ship className="w-5 h-5 text-cyan-700" />
                      <span>Sea Freight (14–21d)</span>
                    </button>
                  </div>
                </div>

                {/* Carrier & Tracking Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Carrier Name *</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">AWB / Tracking Code *</label>
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Package Dimensions & Weight */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Package Physical Specifications:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Weight</span>
                      <span className="font-bold text-slate-900">{currentShipment.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Dimensions</span>
                      <span className="font-bold text-slate-900">{currentShipment.dimensionsCm} cm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Target Arrival</span>
                      <span className="font-bold text-brand-blue">{currentShipment.eta}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Documents Checklist */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block">Export Documents Generated:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800">1. Commercial Invoice PDF</span>
                      <Download className="w-3.5 h-3.5 text-brand-blue cursor-pointer" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800">2. Air Waybill (AWB) Label</span>
                      <Download className="w-3.5 h-3.5 text-brand-blue cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="btn-red-polished text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-brand-red/30 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Create Shipment & Handover to Logistics
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select a shipment on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
