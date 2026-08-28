'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Eye,
  Plus,
  Filter,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest, OperationalDocument } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function DocumentsManagementPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<OperationalDocument | null>(null);

  useEffect(() => {
    setRequests(operationsService.getRequests());
    const handleUpdate = () => setRequests(operationsService.getRequests());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const allDocuments: OperationalDocument[] = [];
  requests.forEach((r) => {
    (r.documents || []).forEach((d) => allDocuments.push(d));
  });

  const categories = [
    'All',
    'Customer Quotes',
    'Supplier Quotes',
    'Invoices',
    'Payment Receipts',
    'Shipping Documents',
    'Customer Attachments',
  ];

  const filteredDocs = allDocuments.filter((d) => {
    if (selectedCategory !== 'All' && d.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.requestNumber.toLowerCase().includes(q) ||
        (d.customerName && d.customerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 46. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Document Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Central repository for quotations, supplier agreements, tax invoices, and shipping waybills.
          </p>
        </div>

        <button
          onClick={() => alert('Document upload modal initiated')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-[#ed2025] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name, request #, customer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#2B4499] hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2B4499] border border-blue-200">
                  {doc.category}
                </span>
                {doc.isInternalOnly && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Internal</span>
                  </span>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-900 leading-snug truncate" title={doc.title}>
                {doc.title}
              </h3>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p>
                  Related Request:{' '}
                  <Link href={`/operations/requests/${doc.requestNumber}`} className="font-bold text-[#2B4499]">
                    {doc.requestNumber}
                  </Link>
                </p>
                <p>
                  Format: <strong>{doc.fileFormat}</strong> · Size: {doc.fileSizeFormatted} · Date: {doc.date}
                </p>
                <p>Uploaded by: {doc.uploadedBy}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setPreviewDoc(doc)}
                className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Document</span>
              </button>
              <button
                onClick={() => alert(`Downloading ${doc.title}`)}
                className="p-1 text-slate-400 hover:text-slate-700"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setPreviewDoc(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-blue-300 uppercase font-bold">{previewDoc.category}</span>
                <h3 className="text-sm font-bold truncate">{previewDoc.title}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white ml-2">
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-50 overflow-y-auto space-y-3 text-center">
              <FileText className="w-12 h-12 text-[#2B4499] mx-auto opacity-70" />
              <p className="font-bold text-slate-900 text-sm">{previewDoc.title}</p>
              <p className="text-slate-500 text-xs">
                Request: {previewDoc.requestNumber} · {previewDoc.fileSizeFormatted} · Uploaded by {previewDoc.uploadedBy}
              </p>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-600 text-left space-y-2">
                <p>
                  <strong>Document Metadata:</strong> Validated digital certificate attached.
                </p>
                <p>
                  <strong>Security Level:</strong> {previewDoc.isInternalOnly ? 'Confidential Internal' : 'Customer Authorized'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 text-right flex justify-end gap-2">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold">
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${previewDoc.title}`);
                  setPreviewDoc(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
