'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  History,
  ArrowRight,
  FileText,
  CreditCard,
  Building2,
  Zap,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinancialException, FinancialExceptionStage } from '@/types/finance';
import { INITIAL_FINANCIAL_EXCEPTIONS } from '@/services/finance/mockData';

export default function ExceptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'EXC-2026-001';

  const resolveException = (id: string): FinancialException => {
    return (
      financeService.getExceptionById(id) ||
      INITIAL_FINANCIAL_EXCEPTIONS.find((e) => e.id.toLowerCase() === id.toLowerCase() || e.requestNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_FINANCIAL_EXCEPTIONS.find((e) => e.id.toLowerCase().includes(id.toLowerCase()) || id.toLowerCase().includes(e.id.toLowerCase())) ||
      INITIAL_FINANCIAL_EXCEPTIONS[0]
    );
  };

  const initialException = resolveException(rawId);
  const [exception, setException] = useState<FinancialException>(initialException);
  const [transitionNote, setTransitionNote] = useState('');
  const [selectedNextStage, setSelectedNextStage] = useState<FinancialExceptionStage>('Investigate');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    const e = resolveException(rawId);
    setException(e);
    // Auto compute default next stage
    const stageSequence: FinancialExceptionStage[] = [
      'Detect',
      'Review',
      'Assign',
      'Investigate',
      'Take Action',
      'Resolve',
      'Close',
    ];
    const curIdx = stageSequence.indexOf(e.stage);
    if (curIdx < stageSequence.length - 1) {
      setSelectedNextStage(stageSequence[curIdx + 1]);
    } else {
      setSelectedNextStage('Close');
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  const handleStageTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionNote.trim()) return;

    financeService.updateExceptionStage(exception.id, selectedNextStage, transitionNote);
    setTransitionNote('');
    setSuccessMsg(`Stage successfully updated to "${selectedNextStage}".`);
    setTimeout(() => setSuccessMsg(null), 3000);
    loadData();
  };

  const stagesList: FinancialExceptionStage[] = [
    'Detect',
    'Review',
    'Assign',
    'Investigate',
    'Take Action',
    'Resolve',
    'Close',
  ];
  const currentStageIndex = stagesList.indexOf(exception.stage);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-slide-up border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/exceptions"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight">{exception.id}</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-extrabold',
                  exception.severity === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : exception.severity === 'High'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                )}
              >
                {exception.severity} Severity
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {exception.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detected on {exception.detectedAt} • Assigned Officer: <strong>{exception.assignedOfficer}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 7-Stage Visual Lifecycle Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          7-Stage Resolution Progression
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stagesList.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={st}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  isCurrent
                    ? 'bg-red-600 border-red-600 text-white font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                )}
              >
                <div className="text-[10px] uppercase font-bold opacity-75">
                  {idx + 1}. {st}
                </div>
                <div className="text-xs mt-0.5 flex items-center justify-center gap-1 font-bold">
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  <span>{isCurrent ? 'Active' : isCompleted ? 'Passed' : 'Pending'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details + Resolution Form + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Summary, Resolution Form, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Exception Investigation Overview
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Amount at Risk</span>
                <span className="text-lg font-black text-red-600 block mt-0.5">
                  NZ${exception.amountAtRisk.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Associated Customer</span>
                <Link
                  href={`/finance/customers/${exception.customerId}`}
                  className="font-bold text-slate-900 hover:text-red-700 hover:underline block mt-0.5"
                >
                  {exception.customerName}
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">Req: {exception.requestNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Current Resolution Stage</span>
                <span className="font-bold text-purple-700 block mt-0.5">{exception.stage}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{exception.status}</span>
              </div>
            </div>

            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-1 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-900 block">
                Exception Detection Summary
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{exception.summary}</p>
            </div>

            {exception.investigationFindings && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                  Investigation Findings & Evidence
                </span>
                <p className="text-slate-700 leading-relaxed">{exception.investigationFindings}</p>
              </div>
            )}
          </div>

          {/* Advance Stage Form */}
          {exception.stage !== 'Close' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Advance Exception Resolution Stage
              </h2>

              <form onSubmit={handleStageTransition} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Next Stage</label>
                    <select
                      value={selectedNextStage}
                      onChange={(e) => setSelectedNextStage(e.target.value as FinancialExceptionStage)}
                      className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:outline-none"
                    >
                      {stagesList.slice(currentStageIndex + 1).map((st) => (
                        <option key={st} value={st}>
                          Advance to: {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stage Action Note / Evidence Justification
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={transitionNote}
                    onChange={(e) => setTransitionNote(e.target.value)}
                    placeholder="Describe investigation outcome, communication with customer or gateway adjustment..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
                  >
                    <span>Record Stage & Advance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Exception Audit Timeline</span>
              <History className="w-4 h-4 text-slate-400" />
            </h2>

            <div className="space-y-3">
              {exception.timeline.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Stage: {step.stage}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                  </div>
                  <p className="text-slate-600">{step.note}</p>
                  <p className="text-[11px] text-slate-400 pt-0.5">Recorded by: <strong>{step.actor}</strong></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Associated Financial Links
            </h3>

            <div className="space-y-2 text-xs">
              {exception.paymentId && (
                <Link
                  href={`/finance/payments/${exception.paymentId}`}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 block font-semibold text-slate-800 transition-colors"
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Record</span>
                  <span>{exception.paymentId} →</span>
                </Link>
              )}

              <Link
                href={`/finance/customers/${exception.customerId}`}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 block font-semibold text-slate-800 transition-colors"
              >
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Account</span>
                <span>{exception.customerName} →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
