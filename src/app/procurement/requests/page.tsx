'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Plus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, ProcurementRequestStatus } from '@/types/procurement';

function ProcurementRequestsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

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

  const filterStatuses = [
    'All',
    'Submitted',
    'Sourcing',
    'Quote Ready',
    'Customer Approved',
    'Payment Received',
    'Ordered From Supplier',
    'In Transit',
    'Delivered',
    'Exception',
  ];

  const filteredRequests = requests.filter((r) => {
    if (selectedStatus !== 'All') {
      const s = (r.status as string) || '';
      if (selectedStatus === 'Submitted') {
        if (s !== 'New' && s !== 'Request Submitted' && s !== 'Submitted') return false;
      } else if (selectedStatus === 'Sourcing') {
        if (s !== 'Sourcing' && s !== 'Awaiting Supplier') return false;
      } else if (selectedStatus === 'Quote Ready') {
        if (s !== 'Quote Ready' && s !== 'Quoted') return false;
      } else if (selectedStatus === 'Customer Approved') {
        if (s !== 'Customer Approved' && s !== 'Awaiting Customer Approval') return false;
      } else if (selectedStatus === 'Payment Received') {
        if (s !== 'Payment Received' && s !== 'Ready for Procurement') return false;
      } else if (selectedStatus === 'Ordered From Supplier') {
        if (s !== 'Ordered From Supplier' && s !== 'Ordered' && s !== 'PO Issued' && s !== 'Received At Shipping Facility') return false;
      } else if (selectedStatus === 'In Transit') {
        if (s !== 'In Transit' && s !== 'Dispatched' && s !== 'Shipped') return false;
      } else if (selectedStatus === 'Delivered') {
        if (s !== 'Delivered' && s !== 'Completed') return false;
      } else if (selectedStatus === 'Exception') {
        if (s !== 'Exception' && !s.includes('Exception') && s !== 'Payment Failed') return false;
      } else if (s !== selectedStatus) {
        return false;
      }
    }
    if (selectedPriority !== 'All' && r.priority !== selectedPriority) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.requestNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.part.name.toLowerCase().includes(q) ||
        (r.part.partNumber && r.part.partNumber.toLowerCase().includes(q)) ||
        r.vehicle.make.toLowerCase().includes(q) ||
        r.vehicle.model.toLowerCase().includes(q) ||
        r.vehicle.vin.toLowerCase().includes(q) ||
        r.assignedTo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
      case 'Submitted':
      case 'Request Submitted':
        return 'bg-blue-50 text-brand-blue border-blue-200';
      case 'Sourcing':
      case 'Awaiting Supplier':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Quote Ready':
      case 'Quoted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Customer Approved':
      case 'Quote Approved':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Payment Received':
      case 'Ready for Procurement':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Ordered':
      case 'Ordered From Supplier':
      case 'PO Issued':
      case 'Received At Shipping Facility':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'In Transit':
      case 'Dispatched':
        return 'bg-blue-50 text-brand-blue border-blue-200';
      case 'Delivered':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Exception':
        return 'bg-red-50 text-brand-red border-red-200 animate-pulse';
      case 'On Hold':
        return 'bg-slate-100 text-slate-700 border-slate-300';
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
              Central Sourcing & Procurement Queue
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filteredRequests.length} Requests
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end parts requirement intake, supplier quotation, and order lifecycle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/sourcing"
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Search className="w-3.5 h-3.5" />
            Active Sourcing Workspace
          </Link>
        </div>
      </div>

      {/* 2. Filter Pills Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {filterStatuses.map((st) => {
          let count = requests.length;
          if (st === 'Submitted') {
            count = requests.filter((r) => (r.status as string) === 'New' || (r.status as string) === 'Request Submitted' || (r.status as string) === 'Submitted').length;
          } else if (st === 'Sourcing') {
            count = requests.filter((r) => r.status === 'Sourcing' || r.status === 'Awaiting Supplier').length;
          } else if (st === 'Quote Ready') {
            count = requests.filter((r) => r.status === 'Quote Ready').length;
          } else if (st === 'Customer Approved') {
            count = requests.filter((r) => r.status === 'Customer Approved').length;
          } else if (st === 'Payment Received') {
            count = requests.filter((r) => r.status === 'Payment Received' || r.status === 'Ready for Procurement').length;
          } else if (st === 'Ordered From Supplier') {
            count = requests.filter((r) => r.status === 'Ordered' || (r.status as string) === 'Ordered From Supplier').length;
          } else if (st === 'In Transit') {
            count = requests.filter((r) => (r.status as string) === 'In Transit').length;
          } else if (st === 'Delivered') {
            count = requests.filter((r) => r.status === 'Completed' || (r.status as string) === 'Delivered').length;
          } else if (st === 'Exception') {
            count = requests.filter((r) => r.status === 'Exception').length;
          }
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

      {/* 3. Search & Secondary Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request #, VIN, part, customer, assignee..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle & VIN</th>
                <th className="py-3 px-4">Part Requirement</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No procurement requests match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    {/* Request # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                      <Link href={`/procurement/requests/${r.id}`} className="hover:underline">
                        {r.requestNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{r.customerName}</p>
                      <p className="text-[11px] text-slate-500">{r.customerBranch}</p>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">
                        {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        VIN: {r.vehicle.vin}
                      </p>
                    </td>

                    {/* Part */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{r.part.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {r.part.partNumber ? `OEM: ${r.part.partNumber}` : 'Standard fitment'}
                      </p>
                    </td>

                    {/* Qty */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {r.part.quantity}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border',
                          r.priority === 'Urgent'
                            ? 'bg-red-50 text-brand-red border-red-200 animate-pulse'
                            : r.priority === 'High'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        {r.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap',
                          getStatusBadge(r.status)
                        )}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center">
                          {r.assignedTo.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-xs text-slate-700 font-medium">{r.assignedTo}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {r.createdAt.split('T')[0]}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/procurement/requests/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-blue-dark group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ProcurementRequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>}>
      <ProcurementRequestsContent />
    </Suspense>
  );
}
