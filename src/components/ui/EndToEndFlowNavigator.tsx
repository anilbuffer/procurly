'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  User,
  ShieldCheck,
  PackageCheck,
  CreditCard,
  Truck,
  Sparkles,
  Zap,
  ArrowRight,
  Eye,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { requestsService } from '@/services/requestsService';
import { operationsService } from '@/services/operations/operationsService';
import { syncRequestStatusAcrossRoles } from '@/lib/syncCrossRoleStore';
import { RequestStatus } from '@/types';

export interface EndToEndFlowNavigatorProps {
  requestId?: string;
  currentStatus?: string;
  onStatusChanged?: () => void;
}

const FLOW_STAGES: { id: RequestStatus; number: number; label: string; iconLabel: string; desk: string }[] = [
  { id: 'Request Submitted', number: 1, label: 'Submitted', iconLabel: 'Customer', desk: 'Customer' },
  { id: 'Sourcing', number: 2, label: 'Sourcing', iconLabel: 'Ops/Proc', desk: 'Operations' },
  { id: 'Quote Ready', number: 3, label: 'Quote Ready', iconLabel: 'Ops', desk: 'Customer' },
  { id: 'Awaiting Payment', number: 4, label: 'Customer Approved', iconLabel: 'Customer', desk: 'Customer' },
  { id: 'Payment Received', number: 5, label: 'Payment Received', iconLabel: 'Finance', desk: 'Finance' },
  { id: 'Ordered From Supplier', number: 6, label: 'PO Issued', iconLabel: 'Procurement', desk: 'Procurement' },
  { id: 'In Transit', number: 7, label: 'In Transit', iconLabel: 'Logistics', desk: 'Operations' },
  { id: 'Delivered', number: 8, label: 'Delivered', iconLabel: 'Completed', desk: 'Customer' },
];

export function EndToEndFlowNavigator({
  requestId = 'AH-P-000123',
  currentStatus = 'Quote Ready',
  onStatusChanged,
}: EndToEndFlowNavigatorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // Identify current desk based on URL
  const currentRole = pathname.startsWith('/operations')
    ? 'Operations'
    : pathname.startsWith('/procurement')
    ? 'Procurement'
    : pathname.startsWith('/finance')
    ? 'Finance'
    : 'Customer';

  const getStageIndex = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s.includes('submitted')) return 0;
    if (s.includes('sourcing')) return 1;
    if (s.includes('quote ready') || s.includes('quoted')) return 2;
    if (s.includes('awaiting payment') || s.includes('customer approved')) return 3;
    if (s.includes('payment received') || s.includes('credit approved')) return 4;
    if (s.includes('ordered') || s.includes('facility')) return 5;
    if (s.includes('transit') || s.includes('customs') || s.includes('out for delivery')) return 6;
    if (s.includes('delivered') || s.includes('closed')) return 7;
    return 2;
  };

  const currentIndex = getStageIndex(currentStatus);

  const handleSetStage = async (targetStage: RequestStatus) => {
    setIsUpdating(true);
    try {
      // Execute multi-role real-time synchronization engine across Customer, Operations, Procurement, and Finance
      syncRequestStatusAcrossRoles(requestId, targetStage, {
        actorName: 'Interactive Flow Stepper',
        note: `Manual stage transition to ${targetStage}`,
      });

      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 p-4 text-white shadow-xl mb-6 relative overflow-hidden">
      {/* Background Subtle Accent Pattern */}
      <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#ed2025]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-700/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ed2025] text-white shadow-md">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                End-to-End Order Flow Engine
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded-full border border-white/20 text-slate-200">
                AH-P-000123
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              AutoCare Auckland · 2019 Toyota Hiace (Left Front Lower Control Arm)
            </p>
          </div>
        </div>

        {/* PERSPECTIVE / DESK SWITCHER BUTTONS */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-700/80 shrink-0 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden lg:inline">
            Active Desk:
          </span>
          <Link
            href="/requests/req_123"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentRole === 'Customer'
                ? 'bg-[#ed2025] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </Link>

          <Link
            href="/operations/requests/AH-P-000123"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentRole === 'Operations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operations Desk</span>
          </Link>

          <Link
            href="/procurement/requests"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentRole === 'Procurement'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Procurement Desk</span>
          </Link>

          <Link
            href="/finance/payments"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentRole === 'Finance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Finance Desk</span>
          </Link>
        </div>
      </div>

      {/* 8-STAGE VISUAL INTERACTIVE STEPPER */}
      <div className="pt-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-[820px] px-1">
          {FLOW_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => handleSetStage(stage.id)}
                  disabled={isUpdating}
                  title={`Click to simulate setting stage to: ${stage.label}`}
                  className={`flex flex-col items-center group cursor-pointer transition-all ${
                    isUpdating ? 'opacity-50' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? 'bg-[#ed2025] text-white ring-4 ring-red-500/30 scale-110 shadow-lg'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 group-hover:border-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.number}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-bold whitespace-nowrap leading-none ${
                      isCurrent ? 'text-red-400 font-black' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 font-mono">{stage.iconLabel}</span>
                </button>

                {idx < FLOW_STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 transition-all ${
                      idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* CONNECTED ENTITIES & QUICK DEMO BAR */}
      <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-3 flex-wrap font-mono text-[11px]">
          <span className="text-slate-400 font-sans font-bold">Connected Objects:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-red-300">
            Request: AH-P-000123
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300">
            Order: ORD-000123
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300">
            Payment: PAY-000123
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-300">
            Shipment: SHP-000123
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Current Status:</span>
          <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
            {currentStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
