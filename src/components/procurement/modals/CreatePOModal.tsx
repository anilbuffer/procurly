'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, ShoppingCart, CheckCircle, DollarSign, Building2, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, SupplierQuoteItem, SupplierSummary } from '@/types/procurement';

export interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRequestId?: string;
  defaultQuoteId?: string;
}

export function CreatePOModal({ isOpen, onClose, defaultRequestId, defaultQuoteId }: CreatePOModalProps) {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);

  const [selectedRequestId, setSelectedRequestId] = useState(defaultRequestId || '');
  const [selectedQuoteId, setSelectedQuoteId] = useState(defaultQuoteId || '');
  const [deliveryHub, setDeliveryHub] = useState('Auckland Airport Air Logistics Facility (AKL)');
  const [expectedDispatchDate, setExpectedDispatchDate] = useState('');
  const [shippingTerms, setShippingTerms] = useState('FOB Origin Port / DDP Auckland Hub');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days (Standard Trade)');
  const [poNotes, setPoNotes] = useState('Please pack in heavy foam crate with PO barcode sticker attached.');
  const [submitting, setSubmitting] = useState(false);
  const [createdPoNumber, setCreatedPoNumber] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const reqs = procurementService.getRequests();
      const allQuotes = procurementService.getSupplierQuotes();
      const sups = procurementService.getSuppliers();
      setRequests(reqs);
      setQuotes(allQuotes);
      setSuppliers(sups);

      const targetReqId = defaultRequestId || (reqs.length > 0 ? reqs[0].id : '');
      setSelectedRequestId(targetReqId);

      const relevantQuotes = allQuotes.filter((q) => q.requestId === targetReqId);
      if (defaultQuoteId) {
        setSelectedQuoteId(defaultQuoteId);
      } else if (relevantQuotes.length > 0) {
        setSelectedQuoteId(relevantQuotes[0].id);
      }

      // Default dispatch date: 2 days from today
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setExpectedDispatchDate(d.toISOString().split('T')[0]);
      setSuccess(false);
    }
  }, [isOpen, defaultRequestId, defaultQuoteId]);

  const handleRequestChange = (reqId: string) => {
    setSelectedRequestId(reqId);
    const relevantQuotes = quotes.filter((q) => q.requestId === reqId);
    if (relevantQuotes.length > 0) {
      setSelectedQuoteId(relevantQuotes[0].id);
    } else {
      setSelectedQuoteId('');
    }
  };

  if (!isOpen) return null;

  const currentReq = requests.find((r) => r.id === selectedRequestId);
  const currentQuote = quotes.find((q) => q.id === selectedQuoteId);
  const availableQuotes = quotes.filter((q) => q.requestId === selectedRequestId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReq || !currentQuote) return;

    setSubmitting(true);
    const targetSup = suppliers.find((s) => s.id === currentQuote.supplierId);

    const newPO = procurementService.createPurchaseOrder({
      requestId: currentReq.id,
      requestRef: currentReq.requestNumber,
      quoteId: currentQuote.id,
      quoteRef: currentQuote.quoteNumber,
      supplierId: currentQuote.supplierId,
      supplierName: currentQuote.supplierName,
      supplierContact: targetSup?.contactName || 'Kenji Takahashi',
      supplierEmail: targetSup?.contactEmail || 'supplier@autohub.co.jp',
      customerName: currentReq.customerName,
      vehicleSummary: `${currentReq.vehicle.year} ${currentReq.vehicle.make} ${currentReq.vehicle.model}`,
      partName: currentQuote.partName,
      partNumber: currentQuote.partNumber,
      quantity: currentQuote.quantity || 1,
      unitPriceNZD: currentQuote.unitCostNZD,
      freightCostNZD: currentQuote.freightCostNZD,
      taxNZD: 0,
      totalAmountNZD: currentQuote.totalCostNZD,
      status: 'Ordered',
      expectedDispatchDate,
      deliveryAddress: 'Autohub Logistics Centre, 12 Verissimo Drive, Mangere, Auckland 2022, New Zealand',
      deliveryHub,
      shippingTerms,
      paymentTerms,
      notes: poNotes,
    });

    setCreatedPoNumber(newPO.poNumber);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-up my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Create Purchase Order
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Issue binding purchase order to selected supplier
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
            <h3 className="text-lg font-bold text-slate-900">Purchase Order {createdPoNumber} Issued!</h3>
            <p className="text-sm text-slate-600 max-w-sm">
              The order has been generated and dispatched to supplier EDI and order tracking queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Request Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Select Procurement Request *
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleRequestChange(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                required
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.requestNumber} — {r.customerName} ({r.part.name} • {r.vehicle.make} {r.vehicle.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Quote Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Accepted Supplier Quote *
              </label>
              {availableQuotes.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  No supplier quotes recorded for this request yet. Please record a supplier quote first.
                </div>
              ) : (
                <select
                  value={selectedQuoteId}
                  onChange={(e) => setSelectedQuoteId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                >
                  {availableQuotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quoteNumber} — {q.supplierName} (NZD ${q.totalCostNZD.toFixed(2)} • {q.leadTimeDisplay})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quote Summary Preview Box */}
            {currentQuote && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>Part: {currentQuote.partName}</span>
                  <span className="text-brand-blue">Qty: {currentQuote.quantity}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-600 block">Unit Cost:</span>
                    <span className="font-semibold text-slate-900">NZD ${currentQuote.unitCostNZD.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block">Freight:</span>
                    <span className="font-semibold text-slate-900">NZD ${currentQuote.freightCostNZD.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block">Lead Time:</span>
                    <span className="font-semibold text-emerald-700">{currentQuote.leadTimeDisplay}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block">Total PO Value:</span>
                    <span className="font-extrabold text-brand-blue text-sm">NZD ${currentQuote.totalCostNZD.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dispatch Date & Destination Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Dispatch Date *
                </label>
                <input
                  type="date"
                  value={expectedDispatchDate}
                  onChange={(e) => setExpectedDispatchDate(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Receiving Logistics Hub *
                </label>
                <select
                  value={deliveryHub}
                  onChange={(e) => setDeliveryHub(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                >
                  <option value="Auckland Airport Air Logistics Facility (AKL)">Auckland Airport Air Logistics Facility (AKL)</option>
                  <option value="Ports of Auckland Sea Freight Depot (AKL-SEA)">Ports of Auckland Sea Freight Depot (AKL-SEA)</option>
                  <option value="Christchurch Regional Depot (CHC)">Christchurch Regional Depot (CHC)</option>
                </select>
              </div>
            </div>

            {/* Shipping Terms & Payment Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Incoterms / Shipping Terms
                </label>
                <input
                  type="text"
                  value={shippingTerms}
                  onChange={(e) => setShippingTerms(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Special Supplier Instructions
              </label>
              <textarea
                rows={2}
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none"
              />
            </div>

            {/* Actions */}
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
                disabled={submitting || !currentQuote}
                className="btn-red-polished text-white text-xs font-semibold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-brand-red/30 disabled:opacity-50"
              >
                {submitting ? 'Generating PO...' : 'Issue Purchase Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
