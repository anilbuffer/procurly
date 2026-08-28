'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Building2,
  Send,
  Search,
  Paperclip,
  Shield,
  FileText,
  ShoppingCart,
  CheckCircle,
  Clock,
  Car,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  SupplierConversation,
  SupplierSummary,
  ProcurementStaffUser,
} from '@/types/procurement';

function SupplierCommunicationsContent() {
  const searchParams = useSearchParams();
  const initialSupplierId = searchParams.get('supplierId') || '';

  const [conversations, setConversations] = useState<SupplierConversation[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProcurementStaffUser>(procurementService.getCurrentUser());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const convs = procurementService.getConversations();
    const sups = procurementService.getSuppliers();
    setConversations(convs);
    setSuppliers(sups);
    setCurrentUser(procurementService.getCurrentUser());

    const targetSupId = initialSupplierId || (convs.length > 0 ? convs[0].supplierId : sups[0]?.id || '');
    setSelectedSupplierId(targetSupId);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [initialSupplierId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedSupplierId]);

  const activeConv = conversations.find((c) => c.supplierId === selectedSupplierId);
  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSupplierId) return;

    procurementService.sendSupplierMessage(selectedSupplierId, inputText.trim(), isInternalNote);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supplier Communications Workspace
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              Internal & EDI Channels
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated B2B procurement messaging thread. Completely isolated from customer-facing portal communications.
          </p>
        </div>
      </div>

      {/* 2. Communication Grid Container (Split Pane) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] max-h-[750px]">
        {/* Left Pane: Supplier Conversation Threads (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/60">
          <div className="p-3.5 border-b border-slate-200">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor conversation..."
                className="w-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-slate-100">
            {suppliers.map((sup) => {
              const conv = conversations.find((c) => c.supplierId === sup.id);
              const isSelected = sup.id === selectedSupplierId;

              return (
                <button
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={cn(
                    'w-full p-4 text-left transition-colors flex items-start gap-3 group',
                    isSelected ? 'bg-white shadow-xs border-l-4 border-l-brand-red' : 'hover:bg-slate-100/70'
                  )}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-slate-200">
                    {sup.code.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {sup.name}
                      </span>
                      {conv && (
                        <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {conv ? conv.lastMessage : `Direct channel with ${sup.contactName}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>{sup.location}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{sup.responseRatePct}% reply rate</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center & Right Pane: Active Thread & Related Context (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white">
          {/* Thread Header */}
          {activeSupplier ? (
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{activeSupplier.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                    {activeSupplier.code}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {activeSupplier.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Representative: <strong className="text-slate-700">{activeSupplier.contactName}</strong> ({activeSupplier.contactEmail}) • Phone: {activeSupplier.contactPhone}
                </p>
              </div>

              <Link
                href={`/procurement/suppliers/${activeSupplier.id}`}
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                Supplier Profile →
              </Link>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-200">Select a supplier to start messaging</div>
          )}

          {/* Messages Stream */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-slate-50/30 max-h-[480px]">
            {!activeConv || activeConv.messages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No messages in this supplier thread yet.</p>
                <p className="mt-1">Send an RFQ inquiry or record an internal note below.</p>
              </div>
            ) : (
              activeConv.messages.map((m) => {
                const isMe = m.senderRole === 'Procurement Specialist';
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex flex-col',
                      m.isInternalNote ? 'items-center my-3' : isMe ? 'items-end' : 'items-start'
                    )}
                  >
                    {m.isInternalNote ? (
                      /* Internal Confidential Note Badge & Card */
                      <div className="w-full max-w-lg p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs shadow-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-amber-800">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> Internal Procurement Note (Confidential)
                          </span>
                          <span className="text-[10px] text-amber-600 font-normal">
                            {m.timestamp.replace('T', ' ').slice(0, 16)}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{m.message}</p>
                        <span className="text-[10px] text-slate-500 block">Logged by {m.sender}</span>
                      </div>
                    ) : (
                      /* Standard Message Bubble */
                      <div
                        className={cn(
                          'max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs',
                          isMe
                            ? 'bg-brand-blue text-white rounded-br-none'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                          <span className="font-bold">{m.sender}</span>
                          <span>{m.timestamp.replace('T', ' ').slice(11, 16)}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box & Mode Toggle */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-2">
            {/* Toggle internal note vs message */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternalNote(false)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition-colors',
                    !isInternalNote
                      ? 'bg-brand-blue text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  Supplier Message (EDI/Email)
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalNote(true)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1',
                    isInternalNote
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <Shield className="w-3 h-3" />
                  Internal Note Only
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {isInternalNote
                  ? '🔒 Visible only to internal procurement staff'
                  : '✉️ Will transmit to supplier representative'}
              </span>
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isInternalNote
                    ? 'Write internal confidential note for team records...'
                    : `Message ${activeSupplier?.name || 'supplier'}...`
                }
                className={cn(
                  'flex-1 text-xs border rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none',
                  isInternalNote
                    ? 'bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-brand-blue/20'
                )}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={cn(
                  'text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md',
                  isInternalNote
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : 'btn-red-polished shadow-brand-red/30'
                )}
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupplierCommunicationsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading communications...</div>}>
      <SupplierCommunicationsContent />
    </Suspense>
  );
}
