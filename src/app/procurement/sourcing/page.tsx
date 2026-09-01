'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Search,
  ArrowRight,
  Plus,
  Building2,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Zap,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, SourcingStatus } from '@/types/procurement';

export default function SourcingQueuePage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setRequests(procurementService.getRequests());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    window.addEventListener('procurly_ops_updated', handleUpdate);
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    window.addEventListener('procurly_finance_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
      window.removeEventListener('procurly_ops_updated', handleUpdate);
      window.removeEventListener('procurly_procurement_updated', handleUpdate);
      window.removeEventListener('procurly_finance_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const sourcingStatuses: Array<SourcingStatus | 'All'> = [
    'All',
    'Not Started',
    'Sourcing',
    'Supplier Contacted',
    'Awaiting Response',
    'Quote Received',
    'No Availability',
    'Sourcing Complete',
  ];

  const filtered = requests.filter((r) => {
    if (selectedStatus !== 'All' && r.sourcingStatus !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.requestNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.part.name.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.model.toLowerCase().includes(q) ||
        r.vehicle.vin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusStyle = (st: SourcingStatus) => {
    switch (st) {
      case 'Not Started':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Sourcing':
      case 'Supplier Contacted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Awaiting Response':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Quote Received':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Sourcing Complete':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'No Availability':
        return 'bg-red-50 text-brand-red border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Active Sourcing Workspace
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filtered.length} Parts in Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Actively source requested parts across OEM factory catalogues, trade distributors, and overseas salvage networks
          </p>
        </div>
      </div>

      {/* 2. Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {sourcingStatuses.map((st) => {
          const count = st === 'All' ? requests.length : requests.filter((r) => r.sourcingStatus === st).length;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedStatus === st
                  ? 'bg-[#ed2025] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>{st}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  selectedStatus === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by part name, OEM part #, vehicle, customer..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Sourcing Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Top header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {req.requestNumber}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                    getStatusStyle(req.sourcingStatus)
                  )}
                >
                  {req.sourcingStatus}
                </span>
              </div>

              {/* Part Name & Vehicle */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1">
                  {req.part.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  VIN: {req.vehicle.vin}
                </p>
              </div>

              {/* Requirement Specs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-bold text-slate-900">{req.part.quantity} Unit(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quality Preference:</span>
                  <span className="font-semibold text-emerald-700">{req.part.qualityPreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quotes Received:</span>
                  <span className="font-bold text-brand-blue">{req.quotesCount} Quote(s)</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Assigned: <strong className="text-slate-700">{req.assignedTo}</strong>
              </span>
              <Link
                href={`/procurement/sourcing/${req.id}`}
                className="btn-red-polished text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
              >
                Source Part <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
