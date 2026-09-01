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
  CreditCard,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceStaffUser, FinanceNotification } from '@/types/finance';

export interface FinanceHeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenGlobalSearch?: () => void;
  onOpenQuickAction?: (actionType: 'payment' | 'refund' | 'credit' | 'clearance') => void;
}

export function FinanceHeader({
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenQuickAction,
}: FinanceHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FinanceStaffUser>(() => financeService.getStaffUsers()[0]);
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setCurrentUser(financeService.getCurrentUser());
    setNotifications(financeService.getNotifications());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
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
    financeService.markAllNotificationsAsRead();
  };

  const handleNotificationClick = (notif: FinanceNotification) => {
    financeService.markNotificationAsRead(notif.id);
    setNotifDropdownOpen(false);
    if (notif.targetUrl) {
      router.push(notif.targetUrl);
    }
  };

  // Generate clean page title based on current route
  const getPageContextTitle = () => {
    if (pathname.includes('/finance/dashboard')) return 'Financial Control Centre';
    if (pathname.includes('/finance/tasks')) return 'My Finance Tasks';
    if (pathname.includes('/finance/payments/')) return 'Payment Detail & Audit Ledger';
    if (pathname.includes('/finance/payments')) return 'Payments Workspace';
    if (pathname.includes('/finance/awaiting-payment')) return 'Awaiting Payment & Collections';
    if (pathname.includes('/finance/transactions')) return 'Payment Transactions Ledger';
    if (pathname.includes('/finance/credit-accounts/')) return 'Customer Credit Account Profile';
    if (pathname.includes('/finance/credit-accounts')) return 'Credit Accounts Management';
    if (pathname.includes('/finance/refunds/')) return 'Refund Specification & Settlement';
    if (pathname.includes('/finance/refunds')) return 'Customer Refunds Management';
    if (pathname.includes('/finance/exceptions/')) return 'Financial Exception Investigation';
    if (pathname.includes('/finance/exceptions')) return 'Financial Exceptions Command';
    if (pathname.includes('/finance/customer-quotes/')) return 'Customer Quote Financial Review';
    if (pathname.includes('/finance/customer-quotes')) return 'Customer Quotes (Finance View)';
    if (pathname.includes('/finance/approved-orders/')) return 'Approved Order Clearance';
    if (pathname.includes('/finance/approved-orders')) return 'Approved Orders Clearance';
    if (pathname.includes('/finance/order-payments')) return 'Order Payment Releases';
    if (pathname.includes('/finance/customers/') && pathname.includes('/payments')) return 'Customer Payment History';
    if (pathname.includes('/finance/customers/')) return 'Customer Financial Profile';
    if (pathname.includes('/finance/customers')) return 'Commercial Customers Directory';
    if (pathname.includes('/finance/reports/revenue')) return 'Revenue Performance Intelligence';
    if (pathname.includes('/finance/reports/outstanding')) return 'Outstanding Aging & Risk Analysis';
    if (pathname.includes('/finance/reports/transactions')) return 'Transaction Ledger Export';
    if (pathname.includes('/finance/reports')) return 'Financial Reports Hub';
    if (pathname.includes('/finance/documents/invoices')) return 'Tax Invoices Manager';
    if (pathname.includes('/finance/documents/receipts')) return 'Payment Confirmation Receipts';
    if (pathname.includes('/finance/documents')) return 'Financial Documents Repository';
    if (pathname.includes('/finance/notifications')) return 'Finance Notifications';
    if (pathname.includes('/finance/profile')) return 'Financial Controller Profile';
    if (pathname.includes('/finance/help')) return 'Finance SOPs & Payment Guides';
    return 'Financial Operations';
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
            <span className="text-emerald-700 font-semibold">Finance & Treasury</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageContextTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Trigger */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all shadow-subtle group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span>Search payments, transactions, customers, orders...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white rounded border border-slate-200 text-slate-400">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white rounded border border-slate-200 text-slate-400">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Role badge + Quick Action + Notification Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* Role Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentUser.role}</span>
        </div>

        {/* Quick Action Dropdown (+ Action) */}
        <div className="relative" ref={actionRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-glow transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-slide-up">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Finance Quick Actions
                </span>
              </div>
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('payment');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Record Customer Payment</span>
              </button>
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('refund');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Process Refund Request</span>
              </button>
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('credit');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
              >
                <Wallet className="w-4 h-4 text-indigo-600" />
                <span>Adjust Credit Limit / Terms</span>
              </button>
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  onOpenQuickAction?.('clearance');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Grant Order Clearance</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ed2025] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-slide-up overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Finance Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-100 text-[#ed2025] text-[10px] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No finance notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'block p-3.5 hover:bg-slate-50 transition-colors cursor-pointer',
                        !n.isRead ? 'bg-emerald-50/20' : ''
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ed2025] shrink-0" />
                          )}
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          {n.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 pl-3">{n.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/finance/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All Finance Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
