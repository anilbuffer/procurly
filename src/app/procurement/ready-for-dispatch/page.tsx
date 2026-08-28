'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  PackageCheck,
  CheckCircle,
  ShieldCheck,
  Building2,
  Car,
  Truck,
  ArrowRight,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ShipmentDispatchItem } from '@/types/procurement';

export default function ReadyForDispatchPage() {
  const [shipments, setShipments] = useState<ShipmentDispatchItem[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDispatchItem | null>(null);

  // Verification Checklist State
  const [verifyPart, setVerifyPart] = useState(false);
  const [verifyQuantity, setVerifyQuantity] = useState(false);
  const [verifySupplier, setVerifySupplier] = useState(false);
  const [verifyShippingInfo, setVerifyShippingInfo] = useState(false);
  const [markedSuccess, setMarkedSuccess] = useState(false);

  const loadData = () => {
    const list = procurementService.getShipments();
    setShipments(list);
    if (list.length > 0 && !selectedShipment) {
      setSelectedShipment(list[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const handleSelect = (s: ShipmentDispatchItem) => {
    setSelectedShipment(s);
    setVerifyPart(s.verifiedChecklist?.partVerified || false);
    setVerifyQuantity(s.verifiedChecklist?.quantityVerified || false);
    setVerifySupplier(s.verifiedChecklist?.supplierVerified || false);
    setVerifyShippingInfo(s.verifiedChecklist?.shippingInfoVerified || false);
  };

  const isAllVerified = verifyPart && verifyQuantity && verifySupplier && verifyShippingInfo;

  const handleMarkReady = () => {
    if (!selectedShipment || !isAllVerified) return;

    procurementService.markReadyForDispatch(selectedShipment.id);
    setMarkedSuccess(true);
    setTimeout(() => {
      setMarkedSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ready for Dispatch & Pre-Handover Verification
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Procurement → Logistics Gate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Perform 4-point physical verification before handing consignments over to international air/sea freight carriers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/shipping"
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Truck className="w-3.5 h-3.5" />
            Shipping Handover Workspace →
          </Link>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ready Orders Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Orders Ready for Verification ({shipments.length})
          </h2>

          <div className="space-y-3">
            {shipments.map((s) => {
              const isSelected = selectedShipment?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer space-y-2',
                    isSelected
                      ? 'bg-white border-brand-red ring-2 ring-brand-red/20 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {s.shipmentNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {s.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{s.partName}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PO: <strong className="font-mono text-slate-800">{s.poNumber}</strong> • {s.supplierName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Carrier: <strong className="text-slate-700">{s.carrier}</strong></span>
                    <span>ETA: <strong className="text-brand-blue">{s.eta}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 4-Point Verification Checklist & Gate Action (7 cols) */}
        <div className="lg:col-span-7">
          {selectedShipment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dispatch Verification Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Consignment: {selectedShipment.shipmentNumber} ({selectedShipment.partName})
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-brand-blue">
                  {selectedShipment.poNumber}
                </span>
              </div>

              {/* Order Specs Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Quantity</span>
                  <span className="font-bold text-slate-900">{selectedShipment.quantity} Unit(s)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Freight Method</span>
                  <span className="font-bold text-brand-blue">{selectedShipment.freightMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Gross Weight</span>
                  <span className="font-bold text-slate-900">{selectedShipment.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Dimensions</span>
                  <span className="font-bold text-slate-900">{selectedShipment.dimensionsCm} cm</span>
                </div>
              </div>

              {/* The 4-Point Verification Flow */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Required Verification Checkpoints:
                </h4>

                {/* 1. Verify Part */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifyPart}
                    onChange={(e) => setVerifyPart(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-red focus:ring-brand-red/20 border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">1. Verify Part & Fitment Integrity</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Part description, OEM barcode, and physical condition match the customer specification.
                    </p>
                  </div>
                </label>

                {/* 2. Verify Quantity */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifyQuantity}
                    onChange={(e) => setVerifyQuantity(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-red focus:ring-brand-red/20 border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">2. Verify Quantity Count</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Confirmed physical unit count ({selectedShipment.quantity} item) matches purchase order.
                    </p>
                  </div>
                </label>

                {/* 3. Verify Supplier Packaging */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifySupplier}
                    onChange={(e) => setVerifySupplier(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-red focus:ring-brand-red/20 border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">3. Verify Supplier & Packing Foam</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Supplier {selectedShipment.supplierName} factory sealed carton packed with export foam.
                    </p>
                  </div>
                </label>

                {/* 4. Verify Shipping Information */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifyShippingInfo}
                    onChange={(e) => setVerifyShippingInfo(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-red focus:ring-brand-red/20 border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">4. Verify Shipping Destination & Labels</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Consignee label addresses Auckland Hub ({selectedShipment.destinationHub}) with clear Autohub AWB barcoding.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {isAllVerified ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> All 4 checkpoints certified
                    </span>
                  ) : (
                    'Check all 4 points above to approve dispatch'
                  )}
                </span>

                <button
                  onClick={handleMarkReady}
                  disabled={!isAllVerified}
                  className="btn-red-polished text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-brand-red/30 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  {markedSuccess ? 'Dispatch Certified!' : 'Mark Ready for Dispatch'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select an order on the left to review its verification checklist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
