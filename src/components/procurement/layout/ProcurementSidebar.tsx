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
  FolderOpen,
  FileSpreadsheet,
  BarChart3,
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
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementStaffUser } from '@/types/procurement';

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
        {
          label: 'Notifications',
          href: '/procurement/notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
          badgeAttention: unreadNotifsCount > 0,
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
        { label: 'Supplier Performance', href: '/procurement/suppliers/performance', icon: TrendingUp },
        { label: 'Supplier Communications', href: '/procurement/supplier-communications', icon: MessageSquare },
      ],
    },
    {
      group: 'LOGISTICS',
      items: [
        { label: 'Ready for Dispatch', href: '/procurement/ready-for-dispatch', icon: PackageCheck },
        { label: 'Shipping', href: '/procurement/shipping', icon: Truck },
        { label: 'In Transit', href: '/procurement/in-transit', icon: Navigation },
        {
          label: 'Logistics Exceptions',
          href: '/procurement/exceptions',
          icon: AlertTriangle,
          badge: exceptionsCount > 0 ? `${exceptionsCount}` : undefined,
          badgeAttention: true,
        },
      ],
    },
    {
      group: 'DOCUMENTS',
      items: [
        { label: 'Supplier Documents', href: '/procurement/documents/suppliers', icon: FolderOpen },
        { label: 'Procurement Documents', href: '/procurement/documents', icon: FileSpreadsheet },
      ],
    },
    {
      group: 'REPORTS',
      items: [
        { label: 'Procurement Reports', href: '/procurement/reports', icon: BarChart3 },
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
    if (href === '/procurement/documents') {
      return pathname === '/procurement/documents';
    }
    if (href === '/procurement/suppliers') {
      return pathname === '/procurement/suppliers';
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
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-blue/30 text-sky-400 border border-sky-400/20">
                    Procurement
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

        {/* Live Operational Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 bg-slate-950/20 border-b border-slate-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-medium text-slate-300">Procurement Command</span>
            </div>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Active Session
            </span>
          </div>
        )}

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
                    key={item.label + item.href}
                    href={item.href}
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
                Switch Procurement Specialist
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
                      ? 'bg-brand-red/20 text-white font-medium border border-brand-red/30'
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
                    <CheckCircle className="w-3.5 h-3.5 text-brand-red shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-800 flex flex-col gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Switch to Customer Portal</span>
              </Link>
              <Link
                href="/finance/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Switch to Finance Portal</span>
              </Link>
              <Link
                href="/operations/dashboard"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Switch to Operations Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
