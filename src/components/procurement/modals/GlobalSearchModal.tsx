'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  X,
  ClipboardList,
  FileText,
  ShoppingCart,
  Building2,
  AlertTriangle,
  ArrowRight,
  Truck,
  Car,
  Package,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  ProcurementRequest,
  SupplierQuoteItem,
  PurchaseOrderItem,
  SupplierSummary,
  ProcurementExceptionItem,
} from '@/types/procurement';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>([]);
  const [pos, setPos] = useState<PurchaseOrderItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [exceptions, setExceptions] = useState<ProcurementExceptionItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRequests(procurementService.getRequests());
      setQuotes(procurementService.getSupplierQuotes());
      setPos(procurementService.getPurchaseOrders());
      setSuppliers(procurementService.getSuppliers());
      setExceptions(procurementService.getExceptions());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener for ESC & Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
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

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredRequests = q
    ? requests.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.part.name.toLowerCase().includes(q) ||
          r.vehicle.make.toLowerCase().includes(q) ||
          r.vehicle.model.toLowerCase().includes(q) ||
          (r.vehicle.vin && r.vehicle.vin.toLowerCase().includes(q))
      )
    : requests.slice(0, 3);

  const filteredQuotes = q
    ? quotes.filter(
        (sq) =>
          sq.quoteNumber.toLowerCase().includes(q) ||
          sq.requestRef.toLowerCase().includes(q) ||
          sq.supplierName.toLowerCase().includes(q) ||
          sq.partName.toLowerCase().includes(q)
      )
    : [];

  const filteredPOs = q
    ? pos.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q) ||
          po.customerName.toLowerCase().includes(q) ||
          po.partName.toLowerCase().includes(q)
      )
    : [];

  const filteredSuppliers = q
    ? suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.specialization.some((sp) => sp.toLowerCase().includes(q))
      )
    : [];

  const filteredExceptions = q
    ? exceptions.filter(
        (e) =>
          e.code.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.supplierName.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    filteredRequests.length > 0 ||
    filteredQuotes.length > 0 ||
    filteredPOs.length > 0 ||
    filteredSuppliers.length > 0 ||
    filteredExceptions.length > 0;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Request #, VIN, Part Name, Supplier, PO#, Exception..."
            className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs bg-slate-200 text-slate-600 font-mono rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto custom-scrollbar p-3 space-y-4 divide-y divide-slate-100">
          {!hasResults && q && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for a request number (e.g. PR-10048), VIN, or supplier name.
              </p>
            </div>
          )}

          {/* Requests */}
          {filteredRequests.length > 0 && (
            <div className="pt-2 first:pt-0">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-brand-blue" />
                Procurement Requests
              </p>
              <div className="space-y-1 mt-1">
                {filteredRequests.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(`/procurement/requests/${r.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
                        {r.requestNumber.replace('PR-', '#')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {r.requestNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            {r.customerName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 truncate font-medium">
                          {r.part.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {r.vehicle.year} {r.vehicle.make} {r.vehicle.model} • VIN: {r.vehicle.vin}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Supplier Quotes */}
          {filteredQuotes.length > 0 && (
            <div className="pt-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Supplier Quotes
              </p>
              <div className="space-y-1 mt-1">
                {filteredQuotes.map((sq) => (
                  <button
                    key={sq.id}
                    onClick={() => handleSelect(`/procurement/supplier-quotes/${sq.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        SQ
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{sq.quoteNumber}</span>
                          <span className="text-[11px] text-slate-500 font-semibold">{sq.supplierName}</span>
                        </div>
                        <p className="text-xs text-slate-700 truncate">{sq.partName}</p>
                        <p className="text-[11px] text-emerald-600 font-bold">
                          NZD ${sq.totalCostNZD.toFixed(2)} • Lead Time: {sq.leadTimeDisplay}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Orders */}
          {filteredPOs.length > 0 && (
            <div className="pt-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                Purchase Orders
              </p>
              <div className="space-y-1 mt-1">
                {filteredPOs.map((po) => (
                  <button
                    key={po.id}
                    onClick={() => handleSelect(`/procurement/purchase-orders/${po.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        PO
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{po.poNumber}</span>
                          <span className="text-[11px] text-slate-500">{po.supplierName}</span>
                        </div>
                        <p className="text-xs text-slate-700 truncate">{po.partName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Status: <span className="font-semibold text-slate-800">{po.status}</span> • Total: NZD ${po.totalAmountNZD.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers */}
          {filteredSuppliers.length > 0 && (
            <div className="pt-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Suppliers
              </p>
              <div className="space-y-1 mt-1">
                {filteredSuppliers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/procurement/suppliers/${s.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {s.code}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {s.location}, {s.country} • Response Rate: {s.responseRatePct}%
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions */}
          {filteredExceptions.length > 0 && (
            <div className="pt-2">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-brand-red" />
                Exceptions
              </p>
              <div className="space-y-1 mt-1">
                {filteredExceptions.map((exc) => (
                  <button
                    key={exc.id}
                    onClick={() => handleSelect(`/procurement/exceptions`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-brand-red flex items-center justify-center font-bold text-xs shrink-0">
                        !
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{exc.code}</span>
                          <span className="text-[11px] font-semibold text-brand-red">{exc.type}</span>
                        </div>
                        <p className="text-xs text-slate-700 truncate">{exc.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Stage: {exc.stage} • Assigned: {exc.assignedTo}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Enter</kbd> to select
            </span>
          </div>
          <span className="font-semibold text-brand-blue">PROCURly Command Search</span>
        </div>
      </div>
    </div>
  );
}
