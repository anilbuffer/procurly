'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PartRequest, QuoteOption } from '@/types';
import { formatNZD } from '@/lib/utils';
import { requestsService } from '@/services/requestsService';
import {
  Plane,
  Ship,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface QuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PartRequest;
  onApproved?: () => void;
}

export function QuoteComparisonModal({
  isOpen,
  onClose,
  request,
  onApproved,
}: QuoteComparisonModalProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(
    request.approvedQuoteId || (request.quoteOptions && request.quoteOptions[0]?.id) || ''
  );
  const [isApproving, setIsApproving] = useState(false);

  const quoteOptions = request.quoteOptions || [];

  const handleApprove = async () => {
    if (!selectedQuoteId) return;
    setIsApproving(true);
    try {
      await requestsService.approveQuote(request.id, selectedQuoteId);
      if (onApproved) onApproved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Landed Cost Quotation Review - ${request.referenceNumber}`}
      description={`${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model} (VIN: ${request.vehicle.vin})`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Guarantee Banner */}
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Autohub Landed Price Guarantee:</strong> Includes all overseas export packing, international freight, NZ customs tariffs, MPI biosecurity inspection, and direct courier to your workshop.
          </span>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quoteOptions.map((opt) => {
            const isSelected = selectedQuoteId === opt.id;
            const isAir = opt.type === 'air_express' || opt.type === 'air_standard';

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedQuoteId(opt.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-brand-red bg-red-50/20 ring-2 ring-red-100 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {opt.isRecommended && (
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider bg-brand-red text-white px-2.5 py-0.5 rounded-full shadow-sm">
                    Recommended
                  </span>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isAir ? 'bg-red-50 text-brand-red' : 'bg-blue-50 text-brand-blue'
                    }`}
                  >
                    {isAir ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isAir ? 'Priority Air Freight' : 'Consolidated Sea Freight'}
                    </h4>
                    <p className="text-[11px] text-slate-500">{opt.carrierName}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatNZD(opt.totalLandedCostNZD)}
                  </p>
                  <p className="text-xs text-slate-500">All-Inclusive Total (NZD)</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Transit:</span>
                    <span className="font-bold text-slate-900">{opt.transitDays}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Date:</span>
                    <span className="font-bold text-emerald-700">{opt.estimatedDeliveryDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Part Sourcing Cost:</span>
                    <span className="font-medium text-slate-800">{formatNZD(opt.partCostNZD)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight & Packing:</span>
                    <span className="font-medium text-slate-800">{formatNZD(opt.freightCostNZD)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>NZ Customs & MPI:</span>
                    <span className="font-medium text-slate-800">{formatNZD(opt.dutiesAndBiosecurityNZD)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>NZ GST (15%):</span>
                    <span className="font-medium text-slate-800">{formatNZD(opt.gstNZD)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Local NZ Delivery:</span>
                    <span className="font-medium text-slate-800">{formatNZD(opt.localCourierNZD)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  {opt.notes}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={onClose} className="text-xs">
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            isLoading={isApproving}
            onClick={handleApprove}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-lg font-bold text-xs tracking-wide"
          >
            Approve Selected Option & Initiate Dispatch
          </Button>
        </div>
      </div>
    </Modal>
  );
}
