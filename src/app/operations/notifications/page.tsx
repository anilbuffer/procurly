'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Truck,
  FileText,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('All');

  const notifications = [
    {
      id: 'notif_1',
      title: 'Payment Received for AH-P-000120',
      description: 'Nissan Navara Alternator: Account2Account payment NZ$420.00 confirmed by James Taylor.',
      time: '10:18 AM Today',
      category: 'Operational',
      isUnread: true,
      link: '/operations/requests/AH-P-000120',
    },
    {
      id: 'notif_2',
      title: 'Supplier Quote Expiring Alert (7h remaining)',
      description: 'Wholesale quotation from TAS-JP for Hilux Turbocharger (AH-P-000118) expiring at 5:00 PM.',
      time: '09:00 AM Today',
      category: 'Operational',
      isUnread: true,
      isAlert: true,
      link: '/operations/requests/AH-P-000118',
    },
    {
      id: 'notif_3',
      title: 'New Customer Request Submitted',
      description: 'AutoCare Auckland submitted request for Toyota Hiace Left Control Arm (AH-P-000123).',
      time: '08:30 AM Today',
      category: 'Operational',
      isUnread: false,
      link: '/operations/requests/AH-P-000123',
    },
    {
      id: 'notif_4',
      title: 'Payment Gateway Error: AH-P-000108',
      description: 'Card checkout 3D-Secure timeout for Hyundai Santa Fe Booster (NZ$920.00). Follow up required.',
      time: '08:20 AM Today',
      category: 'System',
      isUnread: true,
      isAlert: true,
      link: '/operations/requests/AH-P-000108',
    },
    {
      id: 'notif_5',
      title: 'Logistics Exception Created: LOG-00042',
      description: 'Oversize wooden crate delayed at Kansai airport for Mazda CX-5 Tailgate. Flight rebooking needed.',
      time: '07:30 AM Today',
      category: 'Operational',
      isUnread: false,
      isAlert: true,
      link: '/operations/exceptions/LOG-00042',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Operational Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time procurement alerts, customer activities, and logistics exceptions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100 text-xs">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4 ${
              n.isUnread ? 'bg-blue-50/20' : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`font-black ${n.isAlert ? 'text-[#ed2025]' : 'text-slate-900'}`}>{n.title}</span>
                {n.isUnread && (
                  <span className="text-[9px] font-black uppercase text-[#2B4499] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    New
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-xs">{n.description}</p>
              <span className="text-[10px] text-slate-400 font-medium block">{n.time}</span>
            </div>

            <Link
              href={n.link || (n as any).targetUrl || (n as any).linkUrl || '#'}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white font-bold text-slate-700 transition-colors shrink-0 flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
