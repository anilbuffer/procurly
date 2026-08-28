'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListTodo,
  CreditCard,
  Clock,
  ArrowLeftRight,
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Receipt,
  Users,
  Building2,
  History,
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  FolderOpen,
  Bell,
  User,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle,
  PlusCircle,
  ExternalLink,
  Shield,
  Box,
  Wallet,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceStaffUser } from '@/types/finance';

export interface FinanceSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenRecordPayment?: () => void;
}

export function FinanceSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  onOpenRecordPayment,
}: FinanceSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<FinanceStaffUser>(financeService.getCurrentUser());
  const [staffUsers, setStaffUsers] = useState<FinanceStaffUser[]>(financeService.getStaffUsers());
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [exceptionsCount, setExceptionsCount] = useState(0);
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [refundsCount, setRefundsCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setCurrentUser(financeService.getCurrentUser());
    setStaffUsers(financeService.getStaffUsers());
    const tasks = financeService.getTasks();
    setOpenTasksCount(tasks.filter((t) => !t.isCompleted).length);
    const notifs = financeService.getNotifications();
    setUnreadNotifsCount(notifs.filter((n) => !n.isRead).length);
    const excs = financeService.getExceptions();
    setExceptionsCount(excs.filter((e) => e.status !== 'Closed').length);
    const awaiting = financeService.getAwaitingPayments();
    setAwaitingCount(awaiting.filter((a) => a.status === 'Due Today' || a.status === 'Overdue').length);
    const refunds = financeService.getRefunds();
    setRefundsCount(refunds.filter((r) => r.status === 'Requested' || r.status === 'Under Review').length);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  // Outside click to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchUser = (user: FinanceStaffUser) => {
    financeService.switchUser(user.id);
    setCurrentUser(user);
    setProfileDropdownOpen(false);
  };

  // Exactly matching the requested Sidebar Taxonomy:
  const navSections = [
    {
      group: 'FINANCE',
      items: [
        { label: 'Dashboard', href: '/finance/dashboard', icon: LayoutDashboard },
        {
          label: 'My Tasks',
          href: '/finance/tasks',
          icon: ListTodo,
          badge: openTasksCount > 0 ? `${openTasksCount}` : undefined,
          badgeAttention: false,
        },
        { label: 'Payments', href: '/finance/payments', icon: CreditCard },
        {
          label: 'Awaiting Payment',
          href: '/finance/awaiting-payment',
          icon: Clock,
          badge: awaitingCount > 0 ? `${awaitingCount}` : undefined,
          badgeAttention: true,
        },
        { label: 'Payment Transactions', href: '/finance/transactions', icon: ArrowLeftRight },
        { label: 'Credit Accounts', href: '/finance/credit-accounts', icon: Wallet },
        {
          label: 'Refunds',
          href: '/finance/refunds',
          icon: RotateCcw,
          badge: refundsCount > 0 ? `${refundsCount}` : undefined,
          badgeAttention: false,
        },
        {
          label: 'Financial Exceptions',
          href: '/finance/exceptions',
          icon: AlertTriangle,
          badge: exceptionsCount > 0 ? `${exceptionsCount}` : undefined,
          badgeAttention: true,
        },
      ],
    },
    {
      group: 'QUOTATIONS & ORDERS',
      items: [
        { label: 'Customer Quotes', href: '/finance/customer-quotes', icon: FileSpreadsheet },
        { label: 'Approved Orders', href: '/finance/approved-orders', icon: CheckCircle2 },
        { label: 'Order Payments', href: '/finance/order-payments', icon: Receipt },
      ],
    },
    {
      group: 'CUSTOMERS',
      items: [
        { label: 'Customers', href: '/finance/customers', icon: Building2 },
        { label: 'Credit Customers', href: '/finance/credit-accounts', icon: Users },
        { label: 'Payment History', href: '/finance/customers/cus_autocare_akl/payments', icon: History },
      ],
    },
    {
      group: 'REPORTING',
      items: [
        { label: 'Financial Reports', href: '/finance/reports', icon: BarChart3 },
        { label: 'Revenue', href: '/finance/reports/revenue', icon: TrendingUp },
        { label: 'Outstanding Payments', href: '/finance/reports/outstanding', icon: DollarSign },
        { label: 'Transaction Reports', href: '/finance/reports/transactions', icon: FileText },
      ],
    },
    {
      group: 'DOCUMENTS',
      items: [
        { label: 'Invoices', href: '/finance/documents/invoices', icon: FileText },
        { label: 'Payment Receipts', href: '/finance/documents/receipts', icon: Receipt },
        { label: 'Financial Documents', href: '/finance/documents', icon: FolderOpen },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        {
          label: 'Notifications',
          href: '/finance/notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
          badgeAttention: unreadNotifsCount > 0,
        },
        { label: 'Profile', href: '/finance/profile', icon: User },
        { label: 'Help & Support', href: '/finance/help', icon: CircleHelp },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/finance/dashboard') return pathname === '/finance/dashboard' || pathname === '/finance';
    return pathname === href || (pathname.startsWith(href + '/') && href !== '/finance/customers');
  };

  return (
    <aside
      className={cn(
        'bg-slate-900 text-slate-300 flex flex-col h-full max-h-screen border-r border-slate-800 transition-all duration-250 select-none relative overflow-hidden',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between min-h-[65px] shrink-0 bg-slate-900">
        <Link href="/finance/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ed2025] to-[#991b1e] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            <Box className="w-4 h-4 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">PROCURly</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-normal border border-emerald-500/30">
                  NZD
                </span>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block -mt-0.5">
                FINANCE PORTAL
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle (Desktop only) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Primary CTA Button: + Record Payment */}
      <div className="p-3 shrink-0 bg-slate-900">
        <button
          type="button"
          onClick={onOpenRecordPayment}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all active:scale-[0.98]',
            isCollapsed ? 'py-3 px-0' : 'py-3 px-3'
          )}
          title={isCollapsed ? 'Record Payment / Action' : undefined}
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
          {!isCollapsed && <span>Record Payment</span>}
        </button>
      </div>

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-4">
        {navSections.map((section, idx) => (
          <div key={section.group + idx} className="space-y-1">
            {!isCollapsed ? (
              <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                {section.group}
              </p>
            ) : (
              <div className="h-px bg-slate-800 my-2" />
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl text-xs font-semibold transition-all relative group',
                    isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2',
                    active
                      ? 'bg-slate-800/90 text-white font-bold shadow-sm border-l-2 border-[#ed2025]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badge */}
                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[10px] font-bold rounded-full transition-all px-2 py-0.5',
                        item.badgeAttention
                          ? 'bg-[#ed2025] text-white shadow-sm animate-pulse'
                          : 'bg-emerald-600 text-white'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Dot on collapsed if badge exists */}
                  {isCollapsed && item.badge && (
                    <span
                      className={cn(
                        'absolute top-1.5 right-2 w-2 h-2 rounded-full',
                        item.badgeAttention ? 'bg-[#ed2025] animate-pulse' : 'bg-emerald-400'
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / User Profile & Role Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 relative shrink-0" ref={profileRef}>
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className={cn(
            'w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-all text-left focus:outline-none group',
            isCollapsed && 'justify-center p-1.5'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-700 shrink-0 shadow-sm">
            {currentUser.avatar}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight group-hover:text-slate-100">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {currentUser.role}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <ChevronUp
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0',
                profileDropdownOpen ? 'transform rotate-180' : ''
              )}
            />
          )}
        </button>

        {/* Popover Switcher */}
        {profileDropdownOpen && (
          <div
            className={cn(
              'absolute bottom-full left-3 z-50 mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 text-slate-200 animate-slide-up',
              isCollapsed ? 'w-64 -left-2' : 'w-[calc(100%-24px)]'
            )}
          >
            <div className="px-2.5 py-2 border-b border-slate-800 mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Finance Specialist
              </p>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
              {staffUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors',
                    currentUser.id === u.id
                      ? 'bg-[#ed2025]/20 text-white font-medium border border-[#ed2025]/30'
                      : 'hover:bg-slate-800 text-slate-300'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{u.name}</p>
                    <p className="truncate text-[10px] text-slate-400">{u.role}</p>
                  </div>
                  {currentUser.id === u.id && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-800 flex flex-col gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
                <span>Switch to Customer Portal</span>
              </Link>
              <Link
                href="/procurement/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
                <span>Switch to Procurement Portal</span>
              </Link>
              <Link
                href="/operations/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
                <span>Switch to Operations Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
