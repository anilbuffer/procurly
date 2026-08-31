'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  CircleHelp,
} from 'lucide-react';
import { requestsService } from '@/services/requestsService';
import { NotificationItem } from '@/types';
import { GlobalSearchModal } from './GlobalSearchModal';

export interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const pathname = usePathname();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const list = await requestsService.getNotifications();
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    window.addEventListener('procurly_ops_updated', handleUpdate);
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
      window.removeEventListener('procurly_ops_updated', handleUpdate);
      window.removeEventListener('procurly_procurement_updated', handleUpdate);
      window.removeEventListener('procurly_finance_updated', handleUpdate);
    };
  }, []);

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Breadcrumb
  const getBreadcrumbs = () => {
    if (pathname === '/dashboard') return [{ label: 'Dashboard', href: '/dashboard' }];
    if (pathname === '/requests') return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Requests', href: '/requests' }];
    if (pathname === '/requests/new') return [{ label: 'Requests', href: '/requests' }, { label: 'New Request', href: '/requests/new' }];
    if (pathname.startsWith('/requests/')) {
      const id = pathname.replace('/requests/', '');
      return [{ label: 'Requests', href: '/requests' }, { label: id.toUpperCase(), href: pathname }];
    }
    if (pathname === '/orders') return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Orders', href: '/orders' }];
    if (pathname.startsWith('/orders/')) {
      const id = pathname.replace('/orders/', '');
      return [{ label: 'Orders', href: '/orders' }, { label: id.toUpperCase(), href: pathname }];
    }
    if (pathname === '/shipments') return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Shipments', href: '/shipments' }];
    if (pathname.startsWith('/shipments/')) {
      const id = pathname.replace('/shipments/', '');
      return [{ label: 'Shipments', href: '/shipments' }, { label: id.toUpperCase(), href: pathname }];
    }
    if (pathname === '/messages') return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Messages', href: '/messages' }];
    if (pathname === '/payments') return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Payments', href: '/payments' }];
    if (pathname === '/documents') return [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Documents', href: '/documents' }];
    if (pathname === '/company') return [{ label: 'Account', href: '/company' }, { label: 'Company Profile', href: '/company' }];
    if (pathname === '/team') return [{ label: 'Account', href: '/team' }, { label: 'Team Members', href: '/team' }];
    if (pathname === '/notifications') return [{ label: 'Account', href: '/notifications' }, { label: 'Notifications', href: '/notifications' }];
    if (pathname === '/help' || pathname === '/support') return [{ label: 'Support', href: '/help' }, { label: 'Help & Support', href: '/help' }];

    return [{ label: 'Customer Portal', href: '/dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-subtle">
        {/* Left: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden font-medium" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={(crumb.href || '') + idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-bold text-slate-900 truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href || '#'} className="hover:text-brand-blue hover:underline transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Global Search Trigger Button (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-md mx-4">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs hover:bg-white hover:border-slate-300 hover:text-slate-800 transition-all shadow-subtle group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-colors" />
              <span>Search requests, orders or shipments...</span>
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

        {/* Right: Search icon (mobile), Help & Notification Bell */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Help Link */}
          <Link
            href="/help"
            className="p-2 rounded-lg text-slate-600 hover:text-brand-blue hover:bg-slate-100 transition-colors hidden md:flex items-center gap-1 text-xs font-semibold"
            title="Help & Support"
          >
            <CircleHelp className="w-4 h-4" />
            <span className="hidden xl:inline">Help</span>
          </Link>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ed2025] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-slide-up overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Notifications Center
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        await requestsService.markAllNotificationsRead();
                        loadNotifications();
                      }}
                      className="text-[11px] font-bold text-brand-blue hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-400">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.linkUrl || (n as any).targetUrl || (n as any).link || '#'}
                        onClick={async () => {
                          await requestsService.markNotificationRead(n.id);
                          setNotificationsOpen(false);
                        }}
                        className={`block p-3.5 hover:bg-slate-50 transition-colors ${
                          !n.isRead ? 'bg-red-50/20' : ''
                        }`}
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
                      </Link>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-bold text-brand-blue hover:underline"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal Triggered on Ctrl+K */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
