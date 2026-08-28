'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/requests?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Landed Quote Ready for Review',
      desc: '2022 Ford Ranger Wildtrak (AH-P-000124) - Air vs Sea options ready.',
      time: '15 mins ago',
      unread: true,
      link: '/requests/req_102',
    },
    {
      id: 2,
      title: 'Flight NZ90 Landed in Auckland',
      desc: '2021 Toyota Hilux Headlight (AH-P-000123) cleared Biosecurity.',
      time: '2 hours ago',
      unread: false,
      link: '/tracking/req_101',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-subtle">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Request Ref (e.g. AH-P-000123), VIN, Part # or Vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
          />
        </form>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-3">
        {/* Live Freight Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NZ Customs Green-Lane Active</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-red ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-up">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications & Alerts</span>
                <span className="text-[10px] font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
                  1 New Quote
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setNotificationsOpen(false)}
                    className={`block p-3.5 hover:bg-slate-50 transition-colors ${
                      n.unread ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trade User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              MH
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-900 leading-tight">Marcus Henderson</p>
              <p className="text-[10px] text-slate-500">Apex Auto Group</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Marcus Henderson</p>
                <p className="text-[11px] text-slate-500">marcus.h@apexautocraft.co.nz</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Trade Credit: $50,000 (Approved)
                </span>
              </div>
              <div className="py-1 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Trade Account Settings
                </Link>
                <Link
                  href="/requests/new"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Submit New Request
                </Link>
                <Link
                  href="/"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Visit Public Homepage
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <Link
                  href="/login"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Switch Demo Account / Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
