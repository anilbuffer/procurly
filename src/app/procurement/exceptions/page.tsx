'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Search,
  Plus,
  CheckCircle,
  Clock,
  UserCheck,
  Building2,
  Car,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  ProcurementExceptionItem,
  ExceptionType,
  ExceptionStage,
  ExceptionSeverity,
} from '@/types/procurement';
import { ReportExceptionModal } from '@/components/procurement/modals/ReportExceptionModal';

export default function LogisticsExceptionsPage() {
  const [exceptions, setExceptions] = useState<ProcurementExceptionItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Resolution workflow state
  const [selectedException, setSelectedException] = useState<ProcurementExceptionItem | null>(null);
  const [actionNote, setActionNote] = useState('');

  const loadData = () => {
    const list = procurementService.getExceptions();
    setExceptions(list);
    if (list.length > 0 && !selectedException) {
      setSelectedException(list[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const stages: ExceptionStage[] = [
    'Review',
    'Assign',
    'Investigate',
    'Supplier Communication',
    'Resolution',
    'Close',
  ];

  const types: Array<ExceptionType | 'All'> = [
    'All',
    'Supplier Delay',
    'Supplier Cancellation',
    'Part Unavailable',
    'Wrong Part',
    'Damaged Part',
    'Quantity Mismatch',
    'Shipping Delay',
    'Documentation Issue',
    'Customs Issue',
  ];

  const filtered = exceptions.filter((e) => {
    if (selectedType !== 'All' && e.type !== selectedType) return false;
    if (selectedStage !== 'All' && e.stage !== selectedStage) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.code.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.requestRef.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdvanceStage = (nextStage: ExceptionStage) => {
    if (!selectedException) return;
    procurementService.updateExceptionStage(
      selectedException.id,
      nextStage,
      actionNote || `Advanced stage to ${nextStage}`
    );
    setActionNote('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Logistics & Sourcing Exceptions Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-brand-red border border-red-200">
              {exceptions.filter((e) => e.stage !== 'Close').length} Active Issues
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard 6-stage exception resolution pipeline (Review → Assign → Investigate → Supplier Comm → Resolution → Close)
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="bg-brand-red hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log New Exception
        </button>
      </div>

      {/* 2. Exceptions Types Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {types.map((t) => {
          const count = t === 'All' ? exceptions.length : exceptions.filter((e) => e.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedType === t
                  ? 'bg-[#ed2025] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>{t}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  selectedType === t ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Split View: Exception List vs Resolution Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exception Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, supplier..."
              className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((exc) => {
              const isSelected = selectedException?.id === exc.id;
              return (
                <div
                  key={exc.id}
                  onClick={() => setSelectedException(exc)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer space-y-2',
                    isSelected
                      ? 'bg-white border-brand-red ring-2 ring-brand-red/20 shadow-md'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {exc.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Stage: {exc.stage}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{exc.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    {exc.supplierName} • {exc.requestRef}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Severity: <strong className="text-brand-red">{exc.severity}</strong></span>
                    <span>Assigned: <strong className="text-slate-700">{exc.assignedTo}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 6-Stage Resolution Workspace (7 cols) */}
        <div className="lg:col-span-7">
          {selectedException ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {selectedException.code}
                    </span>
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-brand-red">
                      {selectedException.type}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {selectedException.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-800">{selectedException.customerName}</strong> • Supplier: {selectedException.supplierName}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Logged On</span>
                  <span className="font-semibold text-slate-800">{selectedException.createdAt.split('T')[0]}</span>
                </div>
              </div>

              {/* 6-Stage Stepper */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  6-Stage Resolution Lifecycle:
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  {stages.map((st, i) => {
                    const currentIdx = stages.indexOf(selectedException.stage);
                    const isPassed = i < currentIdx;
                    const isCurrent = i === currentIdx;

                    return (
                      <div
                        key={st}
                        className={cn(
                          'p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1',
                          isCurrent
                            ? 'bg-red-50 border-brand-red text-brand-red font-bold ring-1 ring-brand-red'
                            : isPassed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        )}
                      >
                        <span className="text-[10px] font-extrabold uppercase">
                          {isPassed ? '✓' : `0${i + 1}`}
                        </span>
                        <span className="text-[10px] leading-tight line-clamp-2">{st}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Issue Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Incident Investigation Details:</span>
                <p className="text-slate-700 leading-relaxed">{selectedException.description}</p>
              </div>

              {/* Action History Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Resolution Action History:
                </h4>
                <div className="space-y-2">
                  {selectedException.actions.map((act, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">{act.user} ({act.stage})</span>
                        <span>{act.timestamp.slice(0, 16).replace('T', ' ')}</span>
                      </div>
                      <p className="text-slate-800">{act.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advance Action Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Advance Resolution Stage:
                </span>
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Record supplier negotiation note or corrective action..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />

                <div className="flex flex-wrap items-center gap-2">
                  {selectedException.stage === 'Review' && (
                    <button
                      onClick={() => handleAdvanceStage('Assign')}
                      className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      Assign Specialist →
                    </button>
                  )}
                  {selectedException.stage === 'Assign' && (
                    <button
                      onClick={() => handleAdvanceStage('Investigate')}
                      className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      Begin Investigation →
                    </button>
                  )}
                  {selectedException.stage === 'Investigate' && (
                    <button
                      onClick={() => handleAdvanceStage('Supplier Communication')}
                      className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      Escalate to Supplier →
                    </button>
                  )}
                  {selectedException.stage === 'Supplier Communication' && (
                    <button
                      onClick={() => handleAdvanceStage('Resolution')}
                      className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      Propose Resolution →
                    </button>
                  )}
                  {selectedException.stage === 'Resolution' && (
                    <button
                      onClick={() => handleAdvanceStage('Close')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      ✓ Close Exception Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select an exception to review.
            </div>
          )}
        </div>
      </div>

      <ReportExceptionModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
