'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  Compass,
  Settings,
  ShieldCheck,
  Building2,
  PhoneCall,
  LogOut,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export function DashboardSidebar({ onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [activeCount, setActiveCount] = React.useState(8);
  const [quotesReadyCount, setQuotesReadyCount] = React.useState(2);
  const [trackingId, setTrackingId] = React.useState('req_119');

  const loadCounts = async () => {
    try {
      const all = await requestsService.getRequests();
      const active = all.filter((r) => r.status !== 'Delivered' && r.status !== 'Cancelled' && r.status !== 'Rejected').length;
      const quotes = all.filter((r) => r.status === 'Quoted' || r.status === 'Quote Ready').length;
      const shipped = all.find((r) => r.status === 'Shipped' || r.status.includes('In Transit') || r.status === 'Customs Clearance');
      setActiveCount(active);
      setQuotesReadyCount(quotes);
      if (shipped) setTrackingId(shipped.id);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    loadCounts();
    window.addEventListener('procurly_requests_updated', loadCounts);
    return () => window.removeEventListener('procurly_requests_updated', loadCounts);
  }, []);

  const navItems = [
    {
      label: 'Dashboard Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'All Part Requests',
      href: '/requests',
      icon: FileText,
      badge: `${activeCount} Active`,
    },
    {
      label: 'Quotes & Approvals',
      href: '/quotes',
      icon: Clock,
      badge: quotesReadyCount > 0 ? `${quotesReadyCount} Ready` : undefined,
      badgeColor: 'bg-[#ed2025] text-white',
    },
    {
      label: 'Live Tracking',
      href: `/tracking/${trackingId}`,
      icon: Compass,
    },
    {
      label: 'Trade Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-black text-lg shadow-sm">
            <Box className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white tracking-tight">Procurly</span>
              <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-1 py-0.2 rounded border border-red-800">
                PORTAL
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-0.5">
              by Autohub NZ
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Request Action */}
      <div className="p-4">
        <Link href="/requests/new" onClick={onCloseMobile}>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-glow transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Part Request</span>
          </button>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Navigation
        </div>
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
              onClick={onCloseMobile}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Support & Desk
        </div>
        <div className="px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Desk</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Brendon Davies <br />
            <span className="text-slate-300 font-mono">09 525 6814</span>
          </p>
        </div>
      </nav>

      {/* Trade Account Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-blue/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">Premier Motors NZ</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Trade
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">NZBN: 9429048291034</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <Link
            href="/login"
            className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch / Logout</span>
          </Link>
          <Link
            href="/"
            className="text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            Public Site →
          </Link>
        </div>
      </div>
    </aside>
  );
}
