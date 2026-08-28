'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { requestsService } from '@/services/requestsService';
import {
  Search,
  ClipboardList,
  ShoppingBag,
  Truck,
  FileText,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Building2,
  Users,
  CreditCard,
  CircleHelp,
} from 'lucide-react';
import { PartRequest, ProcurementOrder, ShipmentTracking, PortalDocument } from '@/types';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    requests: PartRequest[];
    orders: ProcurementOrder[];
    shipments: ShipmentTracking[];
    documents: PortalDocument[];
  }>({ requests: [], orders: [], shipments: [], documents: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults({ requests: [], orders: [], shipments: [], documents: [] });
        return;
      }
      const res = await requestsService.globalSearch(query);
      setResults(res);
      setSelectedIndex(0);
    };
    const timeout = setTimeout(search, 150);
    return () => clearTimeout(timeout);
  }, [query]);

  // Flattened items for keyboard navigation
  const allItems: { type: string; title: string; subtitle: string; href: string; icon: any }[] = [];

  if (!query.trim()) {
    // Quick navigation presets
    allItems.push(
      { type: 'Page', title: 'Dashboard', subtitle: 'Overview of procurement activity', href: '/dashboard', icon: ClipboardList },
      { type: 'Page', title: 'All Requests', subtitle: 'View & manage parts requests', href: '/requests', icon: ClipboardList },
      { type: 'Page', title: 'New Part Request', subtitle: 'Submit a new parts sourcing request', href: '/requests/new', icon: ClipboardList },
      { type: 'Page', title: 'Orders', subtitle: 'Track approved procurement orders', href: '/orders', icon: ShoppingBag },
      { type: 'Page', title: 'Shipments', subtitle: 'Live logistics & transit tracking', href: '/shipments', icon: Truck },
      { type: 'Page', title: 'Payments', subtitle: 'Trade billing & invoice settlement', href: '/payments', icon: CreditCard },
      { type: 'Page', title: 'Company Settings', subtitle: 'AutoCare Auckland profile & delivery addresses', href: '/company', icon: Building2 },
      { type: 'Page', title: 'Help & Support', subtitle: 'FAQ & Trade Desk contact info', href: '/help', icon: CircleHelp }
    );
  } else {
    results.requests.forEach((r) => {
      allItems.push({
        type: 'Request',
        title: `${r.referenceNumber} · ${r.parts[0]?.name || r.title}`,
        subtitle: `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} • Status: ${r.status}`,
        href: `/requests/${r.id}`,
        icon: ClipboardList,
      });
    });

    results.orders.forEach((o) => {
      allItems.push({
        type: 'Order',
        title: `${o.orderNumber} (Ref: ${o.requestNumber})`,
        subtitle: `${o.part.name} • NZ$${o.totalAmountNZD} • Status: ${o.status}`,
        href: `/orders/${o.id}`,
        icon: ShoppingBag,
      });
    });

    results.shipments.forEach((s) => {
      allItems.push({
        type: 'Shipment',
        title: `${s.shipmentNumber} · ${s.partName}`,
        subtitle: `Carrier: ${s.carrier} • Tracking: ${s.carrierTrackingCode} • Status: ${s.status}`,
        href: `/shipments/${s.id}`,
        icon: Truck,
      });
    });

    results.documents.forEach((d) => {
      allItems.push({
        type: 'Document',
        title: d.title,
        subtitle: `${d.category} • ${d.date} • ${d.fileSizeFormatted}`,
        href: `/documents`,
        icon: FileText,
      });
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        router.push(allItems[selectedIndex].href);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-slide-up"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search requests (AH-P-...), orders, shipments, VINs, or parts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-1">
              <p className="text-sm font-semibold text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400">
                Try searching for a Request Number (e.g. AH-P-000123), VIN, make, or part name.
              </p>
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {!query.trim() && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Navigation Destinations
                </div>
              )}
              {allItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${item.type}-${idx}`}
                    onClick={() => {
                      router.push(item.href);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-blue-50/90 text-brand-blue border border-blue-200' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">{item.title}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-brand-blue shrink-0">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span className="text-[10px] text-slate-400">PROCURly Command Center</span>
        </div>
      </div>
    </div>
  );
}
