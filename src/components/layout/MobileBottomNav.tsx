'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  MessageSquare,
  Menu,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileBottomNavProps {
  onOpenDrawer: () => void;
  unreadMessagesCount?: number;
  requestsActionCount?: number;
}

export function MobileBottomNav({
  onOpenDrawer,
  unreadMessagesCount = 2,
  requestsActionCount = 2,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Requests',
      href: '/requests',
      icon: ClipboardList,
      badge: requestsActionCount > 0 ? requestsActionCount : undefined,
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-lg flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative',
              isActive
                ? 'text-[#ed2025] font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#ed2025] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}

      {/* Floating Center / Add Request Link */}
      <Link
        href="/requests/new"
        className="flex flex-col items-center justify-center py-1 px-2 text-[#ed2025] hover:scale-105 transition-transform"
        aria-label="New Part Request"
      >
        <div className="w-7 h-7 rounded-full bg-[#ed2025] text-white flex items-center justify-center shadow-md">
          <Plus className="w-4 h-4 stroke-[3]" />
        </div>
        <span className="text-[9px] font-bold mt-0.5 text-slate-800">New Req</span>
      </Link>

      {/* More / Menu Drawer */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition-colors"
        aria-label="Open Full Menu"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">More</span>
      </button>
    </div>
  );
}
