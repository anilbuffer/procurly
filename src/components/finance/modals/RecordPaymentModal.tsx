'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { financeService } from '@/services/finance/financeService';
import { PaymentMethodType, PaymentStatusType } from '@/types/finance';
import { Check } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRequestNumber?: string;
  defaultCustomerId?: string;
  defaultAmount?: number;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  defaultRequestNumber = '',
  defaultCustomerId = 'cus_autocare_akl',
  defaultAmount = 485,
}: RecordPaymentModalProps) {
  const [requestNumber, setRequestNumber] = useState(defaultRequestNumber);
  const [customerId, setCustomerId] = useState(defaultCustomerId);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Bank Transfer');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('Received');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const customerOptions = [
    { value: 'cus_autocare_akl', label: 'AutoCare Auckland (NZBN 9429038819201)' },
    { value: 'cus_central_motors', label: 'Central Motors (NZBN 9429041192834)' },
    { value: 'cus_west_auto', label: 'West Auto (NZBN 9429037748190)' },
    { value: 'cus_tauranga_euro', label: 'Tauranga Euro Specialists (NZBN 9429048891273)' },
    { value: 'cus_south_island_fleet', label: 'South Island Fleet Services (NZBN 9429031129984)' },
    { value: 'cus_north_shore_auto', label: 'North Shore Auto Group (NZBN 9429039918234)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedCust = customerOptions.find((c) => c.value === customerId);
    const custName = selectedCust?.label.split(' (')[0] || 'Direct Workshop';

    try {
      financeService.recordPayment({
        requestNumber: requestNumber || `AH-P-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId,
        customerName: custName,
        amount: parseFloat(amount) || 0,
        method: paymentMethod,
        status: paymentStatus,
        bankReference: reference || `BNZ-WIRE-${Math.floor(100000 + Math.random() * 900000)}`,
        internalNotes: notes ? [notes] : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Record & Reconcile Payment">
      {success ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="text-base font-black text-slate-900">Payment Successfully Recorded</h3>
          <p className="text-xs text-slate-500">
            Payment allocated to {requestNumber || 'request'} and financial clearance status updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer</label>
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={customerOptions}
              className="w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Ref (AH-P-XXX)</label>
              <Input
                value={requestNumber}
                onChange={(e) => setRequestNumber(e.target.value)}
                placeholder="e.g. AH-P-000123"
                className="w-full text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (NZD incl GST)</label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                options={[
                  { value: 'Bank Transfer', label: 'Direct Bank Wire (BNZ / ANZ)' },
                  { value: 'Account2Account', label: 'Account2Account (Instant)' },
                  { value: 'Trade Credit', label: 'Trade Credit Facility (20th Mth Following)' },
                  { value: 'Direct Debit', label: 'Direct Debit' },
                  { value: 'Card', label: 'Credit / Debit Card' },
                ]}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Status</label>
              <Select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatusType)}
                options={[
                  { value: 'Received', label: 'Received & Cleared' },
                  { value: 'Pending', label: 'Pending Bank Confirmation' },
                  { value: 'Credit Approved', label: 'Credit Approved' },
                  { value: 'Failed', label: 'Failed' },
                ]}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bank Remittance Reference</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. ANZ-REF-99182 or BNZ-WIRE-29182"
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Internal Note</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add payment context or workshop reference..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold"
              size="sm"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
