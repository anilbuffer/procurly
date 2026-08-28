'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  Search,
  Filter,
  PlusCircle,
  ArrowUpDown,
  ChevronDown,
  User,
  CheckSquare,
  Square,
  RefreshCw,
  Download,
  AlertTriangle,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import {
  OperationalPartRequest,
  OperationalRequestStatus,
  RequestPriority,
  OperationsStaffUser,
} from '@/types/operations';
import { StatusChangeModal } from '@/components/operations/layout/StatusChangeModal';
import { QuickCreateModal } from '@/components/operations/layout/QuickCreateModal';
import { cn } from '@/lib/utils';

function OperationsRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get('status') || 'All';

  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [staffUsers, setStaffUsers] = useState<OperationsStaffUser[]>(operationsService.getStaffUsers());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [selectedOwner, setSelectedOwner] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedMake, setSelectedMake] = useState<string>('All');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Status Change Modal for individual item
  const [statusModalTarget, setStatusModalTarget] = useState<OperationalPartRequest | null>(null);

  const loadData = () => {
    setRequests(operationsService.getRequests());
    setCurrentUser(operationsService.getCurrentUser());
    setStaffUsers(operationsService.getStaffUsers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  // Sync with searchParams if provided
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

  // Filtering Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          r.referenceNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.vehicle.make.toLowerCase().includes(q) ||
          r.vehicle.model.toLowerCase().includes(q) ||
          r.vehicle.vin.toLowerCase().includes(q) ||
          r.part.name.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Status Filter
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Submitted' && r.status !== 'Request Submitted') return false;
        else if (selectedStatus === 'Exceptions' && !r.status.includes('Exception') && r.status !== 'Payment Failed') return false;
        else if (selectedStatus !== 'Submitted' && selectedStatus !== 'Exceptions' && r.status !== selectedStatus) return false;
      }

      // Owner Filter
      if (selectedOwner !== 'All' && r.ownerName !== selectedOwner) {
        return false;
      }

      // Priority Filter
      if (selectedPriority !== 'All' && r.priority !== selectedPriority) {
        return false;
      }

      // Vehicle Make Filter
      if (selectedMake !== 'All' && r.vehicle.make !== selectedMake) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, selectedStatus, selectedOwner, selectedPriority, selectedMake]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAssign = (staffName: string) => {
    const staff = staffUsers.find((u) => u.name === staffName);
    if (!staff) return;
    selectedIds.forEach((id) => {
      operationsService.assignRequestOwner(id, staff.id);
    });
    setSelectedIds([]);
  };

  const handleBulkPriority = (priority: RequestPriority) => {
    selectedIds.forEach((id) => {
      operationsService.updateRequestPriority(id, priority);
    });
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const header = 'Request,Customer,Vehicle,Part,Status,Owner,Priority,Value,Updated\n';
    const rows = filteredRequests
      .map(
        (r) =>
          `"${r.referenceNumber}","${r.customerName}","${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}","${r.part.name}","${r.status}","${r.ownerName}","${r.priority}","NZ$${r.customerQuote?.totalAmountNZD || r.landedCost?.finalCustomerPriceNZD || 0}","${r.updatedAt}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Procurly_Operations_Requests_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTabList = [
    { label: 'All Requests', value: 'All', count: requests.length },
    { label: 'Submitted', value: 'Submitted', count: requests.filter((r) => r.status === 'Request Submitted').length },
    { label: 'Sourcing', value: 'Sourcing', count: requests.filter((r) => r.status === 'Sourcing').length },
    { label: 'Quote Ready', value: 'Quote Ready', count: requests.filter((r) => r.status === 'Quote Ready').length },
    { label: 'Awaiting Approval', value: 'Awaiting Customer Approval', count: requests.filter((r) => r.status === 'Awaiting Customer Approval').length },
    { label: 'Awaiting Payment', value: 'Awaiting Payment', count: requests.filter((r) => r.status === 'Awaiting Payment').length },
    { label: 'In Transit', value: 'In Transit', count: requests.filter((r) => r.status === 'In Transit').length },
    { label: 'Exceptions', value: 'Exceptions', count: requests.filter((r) => r.status.includes('Exception') || r.status === 'Payment Failed').length, isRed: true },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 18. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Procurement Requests
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage every customer request from submission through completion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-glow transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* 19. Status Tabs & Request Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {statusTabList.map((tab) => {
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                  isActive
                    ? tab.isRed
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'bg-[#ed2025] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                    isActive ? 'bg-white/20 text-white' : tab.isRed ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Request #, Customer, Vehicle, Part, VIN..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
            />
          </div>

          {/* Owner Filter */}
          <div>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
            >
              <option value="All">Owner: All Staff</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
            >
              <option value="All">Priority: All</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* More Filters Toggle */}
          <div>
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={cn(
                'w-full flex items-center justify-between py-2 px-3 text-xs font-bold rounded-xl border transition-colors',
                showMoreFilters || selectedMake !== 'All'
                  ? 'bg-red-50 text-[#ed2025] border-red-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              )}
            >
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>More Filters</span>
              </div>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showMoreFilters ? 'rotate-180' : '')} />
            </button>
          </div>
        </div>

        {/* Extended Filter Options */}
        {showMoreFilters && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-slide-up text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vehicle Make</label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="All">All Makes</option>
                <option value="Toyota">Toyota</option>
                <option value="Mazda">Mazda</option>
                <option value="Ford">Ford</option>
                <option value="Nissan">Nissan</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Subaru">Subaru</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Volkswagen">Volkswagen</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Clear Filters</label>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('All');
                  setSelectedOwner('All');
                  setSelectedPriority('All');
                  setSelectedMake('All');
                }}
                className="w-full p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* 58. Bulk Action Bar (When rows selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-red-50/90 border border-red-200 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2B4499]" />
              <span className="text-xs font-bold text-[#2B4499]">
                {selectedIds.length} request{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-medium">Bulk Actions:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkAssign(e.target.value);
                }}
                defaultValue=""
                className="py-1 px-2.5 bg-white border border-red-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="" disabled>
                  Assign Staff...
                </option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkPriority(e.target.value as RequestPriority);
                }}
                defaultValue=""
                className="py-1 px-2.5 bg-white border border-red-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="" disabled>
                  Set Priority...
                </option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              <button
                onClick={() => setSelectedIds([])}
                className="py-1 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 20. Requests Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="flex items-center">
                    {selectedIds.length > 0 && selectedIds.length === filteredRequests.length ? (
                      <CheckSquare className="w-4 h-4 text-[#2B4499]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Part</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3 text-right">Value</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedIds.includes(req.id);
                  const isUrgent = req.priority === 'Urgent';
                  const isHigh = req.priority === 'High';
                  const hasException = req.status.includes('Exception') || req.status === 'Payment Failed';

                  return (
                    <tr
                      key={req.id}
                      className={cn(
                        'hover:bg-slate-50/80 transition-colors group',
                        isSelected ? 'bg-blue-50/40' : '',
                        hasException ? 'bg-red-50/20' : ''
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelectOne(req.id)} className="flex items-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2B4499]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Request ID + Priority */}
                      <td className="py-3 px-3">
                        <Link
                          href={`/operations/requests/${req.referenceNumber}`}
                          className="font-black text-[#2B4499] hover:underline flex items-center gap-1.5"
                        >
                          <span>{req.referenceNumber}</span>
                          {isUrgent && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Urgent Priority" />
                          )}
                          {isHigh && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="High Priority" />
                          )}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-[150px] truncate">
                        {req.customerName}
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {req.vehicle.make} {req.vehicle.model} <span className="text-slate-400">({req.vehicle.year})</span>
                      </td>

                      {/* Part */}
                      <td className="py-3 px-3 font-medium text-slate-700 max-w-[180px] truncate" title={req.part.name}>
                        {req.part.name}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border',
                            hasException
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : req.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : req.status === 'In Transit'
                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                  : req.status === 'Awaiting Customer Approval'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : req.status === 'Payment Received'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {req.ownerName.split(' ')[0]}
                      </td>

                      {/* Value */}
                      <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                        {req.customerQuote?.totalAmountNZD || req.landedCost?.finalCustomerPriceNZD ? (
                          `$${(req.customerQuote?.totalAmountNZD || req.landedCost?.finalCustomerPriceNZD || 0).toFixed(0)}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {req.updatedAt.split(' ')[1] || req.updatedAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/operations/requests/${req.referenceNumber}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#ed2025] hover:text-white text-[11px] font-bold text-slate-700 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setStatusModalTarget(req)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Change Status"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Responsive Cards */}
        <div className="lg:hidden p-3 divide-y divide-slate-100">
          {filteredRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No requests match filters.</div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/operations/requests/${req.referenceNumber}`}
                    className="text-xs font-black text-[#2B4499] hover:underline"
                  >
                    {req.referenceNumber}
                  </Link>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      req.status.includes('Exception')
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    )}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="text-xs text-slate-900 font-bold">{req.customerName}</div>
                <p className="text-xs text-slate-600">
                  {req.vehicle.year} {req.vehicle.make} {req.vehicle.model} · {req.part.name}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Owner: {req.ownerName}</span>
                  <Link
                    href={`/operations/requests/${req.referenceNumber}`}
                    className="font-bold text-[#2B4499] flex items-center gap-0.5"
                  >
                    <span>Open Workspace</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Individual Status Change Modal */}
      {statusModalTarget && (
        <StatusChangeModal
          isOpen={true}
          onClose={() => setStatusModalTarget(null)}
          requestId={statusModalTarget.referenceNumber}
          currentStatus={statusModalTarget.status}
        />
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} />
    </div>
  );
}

export default function OperationsRequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>}>
      <OperationsRequestsContent />
    </Suspense>
  );
}
