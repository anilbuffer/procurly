'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  Receipt,
  FileText,
  Clock,
  Zap,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { ApprovedOrderFinance } from '@/types/finance';
import { FinancialClearanceModal } from '@/components/finance/modals/FinancialClearanceModal';
import { INITIAL_APPROVED_ORDERS_FINANCE } from '@/services/finance/mockData';

export default function ApprovedOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'ORD-2026-0089';

  const resolveOrder = (id: string): ApprovedOrderFinance => {
    const orders = financeService.getApprovedOrders();
    return (
      orders.find((item) => item.id.toLowerCase() === id.toLowerCase() || item.orderNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_APPROVED_ORDERS_FINANCE.find((item) => item.id.toLowerCase() === id.toLowerCase() || item.orderNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_APPROVED_ORDERS_FINANCE[0]
    );
  };

  const initialOrder = resolveOrder(rawId);
  const [order, setOrder] = useState<ApprovedOrderFinance>(initialOrder);
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);

  const loadData = () => {
    const o = resolveOrder(rawId);
    setOrder(o);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, [rawId]);

  const isCleared = order.clearanceStatus === 'Financially Cleared';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/approved-orders"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900 tracking-tight">{order.orderNumber}</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1',
                  isCleared && 'bg-emerald-100 text-emerald-800',
                  !isCleared && 'bg-amber-100 text-amber-800'
                )}
              >
                {isCleared && <CheckCircle2 className="w-3.5 h-3.5" />}
                {order.clearanceStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer Approved on {order.approvedDate} • Total: <strong>NZ${order.totalAmount.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCleared ? (
            <button
              onClick={() => setClearanceModalOpen(true)}
              className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover flex items-center gap-1.5 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Grant Financial Clearance & Release</span>
            </button>
          ) : (
            <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
              ✓ Released to Procurement (Ref: {order.procurementPoRef})
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Financial Spec */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Financial Clearance Specification
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Order Value</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  NZ${order.totalAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">GST 15% incl.</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Customer</span>
                <Link
                  href={`/finance/customers/${order.customerId}`}
                  className="font-bold text-slate-900 hover:text-emerald-700 hover:underline block mt-0.5"
                >
                  {order.customerName}
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">Req: {order.requestNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Payment Method</span>
                <span className="font-bold text-slate-900 block mt-0.5">{order.paymentMethod}</span>
                <span className="text-[10px] text-slate-400">{order.paymentStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Credit Verification</span>
                <span className="font-bold text-emerald-700 block mt-0.5">
                  {order.creditVerified ? 'Verified & Approved' : 'Pending Verification'}
                </span>
              </div>
            </div>

            {/* Parts Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Part Description</th>
                    <th className="py-2.5 px-3">OEM Part Number</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.parts.map((part, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{part.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{part.partNumber}</td>
                      <td className="py-2.5 px-3 text-center">{part.qty}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">NZ${part.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        NZ${(part.unitPrice * part.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {order.notes && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Clearance Notes</span>
                <p className="text-slate-700 font-medium">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl space-y-3 text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Procurement Handover Status
            </span>
            {isCleared ? (
              <div className="space-y-2">
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-700/60 text-emerald-300">
                  <p className="font-bold">✓ Financially Cleared</p>
                  <p className="text-[11px] text-emerald-400/80 mt-0.5">
                    Order released to procurement specialists on {order.releasedToProcurementAt?.split('T')[0]}.
                  </p>
                </div>
                <p className="text-slate-400">Procurement PO: <strong>{order.procurementPoRef}</strong></p>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-700/60 text-amber-300">
                <p className="font-bold">Awaiting Financial Clearance</p>
                <p className="text-[11px] text-amber-400/80 mt-0.5">
                  Procurement purchase order creation is locked until clearance is granted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clearance Modal */}
      <FinancialClearanceModal
        isOpen={clearanceModalOpen}
        onClose={() => setClearanceModalOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
        customerName={order.customerName}
        amount={order.totalAmount}
      />
    </div>
  );
}
