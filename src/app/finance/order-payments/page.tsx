'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { ApprovedOrderFinance } from '@/types/finance';
import { FinancialClearanceModal } from '@/components/finance/modals/FinancialClearanceModal';

export default function OrderPaymentsPage() {
  const [orders, setOrders] = useState<ApprovedOrderFinance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApprovedOrderFinance | null>(null);

  const loadData = () => {
    setOrders(financeService.getApprovedOrders());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Order Payments & Procurement Handover</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connecting: <strong>Customer Approval → Finance Clearance → Procurement Handover</strong>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Request #, Customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const isCleared = order.clearanceStatus === 'Financially Cleared';

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-slate-900">{order.orderNumber}</span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1',
                      isCleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {isCleared && <CheckCircle2 className="w-3 h-3" />}
                    {!isCleared && <Clock className="w-3 h-3" />}
                    {order.clearanceStatus}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{order.customerName}</h3>
                  <p className="text-xs text-slate-400 font-mono">Linked Request: {order.requestNumber}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Order</span>
                    <span className="font-black text-slate-900">NZ${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                    <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
                  </div>
                </div>

                {order.procurementPoRef && (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Procurement PO Issued: <strong>{order.procurementPoRef}</strong>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link
                  href={`/finance/approved-orders/${order.id}`}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 hover:underline"
                >
                  View Full Detail →
                </Link>

                {!isCleared && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setClearanceModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
                  >
                    Release to Procurement
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clearance Modal */}
      {selectedOrder && (
        <FinancialClearanceModal
          isOpen={clearanceModalOpen}
          onClose={() => {
            setClearanceModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.orderNumber}
          customerName={selectedOrder.customerName}
          amount={selectedOrder.totalAmount}
        />
      )}
    </div>
  );
}
