'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Plus,
  FileText,
  Upload,
  Calendar,
  Building2,
  Car,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementDocumentItem } from '@/types/procurement';

export default function ProcurementDocumentsPage() {
  const [docs, setDocs] = useState<ProcurementDocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<any>('Supplier Quote');
  const [newReqRef, setNewReqRef] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

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
    'Inspection Certificate',
    'Customer Specification',
  ];

  const filteredDocs = docs.filter((d) => {
    if (selectedType !== 'All' && d.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        (d.supplierName && d.supplierName.toLowerCase().includes(q)) ||
        (d.requestRef && d.requestRef.toLowerCase().includes(q)) ||
        (d.poNumber && d.poNumber.toLowerCase().includes(q)) ||
        d.uploadedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    procurementService.uploadDocument({
      title: newTitle,
      type: newType,
      requestRef: newReqRef || 'PR-10048',
      supplierName: newSupplier || 'Tokyo Auto Spares',
      fileSize: '450 KB',
      fileFormat: 'PDF',
      downloadUrl: '#',
      isInternalOnly: false,
    });

    setUploadModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Universal Procurement Documents Repository
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filteredDocs.length} Total Files
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central repository filtered by Request, Purchase Order, Supplier, Document Type, and Uploaded By
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      {/* 2. Filters Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename, request ref, vendor, uploaded by..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Document Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
          >
            {documentTypes.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Request / PO</th>
                <th className="py-3 px-4">Supplier / Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Uploaded By</th>
                <th className="py-3 px-3 text-center">Format / Size</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {doc.title}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-brand-blue">
                    {doc.poNumber || doc.requestRef || 'General'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {doc.supplierName || doc.customerName || 'Autohub'}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{doc.date}</td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">{doc.uploadedBy}</td>
                  <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                    {doc.fileFormat} • {doc.fileSize}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-brand-blue font-bold hover:underline inline-flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-slide-up my-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Upload Procurement Document</h2>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Document Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Export Packing Certificate - Nagoya"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Category Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                >
                  <option value="Supplier Quote">Supplier Quote</option>
                  <option value="Supplier Invoice">Supplier Invoice</option>
                  <option value="Purchase Order">Purchase Order</option>
                  <option value="Packing Document">Packing Document</option>
                  <option value="Freight Document">Freight Document</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Request Ref</label>
                  <input
                    type="text"
                    value={newReqRef}
                    onChange={(e) => setNewReqRef(e.target.value)}
                    placeholder="PR-10048"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="Tokyo Auto Spares"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-red-polished text-white font-bold px-4 py-1.5 rounded-lg"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
