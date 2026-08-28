'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FolderOpen,
  Search,
  Filter,
  Download,
  FileText,
  Building2,
  Calendar,
  Eye,
  Plus,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementDocumentItem } from '@/types/procurement';

export default function SupplierDocumentsPage() {
  const [docs, setDocs] = useState<ProcurementDocumentItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setDocs(procurementService.getDocuments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const documentTypes = [
    'All',
    'Supplier Quote',
    'Supplier Invoice',
    'Purchase Order',
    'Supplier Confirmation',
    'Packing Document',
    'Freight Document',
  ];

  const filteredDocs = docs.filter((d) => {
    if (selectedType !== 'All' && d.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        (d.supplierName && d.supplierName.toLowerCase().includes(q)) ||
        (d.requestRef && d.requestRef.toLowerCase().includes(q)) ||
        (d.poNumber && d.poNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supplier Documents & Commercial Invoices
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filteredDocs.length} Documents
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supplier Quotes, Invoices, Purchase Orders, Packing Declarations, and International Freight Documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/documents"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            Universal Document Hub →
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {documentTypes.map((dt) => (
          <button
            key={dt}
            onClick={() => setSelectedType(dt)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
              selectedType === dt
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {dt}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by supplier, title, request, PO#..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                  {doc.type}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {doc.fileFormat} • {doc.fileSize}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                {doc.title}
              </h3>

              <div className="text-xs text-slate-500 space-y-0.5">
                {doc.supplierName && <p>Supplier: <strong className="text-slate-800">{doc.supplierName}</strong></p>}
                {doc.requestRef && <p>Ref: <strong className="text-slate-700">{doc.requestRef}</strong></p>}
                {doc.poNumber && <p>PO: <strong className="text-brand-blue">{doc.poNumber}</strong></p>}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">{doc.date}</span>
              <button className="text-brand-blue font-bold hover:underline flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
