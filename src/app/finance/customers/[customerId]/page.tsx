'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  Clock,
  History,
  FolderOpen,
  DollarSign,
  Download,
  Send,
  Plus,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { CustomerFinancialProfile, FinancePayment, CreditAccount } from '@/types/finance';
import { AdjustCreditModal } from '@/components/finance/modals/AdjustCreditModal';

export default function CustomerFinancialProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = (params.customerId as string) || '';

  const [customer, setCustomer] = useState<CustomerFinancialProfile | null>(null);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [creditAccount, setCreditAccount] = useState<CreditAccount | null>(null);
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Payments' | 'Invoices' | 'Credit' | 'Orders' | 'Outstanding' | 'Documents' | 'Activity'
  >('Overview');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const loadData = () => {
    const cust = financeService.getCustomerProfileById(customerId);
    if (cust) setCustomer(cust);
    const allPayments = financeService.getPayments().filter((p) => p.customerId === customerId);
    setPayments(allPayments);
    const cr = financeService.getCreditAccountById(customerId);
    if (cr) setCreditAccount(cr);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [customerId]);

  if (!customer) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Customer Profile Not Found</h2>
        <p className="text-xs text-slate-500">The customer identifier &quot;{customerId}&quot; was not found.</p>
        <Link
          href="/finance/customers"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  const tabs: ('Overview' | 'Payments' | 'Invoices' | 'Credit' | 'Orders' | 'Outstanding' | 'Documents' | 'Activity')[] = [
    'Overview',
    'Payments',
    'Invoices',
    'Credit',
    'Orders',
    'Outstanding',
    'Documents',
    'Activity',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/customers"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{customer.name}</h1>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-extrabold',
                  customer.accountStatus === 'Active' && 'bg-emerald-100 text-emerald-800',
                  customer.accountStatus === 'On Hold' && 'bg-amber-100 text-amber-800',
                  customer.accountStatus === 'Under Review' && 'bg-slate-100 text-slate-700'
                )}
              >
                {customer.accountStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NZBN: <strong>{customer.nzbn}</strong> • Legal Entity: <strong>{customer.legalEntity}</strong> • Account Type:{' '}
              <strong>{customer.accountType}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer.creditLimit > 0 && (
            <button
              onClick={() => setAdjustModalOpen(true)}
              className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
            >
              Manage Credit Facility
            </button>
          )}
          <Link
            href={`/finance/customers/${customer.id}/payments`}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Full Payment History</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Credit Limit</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {customer.creditLimit > 0 ? `NZ$${customer.creditLimit.toLocaleString()}` : 'Pre-Payment'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Terms: {customer.creditTerms}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Current Exposure</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            NZ${customer.currentExposure.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
            NZ${customer.availableCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })} available
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
          <p
            className={cn(
              'text-2xl font-black mt-1',
              customer.outstandingBalance > 0 ? 'text-amber-700' : 'text-slate-900'
            )}
          >
            NZ${customer.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {customer.overdueBalance > 0 ? `NZ$${customer.overdueBalance.toFixed(2)} overdue` : 'Zero overdue'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Lifetime Value</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            NZ${customer.lifetimeRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{customer.lifetimeOrdersCount} completed orders</p>
        </div>
      </div>

      {/* 8 Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all',
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Commercial Profile & Credit Behaviour
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Billing Email</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{customer.billingEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Phone</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{customer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Physical Address</span>
                  <span className="text-slate-700 block mt-0.5">{customer.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Payment Behaviour Record</span>
                  <span className="font-bold text-emerald-700 block mt-0.5">{customer.paymentBehaviour}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Finance Advisory Notes</span>
                <p className="text-slate-700 leading-relaxed">{customer.financialNotes}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Last Settlement</h3>
              <p className="font-black text-slate-900 text-lg">NZ${customer.lastPaymentAmount.toFixed(2)}</p>
              <p className="text-slate-500">Date: {customer.lastPaymentDate}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Payments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Customer Payment Transactions</h3>
            <Link
              href={`/finance/customers/${customer.id}/payments`}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Open Dedicated Ledger →
            </Link>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <Link href={`/finance/payments/${p.id}`} className="hover:underline">
                      {p.id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{p.requestNumber}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">NZ${p.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-600">{p.method}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{p.paymentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Credit' && creditAccount && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Trade Credit Facility Specification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block">Credit Limit</span>
              <span className="text-lg font-black text-slate-900">NZ${creditAccount.creditLimit.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block">Credit Utilised</span>
              <span className="text-lg font-black text-indigo-700">NZ${creditAccount.creditUsed.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block">Available Credit</span>
              <span className="text-lg font-black text-emerald-700">NZ${creditAccount.creditAvailable.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href={`/finance/credit-accounts/${creditAccount.customerId}`}
            className="inline-block px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover transition-all active:scale-[0.98]"
          >
            Open Dedicated Credit Profile →
          </Link>
        </div>
      )}

      {activeTab === 'Invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Issued Tax Invoices</h3>
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Tax Invoice INV-2026-0123</p>
              <p className="text-slate-400 text-[10px]">Issued 28 Aug 2026 • NZ$485.00</p>
            </div>
            <button
              onClick={() => alert('Downloading tax invoice PDF...')}
              className="px-3 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              Download
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Outstanding' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Outstanding Receivables</h3>
          <p className="text-slate-600">
            Total Outstanding Balance: <strong>NZ${customer.outstandingBalance.toFixed(2)}</strong>
          </p>
          <Link
            href="/finance/awaiting-payment"
            className="inline-block px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover transition-all active:scale-[0.98]"
          >
            Collections Action Workspace →
          </Link>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Customer Legal & Financial Documents</h3>
          <p className="text-slate-500">Master trade credit agreement, GST tax certificates, and remittances.</p>
          <Link
            href="/finance/documents"
            className="inline-block px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover transition-all active:scale-[0.98]"
          >
            Browse Central Document Repository →
          </Link>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Customer Orders History</h3>
          <p className="text-slate-600">Lifetime orders: <strong>{customer.lifetimeOrdersCount}</strong></p>
          <Link
            href="/finance/approved-orders"
            className="inline-block px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover transition-all active:scale-[0.98]"
          >
            View Approved Orders Clearance →
          </Link>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Customer Account Activity Log</h3>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <p className="font-bold text-slate-900">Card Payment Settled (NZ$485.00)</p>
            <p className="text-slate-400 text-[10px]">28 Aug 2026, 14:22:10 • Automatic clearance</p>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      <AdjustCreditModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        customerId={customer.id}
        customerName={customer.name}
        currentLimit={customer.creditLimit}
      />
    </div>
  );
}
