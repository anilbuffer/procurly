'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  MapPin,
  FileCheck2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
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
  const quoteOptions = request.quoteOptions || [];
  
  // Find recommended or first quote
  const defaultOption = quoteOptions.find((q) => q.isRecommended) || quoteOptions[0];
  
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(
    request.approvedQuoteId || defaultOption?.id || ''
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successState, setSuccessState] = useState(false);

  // Sync state when request changes
  React.useEffect(() => {
    if (request.quoteOptions && request.quoteOptions.length > 0) {
      setSelectedQuoteId(request.approvedQuoteId || request.quoteOptions[0].id);
    }
  }, [request]);

  const selectedQuote = quoteOptions.find((q) => q.id === selectedQuoteId) || defaultOption;

  const handleApprove = async () => {
    if (!termsAccepted) {
      setErrorMsg('Please accept the Procurement Terms & Conditions to confirm your order.');
      return;
    }
    if (!selectedQuoteId) return;

    setErrorMsg('');
    setIsApproving(true);
    try {
      await requestsService.approveQuote(request.id, selectedQuoteId);
      setSuccessState(true);
      setTimeout(() => {
        if (onApproved) onApproved();
        onClose();
        setSuccessState(false);
      }, 1400);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while confirming the quote.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await requestsService.rejectQuote(request.id, rejectReason);
      if (onApproved) onApproved();
      onClose();
      setRejectMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRejecting(false);
    }
  };

  const deliveryAddr = request.deliveryAddress || {
    businessName: 'Premier Motors',
    street: '45 Great South Rd',
    suburb: 'Penrose',
    city: 'Auckland',
  };

  const primaryPart = request.parts[0];
  const partDisplay = primaryPart
    ? `${primaryPart.name}${primaryPart.conditionRequired ? ` (${primaryPart.conditionRequired})` : primaryPart.qualityPreference ? ` (${primaryPart.qualityPreference})` : ''}`
    : request.title;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QUOTE REVIEW & FREIGHT SELECTION`}
      description={`Reference: ${request.referenceNumber}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Success Splash Animation */}
        {successState && (
          <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-emerald-900">
              Quote Confirmed & Trade Payment Processed!
            </h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Total <strong>{formatNZD(selectedQuote?.totalLandedCostNZD || 0)} NZD</strong> charged to Premier Motors NZ trade account. Overseas packaging and export customs clearance initiated.
            </p>
          </div>
        )}

        {!successState && (
          <>
            {/* Top Detail Card */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-card border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded border border-red-800">
                  REQUEST DETAILED QUOTE: {request.referenceNumber}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Sourced by Autohub Global
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Vehicle:</span>
                  <span className="font-bold text-white">
                    {request.vehicle.make} {request.vehicle.model} {request.vehicle.year}{' '}
                    <span className="font-mono text-slate-300 text-[11px]">(VIN: {request.vehicle.vin})</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested Part:</span>
                  <span className="font-bold text-white">
                    {partDisplay}
                  </span>
                </div>
              </div>
            </div>

            {/* FREIGHT SELECTION Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ed2025]" />
                  FREIGHT SELECTION (Choose Shipping Option):
                </label>
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-[11px] font-semibold text-brand-blue hover:underline flex items-center gap-1"
                >
                  <span>{showBreakdown ? 'Hide cost breakdown' : 'Show itemized breakdown'}</span>
                  {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Freight Radio Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {quoteOptions.map((opt) => {
                  const isSelected = selectedQuoteId === opt.id;
                  const isAir = opt.type === 'air_express' || opt.type === 'air_standard';
                  const titleLabel = isAir ? 'AIR FREIGHT - FASTEST' : 'SEA FREIGHT - ECONOMY';
                  const badgeColor = isAir ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedQuoteId(opt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#ed2025] bg-red-50/20 ring-2 ring-red-100 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="freightOption"
                            checked={isSelected}
                            onChange={() => setSelectedQuoteId(opt.id)}
                            className="w-4 h-4 text-[#ed2025] focus:ring-[#ed2025] cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 tracking-tight">
                                {titleLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Transit Time: <strong>{opt.transitDays}</strong>
                            </p>
                          </div>
                        </div>

                        <div className={`p-2 rounded-xl ${isAir ? 'bg-red-50 text-[#ed2025]' : 'bg-blue-50 text-brand-blue'}`}>
                          {isAir ? <Plane className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Landed Price:</span>
                          <span className="text-xl font-black text-slate-900">
                            {formatNZD(opt.totalLandedCostNZD)} NZD
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Inc. Freight, Customs, GST
                        </span>
                      </div>

                      {/* Expandable Breakdown */}
                      {showBreakdown && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                          <div className="flex justify-between">
                            <span>Part Sourcing Cost:</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.partCostNZD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>International Freight:</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.freightCostNZD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>NZ Customs & MPI:</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.dutiesAndBiosecurityNZD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>NZ GST (15%):</span>
                            <span className="font-semibold text-slate-800">{formatNZD(opt.gstNZD)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DELIVERY ADDRESS Section */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">DELIVERY ADDRESS:</span>
                <span className="text-slate-700">
                  {deliveryAddr.businessName}, {deliveryAddr.street}, {deliveryAddr.city}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Direct courier to workshop • Lift and loading dock verified
                </span>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setErrorMsg('');
                  }}
                  className="w-4 h-4 rounded text-[#ed2025] focus:ring-[#ed2025] mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-800 leading-snug">
                  I accept the <strong>Procurement Terms & Conditions</strong> and authorize Procurly / Autohub NZ to charge my trade credit account on dispatch.
                </span>
              </label>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 pl-6">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Reject Form (if triggered) */}
            {rejectMode && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-red-900">Reason for Rejecting Quote</h4>
                  <button
                    type="button"
                    onClick={() => setRejectMode(false)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Sourced locally, price exceeds budget, customer declined job..."
                  className="w-full text-xs p-2.5 rounded-lg border border-red-300 bg-white focus:outline-none focus:border-red-500"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setRejectMode(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-100"
                    isLoading={isRejecting}
                    onClick={handleReject}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            {!rejectMode && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 py-2 px-3 transition-colors"
                >
                  [ Reject Quote ]
                </button>

                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className={`w-full sm:w-auto font-black text-xs uppercase tracking-wider px-6 py-3 shadow-lg transition-all ${
                    termsAccepted ? 'bg-[#ed2025] hover:bg-[#d3181d]' : 'opacity-90'
                  }`}
                >
                  CONFIRM & PAY {selectedQuote ? formatNZD(selectedQuote.totalLandedCostNZD) : '$385.00'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
