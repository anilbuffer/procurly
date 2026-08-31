'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListTodo,
  Bell,
  ClipboardList,
  Search,
  FileText,
  GitCompare,
  ShoppingCart,
  Activity,
  Building2,
  TrendingUp,
  MessageSquare,
  PackageCheck,
  Truck,
  Navigation,
  AlertTriangle,
  User,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Shield,
  Layers,
  LogOut,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementStaffUser } from '@/types/procurement';
import { SmoothLogoutModal } from '@/components/ui/SmoothLogoutModal';

export interface ProcurementSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ProcurementSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: ProcurementSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<ProcurementStaffUser>(procurementService.getCurrentUser());
  const [staffUsers, setStaffUsers] = useState<ProcurementStaffUser[]>(procurementService.getStaffUsers());
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [exceptionsCount, setExceptionsCount] = useState(0);
  const [activeSourcingCount, setActiveSourcingCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setCurrentUser(procurementService.getCurrentUser());
    setStaffUsers(procurementService.getStaffUsers());
    const tasks = procurementService.getTasks();
    setOpenTasksCount(tasks.filter((t) => !t.isCompleted).length);
    const notifs = procurementService.getNotifications();
    setUnreadNotifsCount(notifs.filter((n) => !n.isRead).length);
    const excs = procurementService.getExceptions();
    setExceptionsCount(excs.filter((e) => e.stage !== 'Close').length);
    const reqs = procurementService.getRequests();
    setActiveSourcingCount(reqs.filter((r) => r.status === 'Sourcing' || r.status === 'New' || r.status === 'Awaiting Supplier').length);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
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

  const handleSwitchUser = (user: ProcurementStaffUser) => {
    procurementService.switchUser(user.id);
    setCurrentUser(user);
    setProfileDropdownOpen(false);
  };

  // Exactly matching the requested Sidebar Taxonomy:
  const navSections = [
    {
      group: 'WORKSPACE',
      items: [
        { label: 'Dashboard', href: '/procurement/dashboard', icon: LayoutDashboard },
        {
          label: 'My Tasks',
          href: '/procurement/tasks',
          icon: ListTodo,
          badge: openTasksCount > 0 ? `${openTasksCount}` : undefined,
          badgeAttention: false,
        },
      ],
    },
    {
      group: 'PROCUREMENT',
      items: [
        { label: 'Procurement Requests', href: '/procurement/requests', icon: ClipboardList },
        {
          label: 'Sourcing',
          href: '/procurement/sourcing',
          icon: Search,
          badge: activeSourcingCount > 0 ? `${activeSourcingCount}` : undefined,
          badgeAttention: false,
        },
        { label: 'Supplier Quotes', href: '/procurement/supplier-quotes', icon: FileText },
        { label: 'Quote Comparison', href: '/procurement/quote-comparison', icon: GitCompare },
        { label: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingCart },
        { label: 'Procurement Tracking', href: '/procurement/tracking', icon: Activity },
      ],
    },
    {
      group: 'SUPPLIERS',
      items: [
        { label: 'Suppliers', href: '/procurement/suppliers', icon: Building2 },
      ],
    },
    {
      group: 'LOGISTICS',
      items: [
        {
          label: 'Logistics & Dispatch',
          href: '/procurement/logistics',
          icon: Truck,
          badge: exceptionsCount > 0 ? `${exceptionsCount}` : undefined,
          badgeAttention: true,
        },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { label: 'Profile', href: '/procurement/profile', icon: User },
        { label: 'Help & Support', href: '/procurement/help', icon: HelpCircle },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/procurement/dashboard') {
      return pathname === '/procurement' || pathname === '/procurement/dashboard';
    }
    if (href === '/procurement/suppliers') {
      return pathname.startsWith('/procurement/suppliers');
    }
    if (href === '/procurement/logistics') {
      return pathname.startsWith('/procurement/logistics');
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 text-slate-300 select-none overflow-hidden transition-all duration-250 z-30',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Top Brand / Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
          <Link
            href="/procurement/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
            onClick={onCloseMobile}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-red to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-red/30 shrink-0 group-hover:scale-105 transition-transform">
              P
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white tracking-tight text-base leading-none">
                    PROCUR<span className="text-brand-red">ly</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  Automotive Sourcing Portal
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Item Tree */}
        <div
          className={cn(
            'overflow-y-auto custom-scrollbar px-3 py-3 space-y-5',
            isCollapsed ? 'max-h-[calc(100vh-190px)]' : 'max-h-[calc(100vh-210px)]'
          )}
        >
          {navSections.map((sec, idx) => (
            <div key={sec.group || idx} className="space-y-1">
              {!isCollapsed && sec.group && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {sec.group}
                </p>
              )}
              {sec.items.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label + (item.href || '')}
                    href={item.href || '#'}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-brand-red text-white font-semibold shadow-md shadow-brand-red/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70',
                      isCollapsed && 'justify-center px-0 py-2.5'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-[13px]">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          'ml-auto text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0',
                          item.badgeAttention
                            ? active
                              ? 'bg-white text-brand-red'
                              : 'bg-brand-red text-white animate-pulse'
                            : active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
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
                          item.badgeAttention ? 'bg-brand-red animate-pulse' : 'bg-sky-400'
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / User Profile & Role Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 relative" ref={profileRef}>
        {/* User profile dropdown trigger */}
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className={cn(
            'w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-all text-left focus:outline-none group',
            isCollapsed && 'justify-center p-1.5'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-700 shrink-0">
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
                <span className="text-[9px] font-black uppercase text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800 shrink-0">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email || 'procurement@procurly.com'}</p>
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
