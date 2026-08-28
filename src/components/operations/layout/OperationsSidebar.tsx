'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListTodo,
  ClipboardList,
  Search,
  FileText,
  Receipt,
  ShoppingCart,
  Truck,
  PackageCheck,
  AlertTriangle,
  CreditCard,
  Clock,
  RotateCcw,
  Building2,
  UserCheck,
  MessageSquare,
  Bell,
  BarChart3,
  Users,
  ShieldCheck,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Layers,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationsStaffUser } from '@/types/operations';

export interface OperationsSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function OperationsSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: OperationsSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [staffUsers, setStaffUsers] = useState<OperationsStaffUser[]>(operationsService.getStaffUsers());
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [exceptionsCount, setExceptionsCount] = useState(0);
  const [pendingCustCount, setPendingCustCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setCurrentUser(operationsService.getCurrentUser());
    setStaffUsers(operationsService.getStaffUsers());
    const tasks = operationsService.getTasks();
    setOpenTasksCount(tasks.filter((t) => t.status !== 'Completed').length);
    const excs = operationsService.getExceptions();
    setExceptionsCount(excs.filter((e) => e.status !== 'Resolved' && e.status !== 'Closed').length);
    const custs = operationsService.getCustomers();
    setPendingCustCount(custs.filter((c) => c.status === 'Pending Approval').length);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
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

  const handleSwitchUser = (user: OperationsStaffUser) => {
    operationsService.switchUser(user.id);
    setCurrentUser(user);
    setProfileDropdownOpen(false);
  };

  // ─── Navigation structure (mirrors Customer Portal section pattern) ──────────
  const navSections = [
    {
      group: 'Command Centre',
      items: [
        { label: 'Dashboard', href: '/operations/dashboard', icon: LayoutDashboard },
        {
          label: 'My Tasks',
          href: '/operations/tasks',
          icon: ListTodo,
          badge: openTasksCount > 0 ? `${openTasksCount}` : undefined,
          badgeAttention: false,
        },
      ],
    },
    {
      group: 'Procurement',
      items: [
        { label: 'Requests', href: '/operations/requests', icon: ClipboardList },
        { label: 'Sourcing', href: '/operations/sourcing', icon: Search },
        { label: 'Supplier Quotes', href: '/operations/supplier-quotes', icon: FileText },
        { label: 'Customer Quotes', href: '/operations/customer-quotes', icon: Receipt },
        { label: 'Procurement Orders', href: '/operations/procurement-orders', icon: ShoppingCart },
      ],
    },
    {
      group: 'Logistics',
      items: [
        { label: 'Shipments', href: '/operations/shipments', icon: Truck },
        { label: 'In Transit', href: '/operations/shipments', icon: PackageCheck },
        {
          label: 'Exceptions',
          href: '/operations/exceptions',
          icon: AlertTriangle,
          badge: exceptionsCount > 0 ? `${exceptionsCount}` : undefined,
          badgeAttention: true,
        },
      ],
    },
    {
      group: 'Finance',
      items: [
        { label: 'Payments', href: '/operations/payments', icon: CreditCard },
        { label: 'Outstanding', href: '/operations/payments', icon: Clock },
        { label: 'Refunds', href: '/operations/refunds', icon: RotateCcw },
      ],
    },
    {
      group: 'Customers',
      items: [
        { label: 'Customers', href: '/operations/customers', icon: Building2 },
        {
          label: 'Pending Approvals',
          href: '/operations/customers/pending',
          icon: UserCheck,
          badge: pendingCustCount > 0 ? `${pendingCustCount}` : undefined,
          badgeAttention: false,
        },
      ],
    },
    {
      group: 'Communication',
      items: [
        { label: 'Messages', href: '/operations/messages', icon: MessageSquare },
        { label: 'Notifications', href: '/operations/notifications', icon: Bell },
      ],
    },
    {
      group: 'Reporting',
      items: [{ label: 'Reports', href: '/operations/reports', icon: BarChart3 }],
    },
    {
      group: 'Administration',
      items: [
        { label: 'Users', href: '/operations/users', icon: Users },
        { label: 'Roles & Permissions', href: '/operations/roles', icon: ShieldCheck },
        { label: 'Configuration', href: '/operations/configuration', icon: Settings },
        { label: 'Audit Log', href: '/operations/audit', icon: History },
      ],
    },
  ];

  // ─── Render a single nav link — mirrors Customer Portal renderNavLink exactly ─
  const renderNavLink = (item: {
    label: string;
    href: string;
    icon: any;
    badge?: string;
    badgeAttention?: boolean;
  }) => {
    const Icon = item.icon;
    const isActive =
      item.href === '/operations/dashboard'
        ? pathname === '/operations/dashboard'
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href + item.label}
        href={item.href}
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

        {/* Badge — red for exceptions (attention), brand-blue for others */}
        {item.badge && (
          <span
            className={cn(
              'text-[10px] font-bold rounded-full transition-all',
              isCollapsed
                ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center'
                : 'px-2 py-0.5',
              item.badgeAttention
                ? 'bg-[#ed2025] text-white shadow-sm'
                : 'bg-[#2B4499] text-white'
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
        // ── Exactly mirrors Customer Portal: slate-900 dark sidebar ──────────
        'bg-slate-900 text-slate-300 flex flex-col h-full max-h-screen border-r border-slate-800 transition-all duration-250 select-none relative overflow-hidden',
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* ── Brand Header — mirrors Customer Portal exactly ───────────────────── */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between min-h-[65px] shrink-0 bg-slate-900">
        <Link href="/operations/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
          {/* Red brand icon — identical to Customer Portal */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ed2025] to-[#b31317] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            <Layers className="w-4 h-4 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">PROCURly</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block -mt-0.5">
                OPERATIONS
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle — mirrors Customer Portal */}
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

      {/* ── Quick Create CTA — mirrors Customer Portal "New Parts Request" ────── */}
      <div className="p-3 shrink-0 bg-slate-900">
        <Link href="/operations/requests" onClick={onCloseMobile} className="block">
          <button
            type="button"
            className={cn(
              'w-full inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition-all active:scale-[0.98]',
              isCollapsed ? 'py-3 px-0' : 'py-3 px-3'
            )}
            title={isCollapsed ? 'New Request' : undefined}
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0" />
            {!isCollapsed && <span>New Request</span>}
          </button>
        </Link>
      </div>

      {/* ── Navigation Sections — mirrors Customer Portal section pattern ─────── */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                {section.group}
              </div>
            )}
            {section.items.map(renderNavLink)}
          </div>
        ))}

        {/* ── Support-style "Back to Customer Portal" footer link ──────────── */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Portal
            </div>
          )}
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Customer Portal' : undefined}
            className="flex items-center rounded-xl text-xs font-semibold transition-all relative group text-slate-400 hover:text-white hover:bg-slate-800/50 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-200 transition-colors" />
              {!isCollapsed && <span className="truncate">Customer Portal</span>}
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Bottom Profile / RBAC Switcher — mirrors Customer Portal footer ──── */}
      <div ref={profileRef} className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0 relative mt-auto">
        <button
          type="button"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className={cn(
            'w-full flex items-center rounded-xl p-2 cursor-pointer hover:bg-slate-800/70 transition-all text-left group',
            isCollapsed ? 'justify-center' : 'gap-3',
            profileDropdownOpen ? 'bg-slate-800/90 ring-1 ring-slate-700' : ''
          )}
          title={isCollapsed ? `${currentUser.name} (${currentUser.roleTitle})` : undefined}
          aria-label="User Profile & RBAC Role Switcher"
        >
          {/* Avatar — same gradient as Customer Portal user avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2B4499] to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shrink-0 ring-2 ring-blue-400/30">
            {currentUser.avatar}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-[#ed2025] transition-colors">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span className="truncate text-cyan-300 font-semibold">{currentUser.role}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> {currentUser.roleTitle.split(' ')[0]}
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

        {/* ── Profile Popover — mirrors Customer Portal popover exactly ─────── */}
        {profileDropdownOpen && (
          <div
            className={cn(
              'absolute bottom-full mb-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-300 animate-slide-up',
              isCollapsed ? 'left-2 w-72' : 'left-3 right-3'
            )}
          >
            {/* Header Info */}
            <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-xs truncate">{currentUser.name}</span>
                <span className="text-[9px] font-black uppercase text-[#2B4499] bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800 shrink-0">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Desk / Role:</span>
                <span className="font-bold text-emerald-400">{currentUser.roleTitle}</span>
              </div>
            </div>

            {/* ── RBAC Role Switcher (Operations-specific, replaces customer nav links) */}
            <div className="py-1.5 border-b border-slate-800/60">
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Simulate Role (RBAC)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">Switch user to test permission adaptations:</p>
              </div>
              {staffUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSwitchUser(user)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors',
                      isSelected
                        ? 'bg-slate-800/70 text-white font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0',
                        isSelected ? 'bg-[#2B4499] text-white' : 'bg-slate-700 text-slate-300'
                      )}
                    >
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.roleTitle}</p>
                    </div>
                    {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Links — mirrors Customer Portal */}
            <div className="py-1.5">
              <Link
                href="/operations/configuration"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs">System Configuration</p>
                  <p className="text-[10px] text-slate-500">Margins, SLAs & Carrier defaults</p>
                </div>
              </Link>

              <Link
                href="/operations/audit"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <History className="w-4 h-4 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs">Audit & Compliance Log</p>
                  <p className="text-[10px] text-slate-500">Immutable event trail</p>
                </div>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-cyan-300 hover:bg-slate-800 hover:text-cyan-200 transition-colors font-bold"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs">Customer Portal</p>
                  <p className="text-[10px] text-slate-400">Switch to workshop view</p>
                </div>
              </Link>
            </div>

            {/* Sign Out */}
            <div className="border-t border-slate-800 pt-1">
              <Link
                href="/login"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Sign Out</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
