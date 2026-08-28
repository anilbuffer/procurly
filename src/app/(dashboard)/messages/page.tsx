'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { PartRequest, ChatMessage } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  X,
  FileText,
  User,
  Building2,
  ShieldCheck,
  PhoneCall,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default function MessagesPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [attachments, setAttachments] = useState<
    { name: string; size: string; type: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await requestsService.getRequests();
      setRequests(data);
      if (data.length > 0 && !selectedRequestId) {
        setSelectedRequestId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const handleUpdate = () => loadRequests();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
    };
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && attachments.length === 0) return;
    if (!selectedRequest) return;

    try {
      await requestsService.sendMessage(
        selectedRequest.id,
        chatInput.trim() || 'Attached supporting documents.',
        attachments.length > 0 ? attachments : undefined
      );
      setChatInput('');
      setAttachments([]);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(0)} KB`,
        type: f.type,
      }));
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.referenceNumber.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.vehicle.make.toLowerCase().includes(q) ||
      r.vehicle.model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Communicate directly with Autohub about your procurement requests.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Autohub Dedicated Parts Desk Online</span>
        </div>
      </div>

      {/* Main Messaging Interface (Two-Column Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Col (4 cols): Conversations List */}
        <div className={`lg:col-span-4 border-r border-slate-200 flex flex-col ${selectedRequestId ? 'hidden lg:flex' : 'flex'}`}>
          {/* Conversation Search Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar max-h-[550px] lg:max-h-none">
            {filteredRequests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              const lastMsg = req.messages && req.messages.length > 0 ? req.messages[req.messages.length - 1] : null;
              const isUnread = req.referenceNumber === 'AH-P-000123';

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-[#ed2025]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-black text-slate-900">{req.referenceNumber}</span>
                    {isUnread && (
                      <span className="w-5 h-5 rounded-full bg-[#ed2025] text-white text-[10px] font-bold flex items-center justify-center">
                        2
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {req.vehicle.make} {req.vehicle.model} · {req.parts[0]?.name || req.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : 'No messages yet.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (8 cols): Active Chat Thread & Composer */}
        {selectedRequest ? (
          <div className={`lg:col-span-8 flex flex-col h-full bg-slate-50/30 ${!selectedRequestId ? 'hidden lg:flex' : 'flex'}`}>
            {/* Thread Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRequestId('')}
                  className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
                >
                  ← All Chats
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {selectedRequest.referenceNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                    </span>
                    <Badge variant="status" status={selectedRequest.status} dot={true} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 truncate max-w-xs sm:max-w-md">
                    {selectedRequest.parts[0]?.name || selectedRequest.title}
                  </p>
                </div>
              </div>

              <Link href={`/requests/${selectedRequest.id}`}>
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  View Details →
                </Button>
              </Link>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              {/* Security Privacy Notice */}
              <div className="text-center py-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Customer-Visible Communication Channel • End-to-End Logged
                </span>
              </div>

              {selectedRequest.messages && selectedRequest.messages.length > 0 ? (
                selectedRequest.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed space-y-1.5 ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                          : 'bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-subtle'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[10px] font-bold ${m.sender === 'user' ? 'text-red-300' : 'text-brand-blue'}`}>
                          {m.senderName}
                        </p>
                        <span className="text-[9px] opacity-60 font-mono">{m.timestamp}</span>
                      </div>
                      <p className="text-xs">{m.text}</p>

                      {/* Attachments Chips if present */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/40 space-y-1">
                          {m.attachments.map((att, aIdx) => (
                            <div
                              key={aIdx}
                              className={`p-1.5 rounded-lg text-[10px] flex items-center gap-1.5 ${
                                m.sender === 'user' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span className="font-semibold truncate">{att.name}</span>
                              <span className="opacity-60">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No message history yet</p>
                  <p className="text-[11px] text-slate-400">
                    Ask your sourcing specialist anything about fitment, lead times, or documentation.
                  </p>
                </div>
              )}
            </div>

            {/* Attachments Preview if pending */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 bg-white rounded-lg border border-slate-200 text-[10px] flex items-center gap-2 shadow-xs"
                  >
                    <Paperclip className="w-3 h-3 text-brand-blue" />
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Message Composer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <label
                htmlFor="messageAttachmentInput"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                title="Attach Supporting Files (JPG, PNG, PDF)"
              >
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  id="messageAttachmentInput"
                  multiple
                  onChange={handleFileAttach}
                  className="sr-only"
                />
              </label>

              <input
                type="text"
                placeholder="Write a message to Autohub..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">
            Select a conversation to begin messaging.
          </div>
        )}
      </div>
    </div>
  );
}
