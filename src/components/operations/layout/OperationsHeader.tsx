'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Plus,
  Bell,
  Menu,
  ChevronRight,
  Shield,
  LogOut,
  ExternalLink,
  Settings,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationsStaffUser } from '@/types/operations';
import { GlobalSearchModal } from './GlobalSearchModal';
import { QuickCreateModal } from './QuickCreateModal';
import { SmoothLogoutModal } from '@/components/ui/SmoothLogoutModal';
import { cn } from '@/lib/utils';

export interface OperationsHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function OperationsHeader({ onOpenMobileMenu }: OperationsHeaderProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(operationsService.getCurrentUser());
    const handleUpdate = () => setCurrentUser(operationsService.getCurrentUser());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Breadcrumbs — mirrors Customer Portal breadcrumb pattern
  const getBreadcrumbs = () => {
    const segMap: Record<string, string> = {
      operations: 'Operations',
      dashboard: 'Dashboard',
      requests: 'Requests',
      sourcing: 'Sourcing',
      'supplier-quotes': 'Supplier Quotes',
      'customer-quotes': 'Customer Quotes',
      'procurement-orders': 'Procurement Orders',
      shipments: 'Shipments',
      exceptions: 'Exception Centre',
      payments: 'Payments',
      refunds: 'Refunds',
      customers: 'Customers',
      pending: 'Pending Approvals',
      messages: 'Messages',
      notifications: 'Notifications',
      reports: 'Reports',
      tasks: 'My Tasks',
      users: 'Users',
      roles: 'Roles & Permissions',
      configuration: 'Configuration',
      audit: 'Audit Log',
    };

    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    let cumPath = '';
    segments.forEach((seg) => {
      cumPath += '/' + seg;
      crumbs.push({
        label: segMap[seg] || seg.toUpperCase(),
        href: cumPath,
      });
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const sampleNotifs = [
    {
      id: 'n1',
      title: 'Payment Received — AH-P-000120',
      time: '10:18 AM',
      desc: 'NZ$420.00 settled via Account2Account',
      unread: true,
      alert: false,
    },
    {
      id: 'n2',
      title: 'Supplier Quote Expiring — AH-P-000118',
      time: '09:00 AM',
      desc: 'TAS-JP wholesale rate expires in 7 hours',
      unread: true,
      alert: true,
    },
    {
      id: 'n3',
      title: 'New Request Submitted — AH-P-000123',
      time: '08:30 AM',
      desc: 'AutoCare Auckland requested Hiace Control Arm',
      unread: false,
      alert: false,
    },
  ];
  const unreadCount = sampleNotifs.filter((n) => n.unread).length;

  return (
    <>
      {/* Header — matches Customer Portal header EXACTLY: bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 shadow-subtle */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-subtle">
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Breadcrumbs — mirrors Customer Portal exactly */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden font-medium" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-bold text-slate-900 truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-[#2B4499] hover:underline transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Global Search Trigger Button — same style as Customer Portal */}
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all shadow-subtle group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#2B4499] transition-colors" />
              <span>Search requests, customers, orders, shipments...</span>
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

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Role Badge — same style as Customer Portal "Help" area */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[11px] font-bold text-[#2B4499]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{currentUser.roleTitle}</span>
          </div>

          {/* + Create — red, matches Customer Portal primary CTA colour */}
          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-glow transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Notification Bell — matches Customer Portal notification bell exactly */}
          <div ref={notifMenuRef} className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View operational notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ed2025] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-slide-up overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Operational Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-[#2B4499] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {sampleNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={cn('p-3.5 hover:bg-slate-50 transition-colors', n.unread ? 'bg-red-50/20' : '')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {n.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ed2025] shrink-0" />
                          )}
                          <p className={cn('text-xs font-bold', n.alert ? 'text-[#ed2025]' : 'text-slate-900')}>
                            {n.title}
                          </p>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 pl-3">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                  <Link
                    href="/operations/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs font-bold text-[#2B4499] hover:underline"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Dropdown — matches Customer Portal style */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2B4499] to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {currentUser.avatar}
              </div>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-slide-up text-xs overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#2B4499] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <Shield className="w-3 h-3" />
                    <span>{currentUser.roleTitle}</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/operations/configuration"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                  <Link
                    href="/operations/audit"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Audit & Compliance Log</span>
                  </Link>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setIsLoggingOut(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickCreateModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} />
      <SmoothLogoutModal isOpen={isLoggingOut} onClose={() => setIsLoggingOut(false)} />
    </>
  );
}
