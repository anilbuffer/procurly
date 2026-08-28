'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  MapPin,
  Plus,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalCustomer } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState<OperationalCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = () => {
    setCustomers(operationsService.getCustomers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.businessName.toLowerCase().includes(q) ||
        c.tradingName.toLowerCase().includes(q) ||
        c.nzbn.includes(q) ||
        c.primaryContact.name.toLowerCase().includes(q) ||
        c.primaryContact.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = customers.filter((c) => c.status === 'Pending Approval').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 41. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Trade Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage approved workshop accounts, trade credit limits, and delivery branches.
          </p>
        </div>

        <Link
          href="/operations/customers/pending"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs transition-colors"
        >
          <UserCheck className="w-4 h-4 text-amber-700" />
          <span>Pending Approvals ({pendingCount})</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Business, Trading Name, NZBN, Contact..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved Trade</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Inactive">Inactive / Declined</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const isPending = cust.status === 'Pending Approval';
          return (
            <div
              key={cust.id}
              className={cn(
                'p-5 rounded-2xl border bg-white shadow-xs hover:border-[#2B4499] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group',
                isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              )}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#2B4499] transition-colors">
                      {cust.businessName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Trading as: {cust.tradingName}</p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase px-2 py-0.5 rounded border shrink-0',
                      cust.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    )}
                  >
                    {cust.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>
                    NZBN: <span className="font-mono font-bold text-slate-800">{cust.nzbn}</span>
                  </p>
                  <p>
                    Primary Contact: <span className="font-medium text-slate-800">{cust.primaryContact.name}</span> ({cust.primaryContact.phone})
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Requests</span>
                    <span className="font-black text-slate-900">{cust.activeRequestsCount}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Orders</span>
                    <span className="font-black text-slate-900">{cust.openOrdersCount}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Outstanding</span>
                    <span className="font-black text-[#2B4499]">NZ${cust.outstandingBalanceNZD}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {cust.branches.length} workshop branch{cust.branches.length > 1 ? 'es' : ''}
                </span>
                <Link
                  href={`/operations/customers/${cust.id}`}
                  className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
                >
                  <span>View Customer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
