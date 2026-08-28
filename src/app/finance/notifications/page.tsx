'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Wallet,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceNotification } from '@/types/finance';

export default function FinanceNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const loadData = () => {
    setNotifications(financeService.getNotifications());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
    financeService.markAllNotificationsAsRead();
    loadData();
  };

  const handleClick = (notif: FinanceNotification) => {
    financeService.markNotificationAsRead(notif.id);
    if (notif.targetUrl) router.push(notif.targetUrl);
  };

  const filtered = notifications.filter((n) => (filter === 'Unread' ? !n.isRead : true));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Finance Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of payments, failed charges, overdue reminders, refund requests, and credit limit events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('All')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
            filter === 'All'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          )}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
            filter === 'Unread'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          )}
        >
          Unread Alerts ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No notifications</h3>
            <p className="text-xs text-slate-400">You are all caught up on all finance alerts.</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={cn(
                'p-4 rounded-2xl border transition-all shadow-xs cursor-pointer flex items-start gap-3.5',
                !notif.isRead ? 'bg-emerald-50/20 border-emerald-200 hover:bg-emerald-50/40' : 'bg-white border-slate-200/80 hover:bg-slate-50'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {notif.severity === 'Critical' && (
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {notif.severity === 'Warning' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                )}
                {notif.severity === 'Success' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {notif.severity === 'Info' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#ed2025] shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{notif.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
