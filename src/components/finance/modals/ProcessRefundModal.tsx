'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { financeService } from '@/services/finance/financeService';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundId?: string;
  paymentId?: string;
  defaultAmount?: number;
  customerName?: string;
}

export function ProcessRefundModal({
  isOpen,
  onClose,
  refundId = 'REF-0090',
  paymentId = 'PAY-00121',
  defaultAmount = 310,
  customerName = 'West Auto',
}: ProcessRefundModalProps) {
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [reason, setReason] = useState('Customer Cancellation Before Dispatch');
  const [notes, setNotes] = useState('Customer vehicle written off prior to dispatch.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (refundId) {
        financeService.processRefund(refundId);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Authorize & Settle Refund">
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Refund Executed Successfully</h4>
          <p className="text-xs text-slate-500">
            Payment gateway refund completed and transaction ledger updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleExecuteRefund} className="space-y-4 pt-1">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sensitive Financial Action</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Executing this refund will reverse payment gateway charges and issue an official Credit Note.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Refund Reference</label>
              <Input value={refundId} disabled className="w-full text-xs bg-slate-100 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Payment</label>
              <Input value={paymentId} disabled className="w-full text-xs bg-slate-100 font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
            <Input value={customerName} disabled className="w-full text-xs bg-slate-100 font-semibold" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Refund Amount (NZD)</label>
            <Input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Refund Reason</label>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={[
                { value: 'Part Unavailable at Origin', label: 'Part Unavailable at Origin' },
                { value: 'Customer Cancellation Before Dispatch', label: 'Customer Cancellation Before Dispatch' },
                { value: 'Duplicate Payment Settled', label: 'Duplicate Payment Settled' },
                { value: 'Pricing Adjustment / Freight Rebate', label: 'Pricing Adjustment / Freight Rebate' },
                { value: 'Damaged Goods in Transit', label: 'Damaged Goods in Transit' },
              ]}
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Justification</label>
            <textarea
              rows={2}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              {isSubmitting ? 'Processing...' : 'Authorize & Settle Refund'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
