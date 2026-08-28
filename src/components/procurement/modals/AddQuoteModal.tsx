'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, FileText, CheckCircle, Upload, DollarSign, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, SupplierSummary } from '@/types/procurement';

export interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRequestId?: string;
}

export function AddQuoteModal({ isOpen, onClose, defaultRequestId }: AddQuoteModalProps) {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);

  const [selectedRequestId, setSelectedRequestId] = useState(defaultRequestId || '');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('New OEM Factory Boxed');
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [unitCostNZD, setUnitCostNZD] = useState<number | ''>(0);
  const [freightCostNZD, setFreightCostNZD] = useState<number | ''>(0);
  const [handlingCostNZD, setHandlingCostNZD] = useState<number | ''>(0);
  const [availability, setAvailability] = useState<'In Stock' | '1–2 Days' | '3–5 Days' | '7–10 Days' | 'Backorder'>('In Stock');
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [validUntilDays, setValidUntilDays] = useState(7);
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days (Standard Trade)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const reqs = procurementService.getRequests();
      const sups = procurementService.getSuppliers();
      setRequests(reqs);
      setSuppliers(sups);

      if (defaultRequestId) {
        const matched = reqs.find((r) => r.id === defaultRequestId || r.requestNumber === defaultRequestId);
        if (matched) {
          setSelectedRequestId(matched.id);
          setPartName(matched.part.name);
          setPartNumber(matched.part.partNumber || '');
          setQuantity(matched.part.quantity || 1);
        }
      } else if (reqs.length > 0) {
        setSelectedRequestId(reqs[0].id);
        setPartName(reqs[0].part.name);
        setPartNumber(reqs[0].part.partNumber || '');
        setQuantity(reqs[0].part.quantity || 1);
      }

      if (sups.length > 0) {
        setSelectedSupplierId(sups[0].id);
      }
      setSuccess(false);
    }
  }, [isOpen, defaultRequestId]);

  const handleRequestChange = (reqId: string) => {
    setSelectedRequestId(reqId);
    const matched = requests.find((r) => r.id === reqId);
    if (matched) {
      setPartName(matched.part.name);
      setPartNumber(matched.part.partNumber || '');
      setQuantity(matched.part.quantity || 1);
    }
  };

  if (!isOpen) return null;

  const totalCost =
    (Number(unitCostNZD) || 0) * (quantity || 1) +
    (Number(freightCostNZD) || 0) +
    (Number(handlingCostNZD) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !selectedSupplierId) return;

    setSubmitting(true);
    const targetReq = requests.find((r) => r.id === selectedRequestId);
    const targetSup = suppliers.find((s) => s.id === selectedSupplierId);

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validUntilDays);

    procurementService.addSupplierQuote({
      requestId: targetReq?.id || selectedRequestId,
      requestRef: targetReq?.requestNumber || 'PR-10000',
      supplierId: targetSup?.id || selectedSupplierId,
      supplierName: targetSup?.name || 'Tokyo Auto Spares',
      supplierCode: targetSup?.code || 'TAS-JP',
      partName: partName || targetReq?.part.name || 'Automotive Component',
      partNumber: partNumber || targetReq?.part.partNumber,
      quantity,
      condition,
      warrantyMonths,
      unitCostNZD: Number(unitCostNZD) || 0,
      freightCostNZD: Number(freightCostNZD) || 0,
      handlingCostNZD: Number(handlingCostNZD) || 0,
      totalCostNZD: totalCost,
      availability,
      leadTimeDays,
      leadTimeDisplay: `${leadTimeDays} Days`,
      validUntil: validUntilDate.toISOString().split('T')[0],
      status: 'Received',
      paymentTerms,
      notes,
      attachments: [{ name: 'Supplier_Quotation_Sheet.pdf', size: '380 KB', url: '#' }],
    });

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-up my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Add Supplier Quotation
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Record supplier pricing, availability, and lead-time terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {success ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Supplier Quote Recorded!</h3>
            <p className="text-sm text-slate-600 max-w-sm">
              Quote has been saved and linked to the procurement request and quote comparison matrix.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Target Request & Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Procurement Request *
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => handleRequestChange(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                >
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.requestNumber} — {r.customerName} ({r.vehicle.make} {r.vehicle.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Supplier *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} • {s.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Part Description & OEM Part Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Part Description *
                </label>
                <input
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  OEM Part Number
                </label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none font-mono"
                  placeholder="e.g. 17201-11080"
                />
              </div>
            </div>

            {/* Condition & Warranty & Qty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Condition Offered
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                >
                  <option value="New OEM Factory Boxed">New OEM Factory Boxed</option>
                  <option value="New Tier-1 OE Replacement">New Tier-1 OE Replacement</option>
                  <option value="Certified Aftermarket">Certified Aftermarket</option>
                  <option value="Grade A Tested Used">Grade A Tested Used</option>
                  <option value="Precision Remanufactured">Precision Remanufactured</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Warranty (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Financial Cost Breakdown (NZD) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Cost Breakdown (NZD)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Unit Cost (NZD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitCostNZD}
                    onChange={(e) => setUnitCostNZD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Supplier Freight (NZD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={freightCostNZD}
                    onChange={(e) => setFreightCostNZD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Handling / Packaging (NZD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={handlingCostNZD}
                    onChange={(e) => setHandlingCostNZD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Total Supplier Landed Cost:</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  NZD ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Availability & Lead Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                >
                  <option value="In Stock">In Stock (Shelf Ready)</option>
                  <option value="1–2 Days">1–2 Days (Factory Hub)</option>
                  <option value="3–5 Days">3–5 Days (Regional Warehouse)</option>
                  <option value="7–10 Days">7–10 Days (Factory Order)</option>
                  <option value="Backorder">Backorder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lead Time (Days to Hub)
                </label>
                <input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Quote Validity (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={validUntilDays}
                  onChange={(e) => setValidUntilDays(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Notes & Terms */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Supplier Notes / Inclusions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include details like gasket kits, sensor calibration, factory sealing, packaging..."
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-red-polished text-white text-xs font-semibold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-brand-red/30"
              >
                {submitting ? 'Saving...' : 'Save & Record Quote'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
