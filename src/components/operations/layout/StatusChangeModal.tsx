'use client';

import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalRequestStatus } from '@/types/operations';
import { cn } from '@/lib/utils';

export interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  currentStatus: OperationalRequestStatus;
  onStatusUpdated?: (newStatus: OperationalRequestStatus) => void;
}

const ALL_STATUSES: OperationalRequestStatus[] = [
  'Request Submitted',
  'Sourcing',
  'Quote Ready',
  'Awaiting Customer Approval',
  'Customer Approved',
  'Awaiting Payment',
  'Payment Received',
  'Ordered From Supplier',
  'Received At Shipping Facility',
  'In Transit',
  'Arrived In New Zealand',
  'Customs Clearance',
  'Out For Delivery',
  'Delivered',
  'Closed',
  'Payment Failed',
  'On Hold',
  'Procurement Exception',
  'Logistics Exception',
  'Cancelled',
];

export function StatusChangeModal({
  isOpen,
  onClose,
  requestId,
  currentStatus,
  onStatusUpdated,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OperationalRequestStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      operationsService.updateRequestStatus(requestId, selectedStatus, note.trim() || undefined);
      if (onStatusUpdated) {
        onStatusUpdated(selectedStatus);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2B4499] border border-blue-200 flex items-center justify-center font-black">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Change Request Status</h3>
              <p className="text-[11px] text-slate-500">Request reference: <span className="font-bold text-[#2B4499]">{requestId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Current Status</span>
              <span className="font-bold text-slate-800">{currentStatus}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Transitioning To</span>
              <span className="font-bold text-[#2B4499]">{selectedStatus}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select New Status *</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OperationalRequestStatus)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st} {st === currentStatus ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Transition Note (Recorded in Audit History)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Supplier confirmed flight dispatch from Narita Hub..."
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2B4499] shrink-0 mt-0.5" />
            <span>
              This status change will update the request timeline, audit log, and notify the customer workspace where applicable.
            </span>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ed2025] hover:bg-[#d3181d] text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isSubmitting ? 'animate-spin' : '')} />
              <span>Confirm Status Change</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
