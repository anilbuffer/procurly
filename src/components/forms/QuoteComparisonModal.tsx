'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PartRequest, QuoteOption } from '@/types';
import { requestsService } from '@/services/requestsService';
import { formatNZD, formatDate } from '@/lib/utils';
import {
  Plane,
  Ship,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Car,
  Clock,
  ArrowRight,
  AlertTriangle,
  Lock,
  FileCheck,
} from 'lucide-react';
import { PaymentModal } from '@/components/ui/PaymentModal';

export interface QuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PartRequest | null;
  onApproved?: () => void;
}

export function QuoteComparisonModal({
  isOpen,
  onClose,
  request,
  onApproved,
}: QuoteComparisonModalProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [confirmInfoChecked, setConfirmInfoChecked] = useState(false);
  const [acceptTermsChecked, setAcceptTermsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [acceptedRequest, setAcceptedRequest] = useState<PartRequest | null>(null);

  React.useEffect(() => {
    if (request?.quoteOptions && request.quoteOptions.length > 0) {
      const rec = request.quoteOptions.find((q) => q.isRecommended) || request.quoteOptions[0];
      setSelectedQuoteId(rec.id);
    }
    setConfirmInfoChecked(false);
    setAcceptTermsChecked(false);
  }, [request]);

  if (!request) return null;

  const quoteOptions = request.quoteOptions || [];
  const selectedQuote = quoteOptions.find((q) => q.id === selectedQuoteId) || quoteOptions[0];

  const handleAcceptAndContinue = async () => {
    if (!confirmInfoChecked || !acceptTermsChecked) return;

    setIsSubmitting(true);
    try {
      const { request: updatedReq } = await requestsService.acceptQuote(request.id, selectedQuoteId, {
        acceptedBy: 'James Wilson (AutoCare Auckland)',
        termsVersion: 'v2.4-2026',
      });

      setAcceptedRequest(updatedReq);
      if (onApproved) onApproved();
      // Open Payment Modal
      setPaymentModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentCompleted = () => {
    setPaymentModalOpen(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !paymentModalOpen} onClose={onClose} size="xl" title={`Review Landed Quotation — ${request.referenceNumber}`}>
        <div className="space-y-6">
          {/* 1. Header Overview Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  {request.referenceNumber}
                </span>
                <span className="text-xs text-slate-300">
                  Vehicle: {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                {request.parts[0]?.name || request.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                VIN: {request.vehicle.vin} • Qty: {request.parts[0]?.quantity || 1} • {request.parts[0]?.qualityPreference || 'Genuine OEM'}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Landed Price:</span>
              <span className="text-2xl font-black text-white tracking-tight">
                {selectedQuote ? formatNZD(selectedQuote.totalLandedCostNZD) : '--'}
              </span>
              <span className="text-[10px] text-emerald-400 block font-semibold">Inc. Freight, Customs, GST</span>
            </div>
          </div>

          {/* 2. Freight Selection Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                Select Freight Method:
              </label>
              <span className="text-[11px] text-slate-500 font-medium">All options include door-to-door delivery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quoteOptions.map((opt) => {
                const isSelected = opt.id === selectedQuoteId;
                const isAir = opt.type === 'air' || opt.type === 'air_express';

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedQuoteId(opt.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-[#ed2025] bg-red-50/20 ring-2 ring-red-100 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {opt.isRecommended && (
                      <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-[#ed2025] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                        Recommended
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isAir ? 'bg-red-50 text-[#ed2025]' : 'bg-blue-50 text-brand-blue'
                        }`}
                      >
                        {isAir ? <Plane className="w-5 h-5" /> : <Ship className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{opt.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Estimated delivery: <strong>{opt.transitDays}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Total Landed:</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatNZD(opt.totalLandedCostNZD)}
                      </span>
                    </div>

                    {opt.notes && (
                      <p className="text-[10px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                        {opt.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Transparent Landed Cost Breakdown (Strictly Customer Visible) */}
          {selectedQuote && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Cost Breakdown — {selectedQuote.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500">Guaranteed Landed Price (NZD)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Part Specification Cost:</span>
                  <span className="font-mono font-semibold">{formatNZD(selectedQuote.partCostNZD)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>International & Regional Freight:</span>
                  <span className="font-mono font-semibold">{formatNZD(selectedQuote.freightCostNZD)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Procurement & Logistics Coordination Service:</span>
                  <span className="font-mono font-semibold">{formatNZD(selectedQuote.procurementServiceNZD || 50.0)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>TOTAL LANDED (Door-to-Door):</span>
                  <span className="font-mono text-base text-[#ed2025]">{formatNZD(selectedQuote.totalLandedCostNZD)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Verification Checkboxes & Acceptance */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-brand-blue" />
              <span>Confirm Your Procurement</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmInfoChecked}
                  onChange={(e) => setConfirmInfoChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#ed2025] focus:ring-[#ed2025]"
                />
                <span>
                  I confirm the vehicle information ({request.vehicle.year} {request.vehicle.make} {request.vehicle.model}, VIN {request.vehicle.vin}) and requested part specifications are correct.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTermsChecked}
                  onChange={(e) => setAcceptTermsChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#ed2025] focus:ring-[#ed2025]"
                />
                <span>
                  I accept the <strong>Procurly Procurement Terms & Conditions</strong> and authorize Autohub to coordinate overseas procurement on behalf of <strong>AutoCare Auckland</strong>.
                </span>
              </label>
            </div>
          </div>

          {/* 5. Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Records user James Wilson • Timestamp • Quote version</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!confirmInfoChecked || !acceptTermsChecked || isSubmitting}
                isLoading={isSubmitting}
                onClick={handleAcceptAndContinue}
                className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-6 shadow-md"
              >
                Accept & Continue →
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Linked Payment Modal on Acceptance */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={handlePaymentCompleted}
        payment={null}
        request={acceptedRequest || request}
        onPaymentSuccess={handlePaymentCompleted}
      />
    </>
  );
}
