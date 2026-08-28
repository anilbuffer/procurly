'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowRight,
  ShieldCheck,
  Plus,
  Users,
  Percent,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { CreditAccount, CreditAccountStatus } from '@/types/finance';
import { AdjustCreditModal } from '@/components/finance/modals/AdjustCreditModal';

export default function CreditAccountsPage() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; limit: number } | null>(null);

  const loadData = () => {
    setAccounts(financeService.getCreditAccounts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nzbn.includes(searchQuery) ||
      a.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCreditLimit = accounts.reduce((sum, a) => sum + a.creditLimit, 0);
  const totalCreditUsed = accounts.reduce((sum, a) => sum + a.creditUsed, 0);
  const totalAvailable = accounts.reduce((sum, a) => sum + a.creditAvailable, 0);
  const activeCount = accounts.filter((a) => a.status === 'Active').length;
  const nearLimitCount = accounts.filter((a) => a.status === 'Near Limit').length;
  const overdueCount = accounts.filter((a) => a.status === 'Overdue').length;
  const onHoldCount = accounts.filter((a) => a.status === 'On Hold' || a.status === 'Suspended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Trade Credit Facilities</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial trade credit limits, utilization exposure, account status controls, and payment terms management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCustomer({ id: 'cus_new', name: 'New Trade Applicant', limit: 10000 });
              setAdjustModalOpen(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Approve Credit Account</span>
          </button>
        </div>
      </div>

      {/* Credit KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Active Credit Customers</span>
          <p className="text-xl font-black text-slate-900 mt-1">{activeCount + nearLimitCount}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Approved commercial workshops</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Credit Available</span>
          <p className="text-xl font-black text-emerald-700 mt-1">NZ${totalAvailable.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Remaining unallocated limit</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Credit Utilised</span>
          <p className="text-xl font-black text-indigo-900 mt-1">NZ${totalCreditUsed.toLocaleString()}</p>
          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
            {Math.round((totalCreditUsed / totalCreditLimit) * 100)}% overall exposure
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs bg-red-50/20">
          <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">Credit Overdue</span>
          <p className="text-xl font-black text-red-600 mt-1">{overdueCount} Account</p>
          <p className="text-[10px] text-red-500 mt-0.5">NZ$4,350.00 past terms</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Accounts on Hold</span>
          <p className="text-xl font-black text-amber-700 mt-1">{onHoldCount} Accounts</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Auto-ordering restricted</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Active', 'Near Limit', 'Overdue', 'On Hold', 'Suspended'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              statusFilter === status
                ? 'bg-[#ed2025] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {status === 'All' ? 'All Credit Accounts' : status}
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
            placeholder="Search by customer name, NZBN, or contact..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Table (Matching specification table) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer & NZBN</th>
                <th className="py-3.5 px-4 text-right">Credit Limit</th>
                <th className="py-3.5 px-4 text-right">Used</th>
                <th className="py-3.5 px-4 text-right">Available</th>
                <th className="py-3.5 px-4">Utilization</th>
                <th className="py-3.5 px-4">Payment Terms</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No credit accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const isNear = account.status === 'Near Limit';
                  const isOver = account.status === 'Overdue';
                  const isHold = account.status === 'On Hold' || account.status === 'Suspended';

                  return (
                    <tr key={account.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/finance/credit-accounts/${account.customerId}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 hover:underline block"
                        >
                          {account.customerName}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">NZBN: {account.nzbn}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        NZ${account.creditLimit.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-700">
                        NZ${account.creditUsed.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        NZ${account.creditAvailable.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{account.utilizationPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                account.utilizationPct >= 90
                                  ? 'bg-red-500'
                                  : account.utilizationPct >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              )}
                              style={{ width: `${Math.min(100, account.utilizationPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{account.paymentTerms}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            account.status === 'Active' && 'bg-emerald-100 text-emerald-800',
                            isNear && 'bg-amber-100 text-amber-800',
                            isOver && 'bg-red-100 text-red-800',
                            isHold && 'bg-slate-200 text-slate-800'
                          )}
                        >
                          {account.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                          {isNear && <AlertTriangle className="w-3 h-3" />}
                          {account.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/finance/credit-accounts/${account.customerId}`}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors inline-block"
                          >
                            Detail
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedCustomer({
                                id: account.customerId,
                                name: account.customerName,
                                limit: account.creditLimit,
                              });
                              setAdjustModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition-colors"
                          >
                            Adjust
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
      </div>

      {/* Adjust Modal */}
      {selectedCustomer && (
        <AdjustCreditModal
          isOpen={adjustModalOpen}
          onClose={() => {
            setAdjustModalOpen(false);
            setSelectedCustomer(null);
          }}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          currentLimit={selectedCustomer.limit}
        />
      )}
    </div>
  );
}
