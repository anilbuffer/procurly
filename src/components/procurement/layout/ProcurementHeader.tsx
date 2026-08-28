'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Bell,
  Check,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Menu,
  FileText,
  ShoppingCart,
  AlertTriangle,
  GitCompare,
  Zap,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementStaffUser, ProcurementNotificationItem } from '@/types/procurement';

export interface ProcurementHeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenGlobalSearch?: () => void;
  onOpenQuickAction?: (actionType: 'quote' | 'po' | 'exception' | 'rfq') => void;
}

export function ProcurementHeader({
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenQuickAction,
}: ProcurementHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<ProcurementStaffUser>(procurementService.getCurrentUser());
  const [notifications, setNotifications] = useState<ProcurementNotificationItem[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setCurrentUser(procurementService.getCurrentUser());
    setNotifications(procurementService.getNotifications());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    procurementService.markAllNotificationsAsRead();
  };

  const handleNotificationClick = (notif: ProcurementNotificationItem) => {
    procurementService.markNotificationAsRead(notif.id);
    setNotifDropdownOpen(false);
    if (notif.targetUrl) {
      router.push(notif.targetUrl);
    }
  };

  // Generate clean page title based on current route
  const getPageContextTitle = () => {
    if (pathname.includes('/procurement/dashboard')) return 'Procurement Dashboard';
    if (pathname.includes('/procurement/tasks')) return 'My Procurement Tasks';
    if (pathname.includes('/procurement/requests/')) return 'Procurement Request Workspace';
    if (pathname.includes('/procurement/requests')) return 'Procurement Requests';
    if (pathname.includes('/procurement/sourcing/')) return 'Sourcing Workspace & RFQ';
    if (pathname.includes('/procurement/sourcing')) return 'Active Sourcing Queue';
    if (pathname.includes('/procurement/supplier-quotes/')) return 'Supplier Quote Specification';
    if (pathname.includes('/procurement/supplier-quotes')) return 'Supplier Quotes Management';
    if (pathname.includes('/procurement/quote-comparison')) return 'Multi-Supplier Quote Comparison';
    if (pathname.includes('/procurement/purchase-orders/')) return 'Purchase Order Detail';
    if (pathname.includes('/procurement/purchase-orders')) return 'Purchase Orders Management';
    if (pathname.includes('/procurement/tracking')) return 'Procurement Tracking & Pipeline';
    if (pathname.includes('/procurement/suppliers/performance')) return 'Supplier Performance Intelligence';
    if (pathname.includes('/procurement/suppliers/')) return 'Supplier Profile & Sourcing History';
    if (pathname.includes('/procurement/suppliers')) return 'Supplier Directory & Management';
    if (pathname.includes('/procurement/supplier-communications')) return 'Supplier Communications Hub';
    if (pathname.includes('/procurement/ready-for-dispatch')) return 'Ready for Dispatch Verification';
    if (pathname.includes('/procurement/shipping')) return 'Shipping & Logistics Handover';
    if (pathname.includes('/procurement/in-transit')) return 'In-Transit Freight Monitor';
    if (pathname.includes('/procurement/exceptions')) return 'Logistics & Sourcing Exceptions';
    if (pathname.includes('/procurement/documents/suppliers')) return 'Supplier Documents Repository';
    if (pathname.includes('/procurement/documents')) return 'Procurement Documents';
    if (pathname.includes('/procurement/reports')) return 'Procurement Operational Reports';
    if (pathname.includes('/procurement/notifications')) return 'Procurement Notifications';
    if (pathname.includes('/procurement/profile')) return 'Procurement Officer Profile';
    if (pathname.includes('/procurement/help')) return 'Procurement Process Guide & SOPs';
    return 'Procurement Operations';
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle + Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open mobile navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>PROCURly</span>
            <span>/</span>
            <span className="text-brand-blue font-semibold">Procurement</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageContextTitle()}
          </h1>
        </div>
      </div>

      {/* Center/Right: Global Search Bar + Quick Actions + Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Universal Search (Trigger for Modal or Inline) */}
        <button
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-500 text-xs font-medium transition-all group w-40 sm:w-60 md:w-72"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span className="truncate flex-1 text-left">Search requests, parts, POs, VIN...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-400 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative" ref={actionRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="btn-red-polished text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-brand-red/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', quickActionOpen && 'rotate-180')} />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-slide-up text-slate-800">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Quick Procurement Actions
              </div>
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('quote');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Add Supplier Quote</p>
                  <p className="text-[10px] text-slate-600">Record quote received from supplier</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('po');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Create Purchase Order</p>
                  <p className="text-[10px] text-slate-600">Issue official PO to supplier</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  router.push('/procurement/quote-comparison');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <GitCompare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Compare Supplier Quotes</p>
                  <p className="text-[10px] text-slate-600">Side-by-side cost matrix</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('exception');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium transition-colors text-left border-t border-slate-100"
              >
                <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Report Exception</p>
                  <p className="text-[10px] text-slate-600">Log supplier or shipping issue</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            aria-label="View notifications"
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-ring-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Procurement Alerts
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {unreadCount} unread action items
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-600">
                    No active notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start',
                        !n.isRead ? 'bg-amber-50/40' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full mt-1.5 shrink-0',
                          !n.isRead
                            ? n.priority === 'Urgent'
                              ? 'bg-brand-red'
                              : 'bg-amber-500'
                            : 'bg-transparent'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {n.description}
                        </p>
                        <span className="text-[10px] text-slate-600 mt-1 block">
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <Link
                  href="/procurement/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Currency & Ecosystem Switcher */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200">
            NZD ($)
          </span>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-colors"
            title="Switch to Customer Trade Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Customer Portal</span>
          </Link>
        </div>

        {/* User Mini Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100">
            {currentUser.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
