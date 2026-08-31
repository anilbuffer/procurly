'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Box,
  ListTodo,
  CreditCard,
  FileSpreadsheet,
  Building2,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  PlusCircle,
  LogOut,
  History,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceStaffUser } from '@/types/finance';
import { SmoothLogoutModal } from '@/components/ui/SmoothLogoutModal';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  // Consolidated Sidebar Navigation (Single-Item Top-Level Structure)
  const navSections = [
    {
      group: 'NAVIGATION',
      items: [
        {
          label: 'Dashboard',
          href: '/finance/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'My Tasks',
          href: '/finance/tasks',
          icon: ListTodo,
          badge: openTasksCount > 0 ? `${openTasksCount}` : undefined,
          badgeAttention: false,
        },
        {
          label: 'Payments & Treasury',
          href: '/finance/payments',
          icon: CreditCard,
          badge: awaitingCount + exceptionsCount > 0 ? `${awaitingCount + exceptionsCount}` : undefined,
          badgeAttention: awaitingCount + exceptionsCount > 0,
        },
        {
          label: 'Quotes & Orders',
          href: '/finance/approved-orders',
          icon: FileSpreadsheet,
        },
        {
          label: 'Customers',
          href: '/finance/customers',
          icon: Building2,
        },
        {
          label: 'Reports & Documents',
          href: '/finance/reports',
          icon: BarChart3,
        },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/finance/dashboard') {
      return pathname === '/finance/dashboard' || pathname === '/finance';
    }
    if (href === '/finance/tasks') {
      return pathname.startsWith('/finance/tasks');
    }
    if (href === '/finance/payments') {
      return (
        pathname.startsWith('/finance/payments') ||
        pathname.startsWith('/finance/awaiting-payment') ||
        pathname.startsWith('/finance/transactions') ||
        pathname.startsWith('/finance/credit-accounts') ||
        pathname.startsWith('/finance/refunds') ||
        pathname.startsWith('/finance/exceptions')
      );
    }
    if (href === '/finance/approved-orders') {
      return (
        pathname.startsWith('/finance/approved-orders') ||
        pathname.startsWith('/finance/customer-quotes') ||
        pathname.startsWith('/finance/order-payments')
      );
    }
    if (href === '/finance/customers') {
      return pathname.startsWith('/finance/customers');
    }
    if (href === '/finance/reports') {
      return pathname.startsWith('/finance/reports') || pathname.startsWith('/finance/documents');
    }
    return pathname === href || pathname.startsWith(href + '/');
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

        {/* Enhanced Profile Menu Popover */}
        {profileDropdownOpen && (
          <div
            className={cn(
              'absolute bottom-full left-3 z-50 mb-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 text-xs text-slate-200 animate-slide-up',
              isCollapsed ? 'w-64 -left-2' : 'w-[calc(100%-24px)]'
            )}
          >
            {/* Header Info */}
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-xs truncate">{currentUser.name}</span>
                <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 shrink-0">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email || 'finance@procurly.com'}</p>
            </div>


            {/* Sign Out */}
            <div className="border-t border-slate-800 pt-1">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setIsLoggingOut(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-bold transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Smooth Logout Overlay */}
      <SmoothLogoutModal isOpen={isLoggingOut} onClose={() => setIsLoggingOut(false)} />
    </aside>
  );
}
