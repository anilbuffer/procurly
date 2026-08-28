'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  Send,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalException, ExceptionStatus } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function ExceptionDetailWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.id as string) || 'LOG-00042';

  const [exception, setException] = useState<OperationalException | undefined>(undefined);
  const [resolutionInput, setResolutionInput] = useState('');
  const [actionNote, setActionNote] = useState('');

  const loadData = () => {
    const excs = operationsService.getExceptions();
    const clean = code.toLowerCase();
    const matched = excs.find((e) => e.code.toLowerCase() === clean || e.id.toLowerCase() === clean);
    setException(matched);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, [code]);

  if (!exception) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Exception Not Found</h2>
        <p className="text-xs text-slate-500">The exception code &quot;{code}&quot; could not be located.</p>
        <Link
          href="/operations/exceptions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exceptions</span>
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = (newStatus: ExceptionStatus, note?: string) => {
    operationsService.updateExceptionStatus(exception.id, newStatus, note);
    loadData();
  };

  const isResolved = exception.status === 'Resolved' || exception.status === 'Closed';

  const workflowSteps: ExceptionStatus[] = [
    'Detected',
    'Assigned',
    'Investigating',
    'Action Required',
    'Resolved',
    'Closed',
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/operations/exceptions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2B4499] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exception Centre</span>
        </Link>
        <span className="text-xs font-mono font-black text-[#ed2025] bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
          {exception.code}
        </span>
      </div>

      {/* Main Exception Workspace Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {exception.category} Exception
              </span>
              <span className="text-xs font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                {exception.severity} Severity
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{exception.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Related Request:{' '}
              <Link
                href={`/operations/requests/${exception.requestNumber}`}
                className="font-bold text-[#2B4499] hover:underline"
              >
                {exception.requestNumber}
              </Link>{' '}
              · Customer: <strong>{exception.customerName}</strong> · Owner: <strong>{exception.owner}</strong>
            </p>
          </div>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-black self-start',
              isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            )}
          >
            {exception.status}
          </span>
        </div>

        {/* 40. 6-Stage Visual Workflow */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Exception Resolution Workflow</span>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {workflowSteps.map((step, idx) => {
              const currentIdx = workflowSteps.indexOf(exception.status);
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <button
                  key={step}
                  onClick={() => handleUpdateStatus(step, `Advanced to ${step}`)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1',
                    isCurrent
                      ? 'bg-[#ed2025] text-white border-[#ed2025] shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span className="text-[10px] opacity-80">{idx + 1}.</span>
                  <span className="truncate text-[11px]">{step}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description & Impact */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <h3 className="font-black text-slate-900">Incident Description & Root Cause</h3>
          <p className="text-slate-700 leading-relaxed">{exception.description}</p>
        </div>

        {/* Resolution Note Section */}
        {exception.resolutionNote ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-2 font-black text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolution Record</span>
            </div>
            <p className="text-xs leading-relaxed">{exception.resolutionNote}</p>
            <p className="text-[10px] text-emerald-700 pt-1">
              Resolved by: {exception.resolvedBy} on {exception.resolvedAt}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-black text-slate-900">Add Resolution & Close Exception</h3>
            <textarea
              rows={3}
              value={resolutionInput}
              onChange={(e) => setResolutionInput(e.target.value)}
              placeholder="Detail the operational resolution (e.g. carrier rebooking confirmed, alternative flight scheduled, payment authorization switched to credit)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (resolutionInput.trim()) {
                    handleUpdateStatus('Resolved', resolutionInput.trim());
                    setResolutionInput('');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Exception as Resolved</span>
              </button>
            </div>
          </div>
        )}

        {/* Actions History Stream */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Activity & Investigation Log</h3>
          <div className="space-y-2 text-xs">
            {exception.actionsHistory.map((act, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{act.action}</p>
                  {act.notes && <p className="text-slate-600 text-[11px] mt-0.5">{act.notes}</p>}
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Logged by {act.user}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
