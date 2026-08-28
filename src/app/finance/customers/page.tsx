'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Building2,
  Search,
  Filter,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Download,
  Users,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { CustomerFinancialProfile } from '@/types/finance';

export default function FinanceCustomersPage() {
  const [customers, setCustomers] = useState<CustomerFinancialProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadData = () => {
    setCustomers(financeService.getCustomerProfiles());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nzbn.includes(searchQuery) ||
      c.billingEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Credit' && c.creditLimit > 0) ||
      (statusFilter === 'Cash' && c.accountType.includes('Cash')) ||
      (statusFilter === 'Outstanding' && c.outstandingBalance > 0) ||
      (statusFilter === 'On Hold' && c.accountStatus === 'On Hold') ||
      (statusFilter === 'Suspended' && c.creditStatus === 'Suspended') ||
      c.accountStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Commercial Customers Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Finance-focused directory with verified NZBN accounts, trade credit ratings, exposure balances, and payment behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{customers.length} Registered Trade Entities</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Credit', 'Cash', 'Outstanding', 'On Hold', 'Suspended'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              statusFilter === filter
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {filter === 'All' ? 'All Customers' : `${filter} Accounts`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, NZBN, or billing email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Business Name & NZBN</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Credit Status</th>
                <th className="py-3.5 px-4 text-right">Outstanding (NZD)</th>
                <th className="py-3.5 px-4 text-right">Total Revenue</th>
                <th className="py-3.5 px-4">Last Payment</th>
                <th className="py-3.5 px-4">Payment Behaviour</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No customers match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isHealthy = cust.paymentBehaviour.includes('Excellent') || cust.paymentBehaviour.includes('Good');

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/finance/customers/${cust.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 hover:underline block"
                        >
                          {cust.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">NZBN: {cust.nzbn}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                            cust.accountStatus === 'Active' && 'bg-emerald-100 text-emerald-800',
                            cust.accountStatus === 'On Hold' && 'bg-amber-100 text-amber-800',
                            cust.accountStatus === 'Under Review' && 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {cust.accountStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-bold',
                            cust.creditStatus === 'Active' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                            cust.creditStatus === 'Near Limit' && 'bg-amber-50 text-amber-800 border border-amber-200',
                            cust.creditStatus === 'Overdue' && 'bg-red-50 text-red-800 border border-red-200',
                            (cust.creditStatus === 'Suspended' || cust.creditStatus === 'No Credit Facility') &&
                              'bg-slate-100 text-slate-600'
                          )}
                        >
                          {cust.creditStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        NZ${cust.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        NZ${cust.lifetimeRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="block font-medium text-slate-700">{cust.lastPaymentDate}</span>
                        <span className="text-[10px] text-slate-400">NZ${cust.lastPaymentAmount.toFixed(2)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          )}
                        >
                          {isHealthy ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {cust.paymentBehaviour}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/finance/customers/${cust.id}`}
                          className="px-3 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98] inline-block"
                        >
                          Financial Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
