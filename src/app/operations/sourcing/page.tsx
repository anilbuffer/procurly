'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Building2,
  Car,
  Filter,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function SourcingWorkspacePage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = () => {
    setRequests(operationsService.getRequests());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const sourcingRequests = requests.filter((r) => {
    const isSourcingRelated =
      r.status === 'Sourcing' ||
      r.status === 'Request Submitted' ||
      r.status === 'Quote Ready' ||
      (r.sourcing && r.sourcing.supplierQuotes.length > 0);

    if (!isSourcingRelated) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.part.name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All' && r.sourcing?.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sourcing & RFQ Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Coordinate part requests across global supplier networks (Japan, Europe, Australia, USA).
          </p>
        </div>

        <Link
          href="/operations/supplier-quotes"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors"
        >
          <FileText className="w-4 h-4 text-[#2B4499]" />
          <span>Supplier Quotes Comparison →</span>
        </Link>
      </div>

      {/* Sourcing Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Active Sourcing RFQs</span>
          <p className="text-2xl font-black text-slate-900">
            {requests.filter((r) => r.status === 'Sourcing' || r.status === 'Request Submitted').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Quotes Received</span>
          <p className="text-2xl font-black text-[#2B4499]">
            {requests.filter((r) => r.sourcing?.status === 'Quotes Received').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Supplier Selected</span>
          <p className="text-2xl font-black text-emerald-600">
            {requests.filter((r) => r.sourcing?.status === 'Supplier Selected').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Avg Sourcing Turnaround</span>
          <p className="text-2xl font-black text-slate-900">0.6 days</p>
        </div>
      </div>

      {/* Sourcing Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parts, vehicles, requests..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sourcing Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="All">All Sourcing States</option>
              <option value="In Progress">In Progress</option>
              <option value="Quotes Received">Quotes Received</option>
              <option value="Supplier Selected">Supplier Selected</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {sourcingRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active sourcing requests matching filter.
            </div>
          ) : (
            sourcingRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/operations/requests/${req.referenceNumber}?tab=supplier-quotes`}
                      className="text-sm font-black text-[#2B4499] hover:underline"
                    >
                      {req.referenceNumber}
                    </Link>
                    <span className="text-xs font-bold text-slate-800">
                      {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2B4499] border border-blue-200">
                      {req.sourcing?.status || 'In Progress'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{req.part.name}</p>
                  <p className="text-[11px] text-slate-500">
                    OEM Part #: <span className="font-mono text-slate-700 font-bold">{req.part.partNumber || '48069-26150'}</span> · Quality: {req.part.qualityPreference} · Quantity: {req.part.quantity}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Customer: <span className="font-medium text-slate-600">{req.customerName}</span> · Assigned Sourcing Lead: <span className="font-medium text-slate-700">{req.ownerName}</span>
                  </p>
                </div>

                {/* Sourcing Summary Pill */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Supplier Quotes</span>
                    <span className="text-sm font-black text-slate-900">
                      {req.sourcing?.supplierQuotes?.length || 0} Options
                    </span>
                  </div>

                  <Link
                    href={`/operations/requests/${req.referenceNumber}?tab=supplier-quotes`}
                    className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                  >
                    <span>Manage Quotes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
