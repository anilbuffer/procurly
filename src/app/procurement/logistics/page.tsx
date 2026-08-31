'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  PackageCheck,
  Truck,
  Navigation,
  AlertTriangle,
  Search,
  Plus,
  CheckCircle,
  Clock,
  ShieldCheck,
  Plane,
  Ship,
  MapPin,
  Send,
  Download,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  ShipmentDispatchItem,
  ProcurementExceptionItem,
  ExceptionType,
  ExceptionStage,
} from '@/types/procurement';
import { ReportExceptionModal } from '@/components/procurement/modals/ReportExceptionModal';

export type LogisticsTab = 'dispatch' | 'shipping' | 'in-transit' | 'exceptions';

function LogisticsHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get('tab') as LogisticsTab) || 'dispatch';

  const [activeTab, setActiveTab] = useState<LogisticsTab>(initialTab);

  // Synchronize tab state with URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as LogisticsTab;
    if (tabParam && ['dispatch', 'shipping', 'in-transit', 'exceptions'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: LogisticsTab) => {
    setActiveTab(tab);
    router.push(`/procurement/logistics?tab=${tab}`);
  };

  // Shared Data State
  const [shipments, setShipments] = useState<ShipmentDispatchItem[]>([]);
  const [exceptions, setExceptions] = useState<ProcurementExceptionItem[]>([]);

  // 1. Ready for Dispatch state
  const [selectedDispatch, setSelectedDispatch] = useState<ShipmentDispatchItem | null>(null);
  const [verifyPart, setVerifyPart] = useState(false);
  const [verifyQuantity, setVerifyQuantity] = useState(false);
  const [verifySupplier, setVerifySupplier] = useState(false);
  const [verifyShippingInfo, setVerifyShippingInfo] = useState(false);
  const [markedSuccess, setMarkedSuccess] = useState(false);

  // 2. Shipping Handover state
  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [freightMethod, setFreightMethod] = useState<'Air Freight' | 'Sea Freight' | 'Air Express'>('Air Freight');
  const [carrier, setCarrier] = useState('Air New Zealand Cargo / Nippon Express');
  const [trackingCode, setTrackingCode] = useState('NZ-CARGO-7749219');
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // 3. In-Transit state
  const [transitSearchQuery, setTransitSearchQuery] = useState('');
  const [selectedFreightFilter, setSelectedFreightFilter] = useState<string>('All');

  // 4. Exceptions state
  const [selectedExcType, setSelectedExcType] = useState<string>('All');
  const [selectedExcStage, setSelectedExcStage] = useState<string>('All');
  const [excSearchQuery, setExcSearchQuery] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<ProcurementExceptionItem | null>(null);
  const [actionNote, setActionNote] = useState('');

  const loadData = () => {
    const list = procurementService.getShipments();
    const excList = procurementService.getExceptions();
    setShipments(list);
    setExceptions(excList);

    if (list.length > 0) {
      if (!selectedDispatch) setSelectedDispatch(list[0]);
      if (!selectedShippingId) {
        setSelectedShippingId(list[0].id);
        setFreightMethod(list[0].freightMethod);
        setCarrier(list[0].carrier);
        setTrackingCode(list[0].trackingCode);
      }
    }

    if (excList.length > 0 && !selectedException) {
      setSelectedException(excList[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  // Handlers for Dispatch
  const handleSelectDispatch = (s: ShipmentDispatchItem) => {
    setSelectedDispatch(s);
    setVerifyPart(s.verifiedChecklist?.partVerified || false);
    setVerifyQuantity(s.verifiedChecklist?.quantityVerified || false);
    setVerifySupplier(s.verifiedChecklist?.supplierVerified || false);
    setVerifyShippingInfo(s.verifiedChecklist?.shippingInfoVerified || false);
  };

  const isAllVerified = verifyPart && verifyQuantity && verifySupplier && verifyShippingInfo;

  const handleMarkReady = () => {
    if (!selectedDispatch || !isAllVerified) return;
    procurementService.markReadyForDispatch(selectedDispatch.id);
    setMarkedSuccess(true);
    setTimeout(() => setMarkedSuccess(false), 2000);
  };

  // Handlers for Shipping Handover
  const currentShippingItem = shipments.find((s) => s.id === selectedShippingId);
  const handleSelectShipping = (s: ShipmentDispatchItem) => {
    setSelectedShippingId(s.id);
    setFreightMethod(s.freightMethod);
    setCarrier(s.carrier);
    setTrackingCode(s.trackingCode);
  };

  const handleHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShippingItem) return;
    procurementService.handoverToLogistics(currentShippingItem.id, trackingCode, carrier);
    setHandoverSuccess(true);
    setTimeout(() => setHandoverSuccess(false), 2500);
  };

  // Handlers for Exceptions
  const excStages: ExceptionStage[] = [
    'Review',
    'Assign',
    'Investigate',
    'Supplier Communication',
    'Resolution',
    'Close',
  ];

  const excTypes: Array<ExceptionType | 'All'> = [
    'All',
    'Supplier Delay',
    'Supplier Cancellation',
    'Part Unavailable',
    'Wrong Part',
    'Damaged Part',
    'Quantity Mismatch',
    'Shipping Delay',
    'Documentation Issue',
    'Customs Issue',
  ];

  const filteredExceptions = exceptions.filter((e) => {
    if (selectedExcType !== 'All' && e.type !== selectedExcType) return false;
    if (selectedExcStage !== 'All' && e.stage !== selectedExcStage) return false;
    if (excSearchQuery) {
      const q = excSearchQuery.toLowerCase();
      return (
        e.code.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.requestRef.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdvanceStage = (nextStage: ExceptionStage) => {
    if (!selectedException) return;
    procurementService.updateExceptionStage(
      selectedException.id,
      nextStage,
      actionNote || `Advanced stage to ${nextStage}`
    );
    setActionNote('');
  };

  const activeExceptionsCount = exceptions.filter((e) => e.stage !== 'Close').length;

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Logistics & Dispatch Workspace
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              End-to-End Freight Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-handover verification, air/sea carrier manifesting, live in-transit monitoring, and 6-stage exception lifecycle
          </p>
        </div>

        {activeTab === 'exceptions' && (
          <button
            onClick={() => setReportModalOpen(true)}
            className="bg-brand-red hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Log New Exception
          </button>
        )}
      </div>

      {/* 2. Top Navigation Tabs Bar */}
      <div className="border-b border-slate-200 bg-white rounded-2xl shadow-xs px-2 pt-2 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => handleTabChange('dispatch')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'dispatch'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Ready for Dispatch</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {shipments.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('shipping')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'shipping'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping Handover</span>
        </button>

        <button
          onClick={() => handleTabChange('in-transit')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'in-transit'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <Navigation className="w-4 h-4" />
          <span>In-Transit Freight</span>
        </button>

        <button
          onClick={() => handleTabChange('exceptions')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'exceptions'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Logistics Exceptions</span>
          {activeExceptionsCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-red text-white">
              {activeExceptionsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: READY FOR DISPATCH */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left Column: Orders Ready (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Orders Ready for Verification ({shipments.length})
            </h2>

            <div className="space-y-3">
              {shipments.map((s) => {
                const isSelected = selectedDispatch?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectDispatch(s)}
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

          {/* Right Column: Verification Checklist (7 cols) */}
          <div className="lg:col-span-7">
            {selectedDispatch ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Dispatch Verification Checklist
                    </h3>
                    <p className="text-xs text-slate-500">
                      Consignment: {selectedDispatch.shipmentNumber} ({selectedDispatch.partName})
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-blue">
                    {selectedDispatch.poNumber}
                  </span>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Quantity</span>
                    <span className="font-bold text-slate-900">{selectedDispatch.quantity} Unit(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Freight Method</span>
                    <span className="font-bold text-brand-blue">{selectedDispatch.freightMethod}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Gross Weight</span>
                    <span className="font-bold text-slate-900">{selectedDispatch.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Dimensions</span>
                    <span className="font-bold text-slate-900">{selectedDispatch.dimensionsCm} cm</span>
                  </div>
                </div>

                {/* Checkpoints */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Required Verification Checkpoints:
                  </h4>

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
                        Part description, OEM barcode, and physical condition match customer specification.
                      </p>
                    </div>
                  </label>

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
                        Confirmed physical unit count ({selectedDispatch.quantity} item) matches purchase order.
                      </p>
                    </div>
                  </label>

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
                        Supplier {selectedDispatch.supplierName} factory sealed carton packed with export foam.
                      </p>
                    </div>
                  </label>

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
                        Consignee label addresses Auckland Hub ({selectedDispatch.destinationHub}) with clear Autohub AWB barcoding.
                      </p>
                    </div>
                  </label>
                </div>

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
                Select an order on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHIPPING HANDOVER */}
      {activeTab === 'shipping' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Shipping Queue (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Shipping Queue ({shipments.length})
            </h2>

            <div className="space-y-3">
              {shipments.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectShipping(s)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer space-y-2',
                    selectedShippingId === s.id
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
            {currentShippingItem ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Carrier Handover Specification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Consignment Ref: {currentShippingItem.shipmentNumber} • PO: {currentShippingItem.poNumber}
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
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Select Freight Mode *</label>
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

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block">Package Physical Specifications:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Weight</span>
                        <span className="font-bold text-slate-900">{currentShippingItem.weightKg} kg</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Dimensions</span>
                        <span className="font-bold text-slate-900">{currentShippingItem.dimensionsCm} cm</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Target Arrival</span>
                        <span className="font-bold text-brand-blue">{currentShippingItem.eta}</span>
                      </div>
                    </div>
                  </div>

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
      )}

      {/* TAB 3: IN-TRANSIT FREIGHT */}
      {activeTab === 'in-transit' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & Method Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={transitSearchQuery}
                onChange={(e) => setTransitSearchQuery(e.target.value)}
                placeholder="Search consignment #, part, carrier, hub location..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500">Mode:</span>
              <select
                value={selectedFreightFilter}
                onChange={(e) => setSelectedFreightFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
              >
                <option value="All">All Freight Modes</option>
                <option value="Air Freight">Air Freight</option>
                <option value="Air Express">Air Express</option>
                <option value="Sea Freight">Sea Freight</option>
              </select>
            </div>
          </div>

          {/* In-Transit Table */}
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
                  {shipments
                    .filter((s) => {
                      if (selectedFreightFilter !== 'All' && s.freightMethod !== selectedFreightFilter) return false;
                      if (transitSearchQuery) {
                        const q = transitSearchQuery.toLowerCase();
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
                    })
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                          <span className="block">{s.shipmentNumber}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{s.trackingCode}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          <Link href={`/procurement/requests/${s.requestId}`} className="hover:text-brand-blue">
                            {s.requestRef}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.customerName}</td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{s.partName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">PO: {s.poNumber}</p>
                        </td>
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
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                              {s.currentLocation}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">{s.eta}</td>
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
      )}

      {/* TAB 4: LOGISTICS EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4 animate-fade-in">
          {/* Exceptions Types Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {excTypes.map((t) => {
              const count = t === 'All' ? exceptions.length : exceptions.filter((e) => e.type === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedExcType(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                    selectedExcType === t
                      ? 'bg-[#ed2025] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span>{t}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      selectedExcType === t ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Exception Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={excSearchQuery}
                  onChange={(e) => setExcSearchQuery(e.target.value)}
                  placeholder="Search code, title, supplier..."
                  className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                {filteredExceptions.map((exc) => {
                  const isSelected = selectedException?.id === exc.id;
                  return (
                    <div
                      key={exc.id}
                      onClick={() => setSelectedException(exc)}
                      className={cn(
                        'p-4 rounded-2xl border transition-all cursor-pointer space-y-2',
                        isSelected
                          ? 'bg-white border-brand-red ring-2 ring-brand-red/20 shadow-md'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {exc.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          Stage: {exc.stage}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{exc.title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                        {exc.supplierName} • {exc.requestRef}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>Severity: <strong className="text-brand-red">{exc.severity}</strong></span>
                        <span>Assigned: <strong className="text-slate-700">{exc.assignedTo}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exception Lifecycle & Resolution Panel */}
            <div className="lg:col-span-7">
              {selectedException ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {selectedException.code}
                        </span>
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-brand-red">
                          {selectedException.type}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 mt-1">
                        {selectedException.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{selectedException.customerName}</strong> • Supplier: {selectedException.supplierName}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">Logged On</span>
                      <span className="font-semibold text-slate-800">{selectedException.createdAt.split('T')[0]}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      6-Stage Resolution Lifecycle:
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      {excStages.map((st, i) => {
                        const currentIdx = excStages.indexOf(selectedException.stage);
                        const isPassed = i < currentIdx;
                        const isCurrent = i === currentIdx;

                        return (
                          <div
                            key={st}
                            className={cn(
                              'p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1',
                              isCurrent
                                ? 'bg-red-50 border-brand-red text-brand-red font-bold ring-1 ring-brand-red'
                                : isPassed
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            )}
                          >
                            <span className="text-[10px] font-extrabold uppercase">
                              {isPassed ? '✓' : `0${i + 1}`}
                            </span>
                            <span className="text-[10px] leading-tight line-clamp-2">{st}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">Incident Investigation Details:</span>
                    <p className="text-slate-700 leading-relaxed">{selectedException.description}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Resolution Action History:
                    </h4>
                    <div className="space-y-2">
                      {selectedException.actions.map((act, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-slate-700">{act.user} ({act.stage})</span>
                            <span>{act.timestamp.slice(0, 16).replace('T', ' ')}</span>
                          </div>
                          <p className="text-slate-800">{act.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">Advance Resolution Stage:</span>
                    <input
                      type="text"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="Record supplier negotiation note or corrective action..."
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedException.stage === 'Review' && (
                        <button
                          onClick={() => handleAdvanceStage('Assign')}
                          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                        >
                          Assign Specialist →
                        </button>
                      )}
                      {selectedException.stage === 'Assign' && (
                        <button
                          onClick={() => handleAdvanceStage('Investigate')}
                          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                        >
                          Begin Investigation →
                        </button>
                      )}
                      {selectedException.stage === 'Investigate' && (
                        <button
                          onClick={() => handleAdvanceStage('Supplier Communication')}
                          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                        >
                          Escalate to Supplier →
                        </button>
                      )}
                      {selectedException.stage === 'Supplier Communication' && (
                        <button
                          onClick={() => handleAdvanceStage('Resolution')}
                          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                        >
                          Propose Resolution →
                        </button>
                      )}
                      {selectedException.stage === 'Resolution' && (
                        <button
                          onClick={() => handleAdvanceStage('Close')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                        >
                          ✓ Close Exception Ticket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  Select an exception to review.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ReportExceptionModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}

export default function LogisticsHubPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Logistics Workspace...</div>}>
      <LogisticsHubContent />
    </Suspense>
  );
}
