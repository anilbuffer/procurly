'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { financeService } from '@/services/finance/financeService';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface FinancialClearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  amount?: number;
}

export function FinancialClearanceModal({
  isOpen,
  onClose,
  orderId = 'ORD-2026-0088',
  orderNumber = 'ORD-2026-0088',
  customerName = 'Central Motors',
  amount = 720,
}: FinancialClearanceModalProps) {
  const [note, setNote] = useState('Payment remittance verified. Released for immediate supplier procurement.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGrantClearance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      financeService.grantFinancialClearance(orderId, note);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Grant Financial Clearance">
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Order Financially Cleared</h4>
          <p className="text-xs text-slate-500">
            Released to Procurement Pipeline. Supplier PO generation unlocked.
          </p>
        </div>
      ) : (
        <form onSubmit={handleGrantClearance} className="space-y-4 pt-1">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Core Finance Workflow Step</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Customer Approval → <strong>Finance Clearance</strong> → Release to Procurement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Reference</label>
              <Input value={orderNumber} disabled className="w-full text-xs bg-slate-100 font-mono font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Order Value</label>
              <Input value={`NZ$${amount.toFixed(2)}`} disabled className="w-full text-xs bg-slate-100 font-bold text-emerald-700" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
            <Input value={customerName} disabled className="w-full text-xs bg-slate-100 font-semibold" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clearance Note / Handover Reference</label>
            <textarea
              rows={3}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold flex items-center gap-1.5 shadow-btn-primary hover:shadow-btn-primary-hover"
              size="sm"
            >
              <span>{isSubmitting ? 'Clearing...' : 'Clear & Release Order'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
