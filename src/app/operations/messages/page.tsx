'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Lock,
  Send,
  User,
  AlertCircle,
  Building2,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function OperationsMessagesPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>('req_000123');
  const [composerText, setComposerText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const loadData = () => {
    setRequests(operationsService.getRequests());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const activeRequest = requests.find((r) => r.id === selectedReqId) || requests[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || !activeRequest) return;

    operationsService.addMessage(activeRequest.id, composerText.trim(), isInternalNote);
    setComposerText('');
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Communication Centre</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Request-centric customer messaging and internal operational notes.
          </p>
        </div>
      </div>

      {/* Split Pane: Conversations on Left, Thread on Right */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
        {/* Left: Conversation List */}
        <div className="border-r border-slate-200 bg-slate-50/50 flex flex-col">
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
              Active Request Threads
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 custom-scrollbar">
            {requests.map((req) => {
              const isSelected = req.id === activeRequest?.id;
              const hasNotes = req.messages?.some((m) => m.isInternalOnly);

              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={cn(
                    'w-full p-3.5 text-left transition-colors flex items-start justify-between gap-2',
                    isSelected ? 'bg-white font-bold border-l-4 border-[#2B4499] shadow-xs' : 'hover:bg-slate-100/80'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-black text-[#2B4499]">{req.referenceNumber}</span>
                      <span className="text-[10px] text-slate-400 truncate font-semibold">{req.customerName}</span>
                    </div>
                    <p className="text-xs text-slate-800 truncate font-medium">
                      {req.vehicle.make} {req.vehicle.model} · {req.part.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {req.messages?.length || 0} messages {hasNotes ? '· (Contains internal notes)' : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Message Thread */}
        <div className="lg:col-span-2 flex flex-col h-full bg-white">
          {activeRequest ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{activeRequest.referenceNumber}</span>
                    <span className="text-xs font-bold text-slate-600">
                      {activeRequest.vehicle.year} {activeRequest.vehicle.make} {activeRequest.vehicle.model}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2B4499] border border-blue-200">
                      {activeRequest.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: <strong className="text-slate-800">{activeRequest.customerName}</strong>
                  </p>
                </div>

                <Link
                  href={`/operations/requests/${activeRequest.referenceNumber}`}
                  className="text-xs font-bold text-[#2B4499] hover:underline"
                >
                  Open Request Workspace →
                </Link>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 custom-scrollbar">
                {(!activeRequest.messages || activeRequest.messages.length === 0) ? (
                  <p className="py-12 text-center text-xs text-slate-400">
                    No messages or notes logged yet. Use the composer below to contact the customer or add an internal note.
                  </p>
                ) : (
                  activeRequest.messages.map((msg) => {
                    const isInternal = msg.isInternalOnly;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-4 rounded-2xl border text-xs space-y-1.5',
                          isInternal
                            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30'
                            : msg.authorRole === 'Customer'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-blue-50/40 border-blue-200'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{msg.authorName}</span>
                            <span
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0.2 rounded',
                                msg.authorRole === 'Customer' ? 'bg-slate-200 text-slate-700' : 'bg-[#ed2025] text-white'
                              )}
                            >
                              {msg.authorRole}
                            </span>
                            {isInternal && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                                Internal — Not visible to customer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                        </div>
                        <p className={cn('text-xs leading-relaxed', isInternal ? 'text-amber-950 font-medium' : 'text-slate-800')}>
                          {msg.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Thread Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(false)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                        !isInternalNote
                          ? 'bg-[#ed2025] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      Customer Visible Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(true)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                        isInternalNote
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      )}
                    >
                      Internal Note (Staff Only)
                    </button>
                  </div>

                  {isInternalNote && (
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confidential Staff Note</span>
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? 'Type internal operational note...'
                      : `Send message to ${activeRequest.customerName}...`
                  }
                  className={cn(
                    'w-full text-xs font-medium rounded-xl p-3 focus:outline-none focus:ring-2 transition-all',
                    isInternalNote
                      ? 'bg-amber-50/50 border border-amber-300 focus:ring-amber-500'
                      : 'bg-white border border-slate-200 focus:ring-[#ed2025]'
                  )}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={cn(
                      'px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5',
                      isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#ed2025] hover:bg-[#d3181d]'
                    )}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalNote ? 'Save Internal Note' : 'Send to Customer'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">Select a request thread on the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}
