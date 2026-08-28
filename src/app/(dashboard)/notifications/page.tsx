'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { NotificationItem, NotificationType } from '@/types';
import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Truck,
  Package,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await requestsService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('procurly_data_updated', handleUpdate);
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, []);

  const handleMarkAllRead = async () => {
    await requestsService.markAllNotificationsRead();
    loadNotifications();
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'QUOTE_AVAILABLE':
      case 'QUOTE_ACCEPTED':
        return { icon: FileText, color: 'bg-amber-50 text-amber-600' };
      case 'PAYMENT_RECEIVED':
        return { icon: CreditCard, color: 'bg-emerald-50 text-emerald-600' };
      case 'SHIPMENT_DISPATCHED':
      case 'SHIPMENT_ARRIVED':
      case 'DELIVERY_OUT':
        return { icon: Truck, color: 'bg-blue-50 text-brand-blue' };
      case 'DELIVERED':
        return { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' };
      case 'INFORMATION_REQUIRED':
        return { icon: AlertCircle, color: 'bg-red-50 text-red-600' };
      default:
        return { icon: Bell, color: 'bg-slate-100 text-slate-700' };
    }
  };

  const timeGroups = ['Today', 'Yesterday', 'Older'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status alerts for quotes, payments, customs clearance, and deliveries.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs font-bold">
          Mark All As Read
        </Button>
      </div>

      {/* Notifications List Grouped Chronologically */}
      <Card className="shadow-card border border-slate-200">
        <CardContent className="p-6 space-y-6">
          {timeGroups.map((group) => {
            const groupNotifs = notifications.filter((n) => n.timeGroup === group);
            if (groupNotifs.length === 0) return null;

            return (
              <div key={group} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {group}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="space-y-2">
                  {groupNotifs.map((item) => {
                    const { icon: Icon, color } = getIcon(item.type);

                    return (
                      <Link
                        key={item.id}
                        href={item.linkUrl}
                        onClick={() => requestsService.markNotificationRead(item.id)}
                        className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 block group ${
                          !item.isRead
                            ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/80'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                                {item.title}
                              </h4>
                              {!item.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ed2025]" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600">{item.description}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 shrink-0 whitespace-nowrap">
                          {item.timeAgo}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
