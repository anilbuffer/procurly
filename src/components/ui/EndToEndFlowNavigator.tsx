'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Check,
  Zap,
  User,
  ShieldCheck,
  Package,
  CreditCard,
} from 'lucide-react';
import { syncRequestStatusAcrossRoles } from '@/lib/syncCrossRoleStore';
import { RequestStatus } from '@/types';
import { QuoteComparisonModal } from '@/components/forms/QuoteComparisonModal';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { DocumentPreviewModal } from '@/components/ui/DocumentPreviewModal';
import { requestsService } from '@/services/requestsService';
import { PartRequest, PortalDocument } from '@/types';

export interface EndToEndFlowNavigatorProps {
  requestId?: string;
  currentStatus?: string;
  onStatusChanged?: () => void;
}

export interface MasterStep {
  stepNumber: number;
  id: RequestStatus;
  title: string;
  role: 'Customer' | 'Ops/Proc' | 'Ops' | 'Finance' | 'Procurement' | 'Logistics' | 'Completed';
  description: string;
  deskUrl: string;
}

export const MASTER_8_STEPS: MasterStep[] = [
  {
    stepNumber: 1,
    id: 'Request Submitted',
    title: 'Submitted',
    role: 'Customer',
    description: 'Customer registered and submitted part request for 2019 Toyota Hiace.',
    deskUrl: '/requests/req_123',
  },
  {
    stepNumber: 2,
    id: 'Sourcing',
    title: 'Sourcing',
    role: 'Ops/Proc',
    description: 'Dedicated specialist assigned. Japanese supplier quotations recorded & compared.',
    deskUrl: '/procurement/requests/req_000123',
  },
  {
    stepNumber: 3,
    id: 'Quote Ready',
    title: 'Quote Ready',
    role: 'Ops',
    description: 'Landed cost calculated. Customer quote generated with Air & Sea freight options.',
    deskUrl: '/operations/requests/AH-P-000123',
  },
  {
    stepNumber: 4,
    id: 'Customer Approved',
    title: 'Customer Approved',
    role: 'Customer',
    description: 'Customer accepted verified quotation & terms. Air Express delivery chosen.',
    deskUrl: '/requests/req_123',
  },
  {
    stepNumber: 5,
    id: 'Payment Received',
    title: 'Payment Received',
    role: 'Finance',
    description: 'Finance verified trade credit / direct wire payment. Procurement unlocked.',
    deskUrl: '/finance/payments/PAY-000123',
  },
  {
    stepNumber: 6,
    id: 'Ordered From Supplier',
    title: 'PO Issued',
    role: 'Procurement',
    description: 'Purchase Order PO-NZ-4032 placed with Tokyo Auto Spares.',
    deskUrl: '/procurement/requests/req_000123',
  },
  {
    stepNumber: 7,
    id: 'In Transit',
    title: 'In Transit',
    role: 'Logistics',
    description: 'Dispatched from Tokyo Hub via Air NZ Flight NZ90. Live tracking via NZ Post.',
    deskUrl: '/operations/requests/AH-P-000123',
  },
  {
    stepNumber: 8,
    id: 'Delivered',
    title: 'Delivered',
    role: 'Completed',
    description: 'NZ Post courier delivery completed to AutoCare Auckland workshop.',
    deskUrl: '/operations/requests/AH-P-000123',
  },
];

// Backwards compatibility alias
export const MASTER_15_STEPS = MASTER_8_STEPS;

