'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { financeService } from '@/services/finance/financeService';
import { Wallet, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AdjustCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  customerName?: string;
  currentLimit?: number;
}

export function AdjustCreditModal({
  isOpen,
  onClose,
  customerId = 'cus_central_motors',
  customerName = 'Central Motors',
  currentLimit = 15000,
}: AdjustCreditModalProps) {
  const [newLimit, setNewLimit] = useState(currentLimit.toString());
  const [reason, setReason] = useState('Increased workshop volume & verified payment history');
  const [actionType, setActionType] = useState<'adjust' | 'hold' | 'suspend' | 'lift'>('adjust');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (actionType === 'adjust') {
        financeService.adjustCreditLimit(customerId, parseFloat(newLimit) || currentLimit, reason);
      } else if (actionType === 'hold') {
        financeService.setCreditHold(customerId, true, reason);
      } else if (actionType === 'lift') {
        financeService.setCreditHold(customerId, false, reason);
      } else if (actionType === 'suspend') {
        financeService.suspendCreditAccount(customerId, reason);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trade Credit Account Action">
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Credit Facility Updated</h4>
          <p className="text-xs text-slate-500">
            Account terms and limit change registered in commercial trade ledger.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Customer: {customerName}</p>
              <p className="text-indigo-800 text-[11px]">Current Limit: NZ${currentLimit.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Action Type</label>
            <Select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              options={[
                { value: 'adjust', label: 'Adjust Credit Limit (Increase / Decrease)' },
                { value: 'hold', label: 'Place Account On Hold (Pause New POs)' },
                { value: 'lift', label: 'Lift Account Hold (Restore Normal Terms)' },
                { value: 'suspend', label: 'Suspend Credit Facility (Pre-Payment Only)' },
              ]}
              className="w-full text-xs"
            />
          </div>

          {actionType === 'adjust' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Credit Limit (NZD)</label>
              <Input
                type="number"
                step="500"
                required
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full text-xs font-bold text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Justification / Rationale</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for credit change or risk review..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-btn-primary hover:shadow-btn-primary-hover"
              size="sm"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Action'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
