'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  Wallet,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceTransaction, TransactionType } from '@/types/finance';

export default function FinanceTransactionsPage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTxn, setSelectedTxn] = useState<FinanceTransaction | null>(null);

  const loadData = () => {
    setTransactions(financeService.getTransactions());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const handleReconcile = (id: string) => {
    financeService.reconcileTransaction(id);
    loadData();
  };

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Payment Transactions Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable commercial ledger recording payments, refunds, adjustments, trade credit draws, and merchant charges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Transaction ID,Reference,Request,Customer,Type,Amount NZD,Method,Status,Channel,Timestamp']
                  .concat(
                    filteredTxns.map(
                      (t) =>
                        `${t.id},${t.reference},${t.requestNumber},"${t.customerName}",${t.type},${t.amount},${t.method},${t.status},${t.channel},${t.timestamp}`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `PROCURly_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* Transaction Type Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Payment', 'Refund', 'Adjustment', 'Credit', 'Charge'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              typeFilter === type
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {type === 'All' ? 'All Types' : type}
          </button>
        ))}
      </div>

      {/* Search & Advanced Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by TXN-ID, Reference, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Reconciled">Reconciled</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Txn ID</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
                <th className="py-3.5 px-4">Method & Channel</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  const isNegative = txn.amount < 0;

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{txn.id}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">{txn.reference}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{txn.customerName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-bold',
                            txn.type === 'Payment' && 'bg-emerald-100 text-emerald-800',
                            txn.type === 'Refund' && 'bg-purple-100 text-purple-800',
                            txn.type === 'Credit' && 'bg-indigo-100 text-indigo-800',
                            txn.type === 'Adjustment' && 'bg-blue-100 text-blue-800'
                          )}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td
                        className={cn(
                          'py-3.5 px-4 text-right font-black',
                          isNegative ? 'text-purple-700' : 'text-slate-900'
                        )}
                      >
                        {isNegative ? '-' : ''}NZ${Math.abs(txn.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="font-semibold block">{txn.method}</span>
                        <span className="text-[10px] text-slate-400">{txn.channel}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            txn.status === 'Reconciled' && 'bg-emerald-100 text-emerald-800',
                            txn.status === 'Completed' && 'bg-blue-100 text-blue-800',
                            txn.status === 'Pending' && 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {txn.status === 'Reconciled' && <CheckCircle2 className="w-3 h-3" />}
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{txn.timestamp}</td>
                      <td className="py-3.5 px-4 text-right">
                        {txn.status !== 'Reconciled' ? (
                          <button
                            onClick={() => handleReconcile(txn.id)}
                            className="px-2.5 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] rounded-lg transition-all shadow-sm active:scale-[0.98]"
                          >
                            Reconcile
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">Locked</span>
                        )}
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
