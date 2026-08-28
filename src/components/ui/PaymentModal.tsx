'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { PaymentTransaction, PartRequest } from '@/types';
import { formatNZD } from '@/lib/utils';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Receipt,
} from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentTransaction | null;
  request?: PartRequest | null;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  payment,
  request,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    'Approved Trade Credit (20th Mth Following)' | 'Credit Card (Visa/Mastercard)' | 'Account2Account Bank Transfer'
  >('Approved Trade Credit (20th Mth Following)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!payment && !request) return null;

  const totalAmount = payment?.amountNZD || request?.quoteOptions?.find((q) => q.id === request.approvedQuoteId)?.totalLandedCostNZD || 485.0;
  const refNumber = payment?.requestNumber || request?.referenceNumber || 'AH-P-000123';
  const itemSummary = payment?.partSummary || request?.parts[0]?.name || 'Automotive Component';

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      // Simulate network request
      await new Promise((res) => setTimeout(res, 800));

      const paymentId = payment?.id || `pay_${Date.now()}`;
      await requestsService.processPayment(paymentId, selectedMethod);

      setIsSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg('Payment could not be completed. Please try again or use your approved trade credit account.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="Complete Procurement Payment">
      {isSuccess ? (
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-fade-in shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Confirmed
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2">
              Payment Received for {refNumber}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Autohub has verified your payment of <strong>{formatNZD(totalAmount)} NZD</strong> via{' '}
              {selectedMethod}. Procurement orders have been dispatched to the supplier.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm mx-auto text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt Ref:</span>
              <span className="font-mono font-bold text-slate-900">RCP-{refNumber.replace('AH-P-', '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account:</span>
              <span className="font-bold text-slate-900">AutoCare Auckland</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-700">Procurement In Progress</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" size="md" onClick={handleClose}>
              Return to Portal
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-brand-blue uppercase">
                {refNumber}
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-sm">
                {itemSummary}
              </h4>
              <p className="text-[11px] text-slate-500">Consignee: AutoCare Auckland</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Amount Due:</span>
              <span className="text-xl font-black text-slate-900 tracking-tight text-[#ed2025]">
                {formatNZD(totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Payment Method:
            </label>

            {/* Option 1: Approved Trade Credit Account */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 block ${
                selectedMethod === 'Approved Trade Credit (20th Mth Following)'
                  ? 'border-[#ed2025] bg-red-50/30 ring-2 ring-red-100 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedMethod === 'Approved Trade Credit (20th Mth Following)'}
                onChange={() => setSelectedMethod('Approved Trade Credit (20th Mth Following)')}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-blue" />
                    <span className="text-xs font-black text-slate-900">
                      Approved Trade Credit Account
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    20th Month Following
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Charge directly to AutoCare Auckland account ($50,000 credit line approved). Instant authorization.
                </p>
              </div>
            </label>

            {/* Option 2: Credit Card */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 block ${
                selectedMethod === 'Credit Card (Visa/Mastercard)'
                  ? 'border-[#ed2025] bg-red-50/30 ring-2 ring-red-100 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedMethod === 'Credit Card (Visa/Mastercard)'}
                onChange={() => setSelectedMethod('Credit Card (Visa/Mastercard)')}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Company Credit / Debit Card
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Visa • Mastercard • AMEX</span>
                </div>
                <p className="text-xs text-slate-500">
                  Instant secure payment gateway via Stripe 256-bit SSL encryption.
                </p>
              </div>
            </label>

            {/* Option 3: Account2Account / Poli */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 block ${
                selectedMethod === 'Account2Account Bank Transfer'
                  ? 'border-[#ed2025] bg-red-50/30 ring-2 ring-red-100 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={selectedMethod === 'Account2Account Bank Transfer'}
                onChange={() => setSelectedMethod('Account2Account Bank Transfer')}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Account2Account / POLi Direct Bank Deposit
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">NZ Banks Direct</span>
                </div>
                <p className="text-xs text-slate-500">
                  Direct transfer from ANZ, ASB, BNZ, Westpac, Kiwibank trade accounts.
                </p>
              </div>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Security & Action */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>B2B Enterprise Encrypted Transaction</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="md" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handlePay}
                isLoading={isProcessing}
                className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-6 shadow-md"
              >
                Confirm & Authorize {formatNZD(totalAmount)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
