'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Clock,
  Search,
  Filter,
  Send,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Download,
  FileText,
  Mail,
  Phone,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { AwaitingPaymentItem } from '@/types/finance';

export default function AwaitingPaymentPage() {
  const [items, setItems] = useState<AwaitingPaymentItem[]>([]);
  const [filterBucket, setFilterBucket] = useState<'All' | 'Current' | '1-7 Days' | '8-30 Days' | '30+ Days'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setItems(financeService.getAwaitingPayments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const handleSendReminder = (id: string, customerName: string) => {
    financeService.sendPaymentReminder(id);
    setToastMessage(`Payment reminder sent to ${customerName}.`);
    setTimeout(() => setToastMessage(null), 3000);
    loadData();
  };

  const filteredItems = items.filter((item) => {
    const matchesBucket = filterBucket === 'All' || item.agingBucket === filterBucket;
    const matchesSearch =
      item.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBucket && matchesSearch;
  });

  const totalDue = filteredItems.reduce((sum, item) => sum + item.amountDue, 0);
  const overdueCount = items.filter((i) => i.status === 'Overdue' || i.daysOutstanding > 0).length;
  const dueTodayCount = items.filter((i) => i.status === 'Due Today').length;
  const currentCount = items.filter((i) => i.agingBucket === 'Current').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-slide-up border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Awaiting Payment & Collections</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated collection workspace for customer orders awaiting financial settlement or remittance advice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              items.forEach((i) => {
                if (i.status === 'Overdue') {
                  financeService.sendPaymentReminder(i.id);
                }
              });
              setToastMessage('Batch reminders dispatched to all overdue accounts.');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-glow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send All Overdue Reminders</span>
          </button>
        </div>
      </div>

      {/* Outstanding Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total Outstanding</span>
          <p className="text-xl font-black text-slate-900 mt-1">NZ$7,250.00</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{items.length} orders total</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs bg-red-50/20">
          <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider block">Overdue Payments</span>
          <p className="text-xl font-black text-red-600 mt-1">{overdueCount} Orders</p>
          <p className="text-[10px] text-red-500 mt-0.5">Requiring phone escalation</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Due Today</span>
          <p className="text-xl font-black text-amber-700 mt-1">{dueTodayCount} Order</p>
          <p className="text-[10px] text-amber-600 mt-0.5">NZ$1,820.00 cutoff 5 PM</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Current / Due Soon</span>
          <p className="text-xl font-black text-emerald-800 mt-1">{currentCount} Orders</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Within 3-day grace window</p>
        </div>
      </div>

      {/* Aging Bucket Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Current', '1-7 Days', '8-30 Days', '30+ Days'] as const).map((bucket) => (
          <button
            key={bucket}
            onClick={() => setFilterBucket(bucket)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
              filterBucket === bucket
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            )}
          >
            {bucket === 'All' ? 'All Aging Queues' : bucket}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Request #, Customer, or Contact Email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Awaiting Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Request #</th>
                <th className="py-3.5 px-4">Customer & Contact</th>
                <th className="py-3.5 px-4 text-right">Quote Value</th>
                <th className="py-3.5 px-4 text-right">Amount Due</th>
                <th className="py-3.5 px-4">Quote Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-center">Days O/S</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No orders awaiting payment in this aging category.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOverdue = item.status === 'Overdue' || item.daysOutstanding > 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.requestNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/finance/customers/${item.customerId}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 hover:underline block"
                        >
                          {item.customerName}
                        </Link>
                        <span className="text-[11px] text-slate-400">{item.contactEmail} • {item.contactPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-semibold">
                        NZ${item.quoteValue.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        NZ${item.amountDue.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.quoteDate}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{item.dueDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full font-bold text-[10px]',
                            item.daysOutstanding === 0
                              ? 'bg-slate-100 text-slate-600'
                              : item.daysOutstanding <= 7
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {item.daysOutstanding}d
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendReminder(item.id, item.customerName)}
                            className="px-2.5 py-1 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-[11px] rounded-lg transition-all shadow-sm flex items-center gap-1 active:scale-[0.98]"
                            title="Send SMS / Email Payment Link"
                          >
                            <Send className="w-3 h-3" />
                            <span>Remind</span>
                          </button>
                          <button
                            onClick={() => alert(`Calling workshop phone: ${item.contactPhone}`)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href="/finance/customer-quotes"
                            className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="View Quote"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Filtered Total: {filteredItems.length} orders</span>
          <span>Amount Awaiting Settlement: <strong className="text-slate-900">NZ${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>
    </div>
  );
}
