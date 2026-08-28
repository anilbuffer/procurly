'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Bell,
  Check,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  ShoppingCart,
  Truck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementNotificationItem } from '@/types/procurement';

export default function ProcurementNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ProcurementNotificationItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Urgent'>('All');

  const loadData = () => {
    setNotifications(procurementService.getNotifications());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const handleMarkRead = (id: string) => {
    procurementService.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    procurementService.markAllNotificationsAsRead();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Urgent') return n.priority === 'Urgent';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Procurement Notifications & Action Alerts
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-red text-white">
              {unreadCount} Unread
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications for incoming supplier quotations, trade customer approvals, payment settlements, and logistics delays
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('All')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
            filter === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
            filter === 'Unread'
              ? 'bg-brand-red text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          Unread Only ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('Urgent')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
            filter === 'Urgent'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          Urgent ({notifications.filter((n) => n.priority === 'Urgent').length})
        </button>
      </div>

      {/* 3. Notification Stream List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No unread notifications in this view.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={cn(
                'p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors group',
                !n.isRead ? 'bg-amber-50/30' : 'hover:bg-slate-50/70'
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                    !n.isRead
                      ? n.priority === 'Urgent'
                        ? 'bg-brand-red animate-pulse'
                        : 'bg-amber-500'
                      : 'bg-slate-300'
                  )}
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border',
                        n.priority === 'Urgent'
                          ? 'bg-red-50 text-brand-red border-red-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      )}
                    >
                      {n.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{n.timestamp}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <Link
                  href={n.targetUrl}
                  onClick={() => handleMarkRead(n.id)}
                  className="btn-red-polished text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                >
                  View Action <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
