'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CreditCard,
  Building2,
  FileText,
  AlertTriangle,
  RotateCcw,
  Receipt,
  ArrowRight,
  X,
  Wallet,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { cn } from '@/lib/utils';

interface FinanceGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinanceGlobalSearchModal({ isOpen, onClose }: FinanceGlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

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

  const payments = financeService.getPayments();
  const accounts = financeService.getCreditAccounts();
  const refunds = financeService.getRefunds();
  const exceptions = financeService.getExceptions();
  const docs = financeService.getDocuments();

  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.requestNumber.toLowerCase().includes(query.toLowerCase()) ||
      p.customerName.toLowerCase().includes(query.toLowerCase()) ||
      p.partsSummary.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredAccounts = accounts.filter(
    (a) =>
      a.customerName.toLowerCase().includes(query.toLowerCase()) ||
      a.nzbn.includes(query)
  ).slice(0, 3);

  const filteredRefunds = refunds.filter(
    (r) =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.customerName.toLowerCase().includes(query.toLowerCase()) ||
      r.reason.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  const filteredExceptions = exceptions.filter(
    (e) =>
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      e.customerName.toLowerCase().includes(query.toLowerCase()) ||
      e.summary.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  const filteredDocs = docs.filter(
    (d) =>
      d.documentNumber.toLowerCase().includes(query.toLowerCase()) ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.customerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const totalResults =
    filteredPayments.length +
    filteredAccounts.length +
    filteredRefunds.length +
    filteredExceptions.length +
    filteredDocs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-slide-up">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search payments (PAY-00123), accounts, refunds, exceptions, invoices..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white rounded border border-slate-200 text-slate-400 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <Search className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-600">No finance records found</p>
              <p>Try searching by customer name, payment ID, or NZBN number.</p>
            </div>
          ) : (
            <div className="space-y-3 p-2">
              {/* Payments */}
              {filteredPayments.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Payments
                  </p>
                  <div className="space-y-1">
                    {filteredPayments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/finance/payments/${p.id}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900">{p.id}</span>
                              <span className="text-xs text-slate-500 truncate">{p.customerName}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{p.partsSummary}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-slate-900">NZ${p.amount.toFixed(2)}</p>
                          <span className="text-[10px] font-semibold text-emerald-600">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit Accounts */}
              {filteredAccounts.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Credit Accounts
                  </p>
                  <div className="space-y-1">
                    {filteredAccounts.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleSelect(`/finance/credit-accounts/${a.customerId}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900">{a.customerName}</p>
                            <p className="text-[11px] text-slate-400">NZBN: {a.nzbn} • {a.paymentTerms}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-700">Limit: NZ${a.creditLimit.toLocaleString()}</p>
                          <span className="text-[10px] font-semibold text-indigo-600">{a.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refunds */}
              {filteredRefunds.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Refunds
                  </p>
                  <div className="space-y-1">
                    {filteredRefunds.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelect(`/finance/refunds/${r.id}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <RotateCcw className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900">{r.id}</span>
                              <span className="text-xs text-slate-500">{r.customerName}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{r.reason}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-amber-700">NZ${r.refundAmount.toFixed(2)}</p>
                          <span className="text-[10px] font-semibold text-slate-500">{r.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {filteredDocs.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Documents & Invoices
                  </p>
                  <div className="space-y-1">
                    {filteredDocs.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect('/finance/documents')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">{d.title}</p>
                            <p className="text-[11px] text-slate-400">{d.documentNumber} • {d.issueDate}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-slate-900">NZ${d.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or arrow keys</span>
          <span className="font-medium">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
