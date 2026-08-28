'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DocumentPreviewModal } from '@/components/ui/DocumentPreviewModal';
import { requestsService } from '@/services/requestsService';
import { PortalDocument } from '@/types';
import {
  FileText,
  Search,
  Download,
  Eye,
  FileCheck,
  Receipt,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<PortalDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'All',
    'Quotes',
    'Invoices',
    'Payment Receipts',
    'Procurement Documents',
    'Shipping Documents',
  ];

  const loadDocuments = async () => {
    try {
      const data = await requestsService.getDocuments(activeCategory, searchQuery);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    const handleUpdate = () => loadDocuments();
    window.addEventListener('procurly_data_updated', handleUpdate);
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, [activeCategory, searchQuery]);

  const handleView = (doc: PortalDocument) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  const handleDownload = (doc: PortalDocument) => {
    const element = window.document.createElement('a');
    const file = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_')}.pdf`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Documents</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official trade quotations, tax invoices, MPI biosecurity certificates, and payment receipts.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents or request ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs & Document List */}
      <Card className="shadow-card border border-slate-200">
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#ed2025] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <p className="text-sm font-bold text-slate-800">No documents found</p>
              <p className="text-xs text-slate-400">No records found for this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 font-sans">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded">
                          {doc.fileFormat}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Ref: <strong className="font-mono text-slate-700">{doc.requestNumber}</strong></span>
                        <span>•</span>
                        <span>{doc.date}</span>
                        <span>•</span>
                        <span>{doc.fileSizeFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View & Download */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Printable Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={selectedDoc}
      />
    </div>
  );
}
