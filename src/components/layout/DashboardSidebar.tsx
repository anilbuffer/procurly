'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Truck,
  MessageSquare,
  CreditCard,
  FileText,
  Building2,
  Users,
  Bell,
  CircleHelp,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Box,
  User,
  Settings,
  Shield,
  MapPin,
  ChevronUp,
  CreditCard as PaymentIcon,
} from 'lucide-react';
import { requestsService, DEFAULT_WORKSPACE_USER } from '@/services/requestsService';
import { WorkspaceUser } from '@/types';
import { SmoothLogoutModal } from '@/components/ui/SmoothLogoutModal';

export interface DashboardSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DashboardSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<WorkspaceUser>(DEFAULT_WORKSPACE_USER);
  const [requestsActionCount, setRequestsActionCount] = useState(2);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(2);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [reqs, notifs, usr] = await Promise.all([
        requestsService.getRequests(),
        requestsService.getNotifications(),
        requestsService.getCurrentUser(),
      ]);

      if (usr) {
        setCurrentUser(usr);
      }

      const actionCount = reqs.filter(
        (r) =>
          r.status === 'Quote Ready' ||
          r.status === 'Quoted' ||
          r.status === 'Awaiting Customer Approval' ||
          r.status === 'Payment Failed' ||
          r.paymentStatus === 'Awaiting Payment' ||
          r.paymentStatus === 'Payment Failed'
      ).length;

      setRequestsActionCount(actionCount);
      setUnreadNotifsCount(notifs.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    window.addEventListener('procurly_user_updated', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
      window.removeEventListener('procurly_user_updated', handleUpdate);
    };
  }, []);

  // Handle outside click to close profile popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Requests',
      href: '/requests',
      icon: ClipboardList,
      badge: requestsActionCount > 0 ? `${requestsActionCount}` : undefined,
      badgeAttention: true,
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Shipments',
      href: '/shipments',
      icon: Truck,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
    },
    {
      label: 'Payments',
      href: '/payments',
      icon: CreditCard,
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: FileText,
    },
  ];

  const accountNavItems = [
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
    },
  ];

  const supportNavItems = [
    {
      label: 'Help & Support',
      href: '/help',
      icon: CircleHelp,
    },
  ];

  const renderNavLink = (item: {
    label: string;
    href: string;
    icon: any;
    badge?: string;
    badgeAttention?: boolean;
  }) => {
    const Icon = item.icon;
    const isActive =
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href || item.label}
        href={item.href || '#'}
        onClick={onCloseMobile}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'flex items-center rounded-xl text-xs font-semibold transition-all relative group',
          isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5',
          isActive
            ? 'bg-slate-800/90 text-white font-bold shadow-sm border-l-2 border-[#ed2025]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={cn(
              'w-4 h-4 shrink-0 transition-colors',
              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
            )}
          />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </div>

        {/* Badge */}
        {item.badge && (
          <span
            className={cn(
              'text-[10px] font-bold rounded-full transition-all',
              isCollapsed
                ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center'
                : 'px-2 py-0.5',
              item.badgeAttention
                ? 'bg-[#ed2025] text-white shadow-sm'
                : 'bg-brand-blue text-white'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
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
        <Link href="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ed2025] to-[#b31317] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            <Box className="w-4 h-4 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">PROCURly</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block -mt-0.5">
                CUSTOMER PORTAL
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

      {/* Primary CTA Button: + New Parts Request */}
      <div className="p-3 shrink-0 bg-slate-900">
        <Link href="/requests/new" onClick={onCloseMobile} className="block">
          <button
            type="button"
            className={cn(
              'w-full inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all active:scale-[0.98]',
              isCollapsed ? 'py-3 px-0' : 'py-3 px-3'
            )}
            title={isCollapsed ? 'New Parts Request' : undefined}
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
            {!isCollapsed && <span>New Parts Request</span>}
          </button>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
        {/* MAIN */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Main
            </div>
          )}
          {mainNavItems.map(renderNavLink)}
        </div>

        {/* ACCOUNT */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Account
            </div>
          )}
          {accountNavItems.map(renderNavLink)}
        </div>

        {/* SUPPORT */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Support
            </div>
          )}
          {supportNavItems.map(renderNavLink)}
        </div>
      </nav>

      {/* Bottom Workspace User Profile Section (Sole Location in App) */}
      <div ref={profileRef} className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0 relative mt-auto">
        <button
          type="button"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className={cn(
            'w-full flex items-center rounded-xl p-2 cursor-pointer hover:bg-slate-800/70 transition-all text-left group',
            isCollapsed ? 'justify-center' : 'gap-3',
            profileDropdownOpen ? 'bg-slate-800/90 ring-1 ring-slate-700' : ''
          )}
          title={isCollapsed ? `${currentUser.organization} (${currentUser.name})` : undefined}
          aria-label="User Profile & Settings"
        >
          {/* User Avatar Initials */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shrink-0 ring-2 ring-blue-400/30">
            {currentUser.avatar || 'AC'}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span className="truncate text-cyan-300 font-semibold">{currentUser.role}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> {currentUser.badge.split('/')[0].trim()}
                </span>
              </div>
            </div>
          )}

          {!isCollapsed && (
            <ChevronUp
              className={cn(
                'w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0',
                profileDropdownOpen ? 'rotate-180' : ''
              )}
            />
          )}
        </button>

        {/* Enhanced Profile Menu Popover */}
        {profileDropdownOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-300 animate-slide-up',
              isCollapsed ? 'left-2 w-64' : 'left-3 right-3'
            )}
          >
            {/* Header Info */}
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-xs truncate">{currentUser.organization}</span>
                <span className="text-[9px] font-black uppercase text-brand-blue bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800 shrink-0">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
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
