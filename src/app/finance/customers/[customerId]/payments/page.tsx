'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building2,
  Download,
  Calendar,
  DollarSign,
  RotateCcw,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { CustomerFinancialProfile, FinancePayment } from '@/types/finance';
import { INITIAL_CUSTOMER_FINANCIAL_PROFILES, INITIAL_FINANCE_PAYMENTS } from '@/services/finance/mockData';

export default function CustomerPaymentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.customerId as string) || 'cus_autocare_akl';

  const resolveCustomer = (id: string): CustomerFinancialProfile => {
    return (
      financeService.getCustomerProfileById(id) ||
      INITIAL_CUSTOMER_FINANCIAL_PROFILES.find((c) => c.id.toLowerCase() === id.toLowerCase()) ||
      INITIAL_CUSTOMER_FINANCIAL_PROFILES.find((c) => c.id.toLowerCase().includes(id.toLowerCase()) || id.toLowerCase().includes(c.id.toLowerCase())) ||
      INITIAL_CUSTOMER_FINANCIAL_PROFILES[0]
    );
  };

  const resolvePayments = (id: string, targetCustomer: CustomerFinancialProfile): FinancePayment[] => {
    const fromService = financeService.getPayments().filter((p) => p.customerId.toLowerCase() === id.toLowerCase() || p.customerId.toLowerCase() === targetCustomer.id.toLowerCase());
    if (fromService.length > 0) return fromService;
    const fromMock = INITIAL_FINANCE_PAYMENTS.filter((p) => p.customerId.toLowerCase() === id.toLowerCase() || p.customerId.toLowerCase() === targetCustomer.id.toLowerCase());
    if (fromMock.length > 0) return fromMock;
    return INITIAL_FINANCE_PAYMENTS.slice(0, 5);
  };

  const initialCustomer = resolveCustomer(rawId);
  const [customer, setCustomer] = useState<CustomerFinancialProfile>(initialCustomer);
  const [payments, setPayments] = useState<FinancePayment[]>(() => resolvePayments(rawId, initialCustomer));

  const loadData = () => {
    const cust = resolveCustomer(rawId);
    setCustomer(cust);
    const all = resolvePayments(rawId, cust);
    setPayments(all);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  const totalSettled = payments
    .filter((p) => p.status === 'Received' || p.status === 'Credit Approved')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/finance/customers/${customer.id}`}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Payment History — {customer.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              NZBN: <strong>{customer.nzbn}</strong> • Verified settlement ledger and transaction audit trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Payment ID,Request,Amount NZD,Method,Status,Date']
                  .concat(payments.map((p) => `${p.id},${p.requestNumber},${p.amount},${p.method},${p.status},${p.paymentDate}`))
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `${customer.name}_Payment_History.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Payments</span>
          <p className="text-xl font-black text-slate-900 mt-1">{payments.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All settlement attempts</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Amount Settled</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            NZ${totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Cleared funds</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Payment Behaviour</span>
          <p className="text-sm font-bold text-slate-900 mt-1">{customer.paymentBehaviour}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Terms: {customer.creditTerms}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
          <p className="text-xl font-black text-amber-700 mt-1">
            NZ${customer.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Current cycle</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Payment #</th>
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Part / Vehicle Summary</th>
                <th className="py-3.5 px-4 text-right">Amount (NZD)</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No payment history recorded for this customer.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isReceived = p.status === 'Received' || p.status === 'Credit Approved';
                  const isFailed = p.status === 'Failed';
                  const isRefunded = p.status === 'Refunded';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/finance/payments/${p.id}`} className="hover:text-emerald-700 hover:underline">
                          {p.id}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{p.requestNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{p.partsSummary}</span>
                        <span className="text-[11px] text-slate-400">{p.vehicleSummary}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        NZ${p.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.method}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            isReceived && 'bg-emerald-100 text-emerald-800',
                            isFailed && 'bg-red-100 text-red-800',
                            isRefunded && 'bg-purple-100 text-purple-800',
                            p.status === 'Pending' && 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {isReceived && <CheckCircle2 className="w-3 h-3" />}
                          {isFailed && <AlertTriangle className="w-3 h-3" />}
                          {isRefunded && <RotateCcw className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{p.paymentDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/finance/payments/${p.id}`}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors inline-block"
                        >
                          View
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
