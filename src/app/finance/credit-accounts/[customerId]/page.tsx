'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  History,
  FileText,
  DollarSign,
  Lock,
  PauseCircle,
  PlayCircle,
  Percent,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { CreditAccount } from '@/types/finance';
import { AdjustCreditModal } from '@/components/finance/modals/AdjustCreditModal';
import { INITIAL_CREDIT_ACCOUNTS } from '@/services/finance/mockData';

export default function CreditAccountDetailPage() {
  const params = useParams();
  const rawId = (params?.customerId as string) || 'cus_autocare_akl';

  const resolveAccount = (id: string): CreditAccount => {
    return (
      financeService.getCreditAccountById(id) ||
      INITIAL_CREDIT_ACCOUNTS.find((c) => c.customerId.toLowerCase() === id.toLowerCase() || c.id.toLowerCase() === id.toLowerCase()) ||
      INITIAL_CREDIT_ACCOUNTS.find((c) => c.customerName.toLowerCase().includes(id.toLowerCase())) ||
      INITIAL_CREDIT_ACCOUNTS[0]
    );
  };

  const initialAccount = resolveAccount(rawId);
  const [account, setAccount] = useState<CreditAccount>(initialAccount);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const loadData = () => {
    const acc = resolveAccount(rawId);
    setAccount(acc);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  return (
    <div className="space-y-6">
      {/* Header & Sensitive Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/credit-accounts"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{account.customerName}</h1>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1',
                  account.status === 'Active' && 'bg-emerald-100 text-emerald-800',
                  account.status === 'Near Limit' && 'bg-amber-100 text-amber-800',
                  account.status === 'Overdue' && 'bg-red-100 text-red-800',
                  (account.status === 'On Hold' || account.status === 'Suspended') && 'bg-slate-200 text-slate-800'
                )}
              >
                {account.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {account.status === 'Near Limit' && <AlertTriangle className="w-3.5 h-3.5" />}
                {account.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NZBN: <strong>{account.nzbn}</strong> • Terms: <strong>{account.paymentTerms}</strong> • Risk Rating:{' '}
              <strong className="text-slate-900">{account.riskRating}</strong>
            </p>
          </div>
        </div>

        {/* Sensitive Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAdjustModalOpen(true)}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            Adjust Credit Limit / Status
          </button>
        </div>
      </div>

      {/* Exposure Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Credit Limit</span>
          <p className="text-2xl font-black text-slate-900 mt-1">NZ${account.creditLimit.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Approved by {account.approvedBy}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Credit Utilised</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">NZ${account.creditUsed.toLocaleString()}</p>
          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{account.utilizationPct}% utilization</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Available Credit</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">NZ${account.creditAvailable.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Ready for new PO clearance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs bg-red-50/10">
          <span className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider block">Overdue Amount</span>
          <p className="text-2xl font-black text-red-600 mt-1">NZ${account.overdueAmount.toLocaleString()}</p>
          <p className="text-[10px] text-red-500 mt-0.5">
            {account.overdueAmount > 0 ? 'Exceeds 30-day payment terms' : 'Zero overdue balance'}
          </p>
        </div>
      </div>

      {/* Account Info & Credit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ledger & Holds History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Transactions Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Trade Credit Ledger & Balance Draws</h3>
                <p className="text-xs text-slate-500">Historical draws, invoice debits, and monthly settlement credits.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Debit</th>
                    <th className="py-3 px-4 text-right">Credit</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {account.creditTransactions && account.creditTransactions.length > 0 ? (
                    account.creditTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.orderNumber}</td>
                        <td className="py-3 px-4 text-slate-700">{tx.description}</td>
                        <td className="py-3 px-4 text-right text-indigo-700 font-bold">
                          {tx.debit > 0 ? `+NZ$${tx.debit.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                          {tx.credit > 0 ? `-NZ$${tx.credit.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          NZ${tx.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No ledger draw transactions recorded this cycle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Status / Holds History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Credit Action & Risk Event History
            </h3>

            <div className="space-y-2">
              {account.holdsHistory && account.holdsHistory.length > 0 ? (
                account.holdsHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{h.date}</span>
                    </div>
                    <p className="text-slate-600">{h.reason}</p>
                    <p className="text-[10px] text-slate-400">Authorized by {h.performedBy}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No holds or limit adjustments recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Terms */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Customer Trade Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Contact Person</span>
                <span className="font-bold text-slate-900 block mt-0.5">{account.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Billing Email & Phone</span>
                <span className="font-semibold text-slate-900 block mt-0.5">{account.contactEmail}</span>
                <span className="text-slate-500 block">{account.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Registered Billing Address</span>
                <span className="text-slate-700 block mt-0.5">{account.billingAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Annual Credit Review Due</span>
                <span className="font-semibold text-indigo-700 block mt-0.5">{account.reviewDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href={`/finance/customers/${account.customerId}`}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Full Financial Profile →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      <AdjustCreditModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        customerId={account.customerId}
        customerName={account.customerName}
        currentLimit={account.creditLimit}
      />
    </div>
  );
}
