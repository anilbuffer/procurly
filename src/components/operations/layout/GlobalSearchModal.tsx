'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ClipboardList,
  Building2,
  AlertTriangle,
  ArrowRight,
  Truck,
  CreditCard,
  FileText,
  CornerDownLeft,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { cn } from '@/lib/utils';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    requests: any[];
    customers: any[];
    exceptions: any[];
  }>({ requests: [], customers: [], exceptions: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ requests: [], customers: [], exceptions: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ requests: [], customers: [], exceptions: [] });
      return;
    }
    const res = operationsService.globalSearch(text);
    setResults(res);
  };

  const handleNavigate = (url: string) => {
    onClose();
    router.push(url);
  };

  if (!isOpen) return null;

  const totalResults =
    results.requests.length + results.customers.length + results.exceptions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Dialog Box */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search requests (AH-P-000123), customers, vehicles, VINs, exceptions..."
            className="flex-1 bg-transparent border-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!query.trim() && (
            <div className="py-8 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Navigation Suggestions
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                <button
                  onClick={() => handleNavigate('/operations/requests/AH-P-000123')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#2B4499] text-xs font-semibold text-slate-700 transition-colors"
                >
                  AH-P-000123 (Left Front Lower Control Arm)
                </button>
                <button
                  onClick={() => handleNavigate('/operations/exceptions')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#ed2025] text-xs font-semibold text-slate-700 transition-colors"
                >
                  LOG-00042 (Delayed Shipment)
                </button>
                <button
                  onClick={() => handleNavigate('/operations/customers')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#2B4499] text-xs font-semibold text-slate-700 transition-colors"
                >
                  AutoCare Auckland
                </button>
              </div>
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by request number (e.g. AH-P-000123), customer name, or VIN.
              </p>
            </div>
          )}

          {/* Requests Group */}
          {results.requests.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-[#2B4499]" />
                <span>Procurement Requests ({results.requests.length})</span>
              </div>
              <div className="space-y-1">
                {results.requests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => handleNavigate(`/operations/requests/${req.referenceNumber}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#2B4499] group-hover:underline">
                          {req.referenceNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{req.part.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Customer: <span className="font-medium text-slate-600">{req.customerName}</span> · Owner:{' '}
                        <span className="font-medium text-slate-600">{req.ownerName}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2B4499] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions Group */}
          {results.exceptions.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#ed2025] mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ed2025]" />
                <span>Operational Exceptions ({results.exceptions.length})</span>
              </div>
              <div className="space-y-1">
                {results.exceptions.map((exc) => (
                  <button
                    key={exc.id}
                    onClick={() => handleNavigate(`/operations/exceptions/${exc.code}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50/40 hover:bg-red-50/80 border border-red-100 hover:border-red-200 transition-all text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#ed2025]">{exc.code}</span>
                        <span className="text-xs font-bold text-slate-900">{exc.title}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                          {exc.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5">{exc.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Related: <span className="font-medium text-slate-700">{exc.requestNumber}</span> ({exc.customerName})
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Group */}
          {results.customers.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Trade Customers ({results.customers.length})</span>
              </div>
              <div className="space-y-1">
                {results.customers.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => handleNavigate(`/operations/customers/${cust.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{cust.businessName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {cust.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        NZBN: {cust.nzbn} · Contact: {cust.primaryContact.name} ({cust.primaryContact.phone})
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2B4499] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation shortcut:</span>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-mono text-[10px]">
              Ctrl + K
            </kbd>
          </div>
          <span className="text-slate-500 font-medium">Autohub Operations Command Finder</span>
        </div>
      </div>
    </div>
  );
}