export function EndToEndFlowNavigator({
  requestId = 'AH-P-000123',
  currentStatus = 'In Transit',
  onStatusChanged,
}: EndToEndFlowNavigatorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals for quick previews
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docToPreview, setDocToPreview] = useState<PortalDocument | null>(null);
  const [currentRequest, setCurrentRequest] = useState<PartRequest | null>(null);

  useEffect(() => {
    setMounted(true);
    requestsService.getRequestById(requestId).then((res) => {
      if (res) setCurrentRequest(res);
    });
  }, [requestId, currentStatus]);

  // Identify active desk safely
  const currentPath = pathname || '';
  const currentRole = currentPath.startsWith('/operations')
    ? 'Operations'
    : currentPath.startsWith('/procurement')
    ? 'Procurement'
    : currentPath.startsWith('/finance')
    ? 'Finance'
    : 'Customer';

  const mapStatusToStepIndex = (statusStr: string): number => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('delivered') || s.includes('closed') || s.includes('completed')) return 7;
    if (
      s.includes('in transit') ||
      s.includes('shipped') ||
      s.includes('shipping facility') ||
      s.includes('facility') ||
      s.includes('customs') ||
      s.includes('out for delivery') ||
      s.includes('arrived in new zealand')
    ) {
      return 6;
    }
    if (s.includes('po issued') || s.includes('ordered') || s.includes('ready for procurement')) return 5;
    if (s.includes('payment received') || s.includes('reconciled')) return 4;
    if (
      s.includes('customer approved') ||
      s.includes('confirmed') ||
      s.includes('payment pending') ||
      s.includes('awaiting payment') ||
      s.includes('review quote') ||
      s.includes('approval')
    ) {
      return 3;
    }
    if (s.includes('quote ready') || s.includes('quoted') || s.includes('quotes recorded') || s.includes('sourcing complete')) {
      return 2;
    }
    if (s.includes('sourcing') || s.includes('assigned') || s.includes('specialist')) return 1;
    if (s.includes('submitted')) return 0;
    return 6; // Default to In Transit (Step 7)
  };

  const currentStepIdx = mapStatusToStepIndex(currentStatus);
  const activeStep = MASTER_8_STEPS[currentStepIdx] || MASTER_8_STEPS[6];

  const handleStepTransition = async (stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= MASTER_8_STEPS.length) return;
    const target = MASTER_8_STEPS[stepIdx];
    setIsUpdating(true);
    try {
      syncRequestStatusAcrossRoles(requestId, target.id, {
        actorName: `8-Step Flow Engine (${currentRole} Desk)`,
        note: `Flow transition to Step ${target.stepNumber}: ${target.title}`,
      });
      if (onStatusChanged) onStatusChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div suppressHydrationWarning className="bg-[#0B1120] rounded-2xl border border-slate-800 p-4 sm:p-5 text-white shadow-2xl mb-6 relative overflow-hidden">
        {/* TOP ROW: ENGINE IDENTITY & ACTIVE DESK SWITCHER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
          {/* Left: Engine Logo & Request Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ed2025] flex items-center justify-center text-white shadow-md shadow-red-950/60 shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-[#ed2025]">
                  END-TO-END ORDER FLOW ENGINE
                </span>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#172033] text-slate-300 rounded-full border border-slate-700/80">
                  {requestId}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                AutoCare Auckland · 2019 Toyota Hiace (Left Front Lower Control Arm)
              </p>
            </div>
          </div>

          {/* Right: ACTIVE DESK BUTTONS */}
          <div className="flex items-center gap-1.5 bg-[#070D18] p-1.5 rounded-xl border border-slate-800/90 shrink-0 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
              ACTIVE DESK:
            </span>

            <Link
              href={`/requests/${requestId}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'Customer'
                  ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </Link>

            <Link
              href={`/operations/requests/${requestId}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'Operations'
                  ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Operations Desk</span>
            </Link>

            <Link
              href={`/procurement/requests/${requestId}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'Procurement'
                  ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Procurement Desk</span>
            </Link>

            <Link
              href={`/finance/payments/PAY-${requestId.replace(/[^0-9]/g, '') || '000143'}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'Finance'
                  ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Finance Desk</span>
            </Link>
          </div>
        </div>

        {/* MIDDLE ROW: THE 8-STEP HORIZONTAL STEPPER WITH CONNECTING LINES */}
        <div className="overflow-x-auto custom-scrollbar pt-4 pb-4 my-1">
          <div className="flex items-start justify-between relative min-w-[740px]">
            {MASTER_8_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const hasNext = idx < MASTER_8_STEPS.length - 1;

              return (
                <div
                  key={step.stepNumber}
                  className="flex-1 flex flex-col items-center relative text-center group"
                >
                  {/* Connecting Horizontal Line to Next Step */}
                  {hasNext && (
                    <div
                      className={`absolute top-3.5 sm:top-4 left-1/2 w-full h-[2.5px] -z-0 transition-colors ${
                        idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    />
                  )}

                  {/* Step Circle Button (Clickable for Instant Live Transition) */}
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStepTransition(idx)}
                    title={`Click to set stage: Step ${step.stepNumber} (${step.title})`}
                    className={`relative z-10 flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'w-8 h-8 rounded-full bg-[#ed2025] text-white shadow-lg shadow-red-950/70 ring-4 ring-red-500/25 scale-110'
                        : isPast
                        ? 'w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm hover:scale-110'
                        : 'w-7 h-7 rounded-full bg-[#1e293b] text-slate-400 border border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    ) : (
                      <span className="text-xs font-black">{step.stepNumber}</span>
                    )}
                  </button>

                  {/* Step Title */}
                  <button
                    type="button"
                    onClick={() => handleStepTransition(idx)}
                    className={`text-xs font-bold mt-2 transition-colors cursor-pointer text-center block ${
                      isCurrent
                        ? 'text-[#ed2025]'
                        : isPast
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {step.title}
                  </button>

                  {/* Step Role / Sub-label */}
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {step.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ROW: CONNECTED OBJECTS & CURRENT STATUS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 mt-1">
          {/* Left: Connected Objects */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-400">Connected Objects:</span>
            <Link
              href={`/operations/requests/${requestId}`}
              className="px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700/80 text-slate-300 font-mono text-xs hover:text-white hover:border-slate-500 transition-colors"
            >
              Request: {requestId}
            </Link>
            <Link
              href={`/procurement/requests/${requestId}`}
              className="px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700/80 text-slate-300 font-mono text-xs hover:text-white hover:border-slate-500 transition-colors"
            >
              Order: ORD-{requestId.replace(/[^0-9]/g, '') || '000143'}
            </Link>
            <Link
              href={`/finance/payments/PAY-${requestId.replace(/[^0-9]/g, '') || '000143'}`}
              className="px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700/80 text-slate-300 font-mono text-xs hover:text-white hover:border-slate-500 transition-colors"
            >
              Payment: PAY-{requestId.replace(/[^0-9]/g, '') || '000143'}
            </Link>
            <Link
              href="/operations/shipments"
              className="px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700/80 text-slate-300 font-mono text-xs hover:text-white hover:border-slate-500 transition-colors"
            >
              Shipment: SHP-{requestId.replace(/[^0-9]/g, '') || '000143'}
            </Link>
          </div>

          {/* Right: Current Status Pill */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="font-semibold text-slate-400">Current Status:</span>
            <span className="px-3 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-xs font-bold text-white shadow-inner">
              {activeStep.title}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Modals */}
      <QuoteComparisonModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        request={currentRequest}
        onApproved={() => {
          if (onStatusChanged) onStatusChanged();
        }}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payment={null}
        request={currentRequest}
        onPaymentSuccess={() => {
          if (onStatusChanged) onStatusChanged();
        }}
      />

      <DocumentPreviewModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        document={docToPreview}
      />
    </>
  );
}
