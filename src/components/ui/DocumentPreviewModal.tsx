'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PortalDocument } from '@/types';
import { formatNZD } from '@/lib/utils';
import { Printer, Download, FileText, CheckCircle2, ShieldCheck, Box } from 'lucide-react';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PortalDocument | null;
}

export function DocumentPreviewModal({ isOpen, onClose, document }: DocumentPreviewModalProps) {
  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simulated PDF download
    const element = window.document.createElement('a');
    const file = new Blob([JSON.stringify(document, null, 2)], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}.pdf`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" title={document.title}>
      <div className="space-y-6">
        {/* Document Header Bar */}
        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileText className="w-4 h-4 text-brand-blue" />
            <span>Document Ref: {document.requestNumber}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{document.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Document Paper Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-6 text-slate-900 font-sans">
          {/* Top Brand Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ed2025] to-[#b31317] flex items-center justify-center text-white font-black text-xl shadow-md">
                <Box className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">PROCURly</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  by Autohub New Zealand
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600">
              <p className="font-bold text-slate-900 uppercase">{document.documentType}</p>
              <p className="font-mono text-[11px] font-semibold text-brand-blue">
                {document.previewData?.quoteNumber || document.previewData?.invoiceNumber || `DOC-${document.requestNumber}`}
              </p>
              <p className="text-[11px] text-slate-500">Date: {document.date}</p>
              <p className="text-[11px] text-slate-500">GST Number: 128-492-910</p>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Issued By:
              </span>
              <p className="font-bold text-slate-900">Autohub New Zealand Logistics Ltd</p>
              <p className="text-slate-600">142 Neilson St, Penrose, Auckland 1061</p>
              <p className="text-slate-600">Direct Desk: 0800 288 6482 / 09 525 6800</p>
              <p className="text-slate-600">Email: procurement@procurly.autohub.co.nz</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Customer / Consignee:
              </span>
              <p className="font-bold text-slate-900">{document.previewData?.customerName || 'AutoCare Auckland'}</p>
              <p className="text-slate-600">12 Example Street, Penrose, Auckland 1061</p>
              <p className="text-slate-600">NZBN: 9429041234567 • Trade Account Approved</p>
              <p className="text-slate-600">Contact: James Wilson</p>
            </div>
          </div>

          {/* Vehicle & Consignment Info */}
          {document.previewData && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-blue block">Vehicle Spec:</span>
                <span className="font-bold text-slate-900">{document.previewData.vehicleDetails}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase text-brand-blue block">Part Specification:</span>
                <span className="font-semibold text-slate-800">{document.previewData.partDetails}</span>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price (NZD)</th>
                  <th className="px-4 py-3 text-right">Total (NZD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {document.previewData?.items ? (
                  document.previewData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.desc}</td>
                      <td className="px-4 py-3 text-center text-slate-700">{item.qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{formatNZD(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{formatNZD(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">{document.title}</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right font-mono">--</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">--</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          {document.previewData && (
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Landed):</span>
                  <span className="font-mono font-semibold">{formatNZD(document.previewData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>NZ GST (15% Included):</span>
                  <span className="font-mono font-semibold">Inclusive</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount (NZD):</span>
                  <span className="font-mono text-base text-[#ed2025]">{formatNZD(document.previewData.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Guarantee & Terms Note */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">100% Fitment Certified Guarantee by Autohub</p>
              <p className="text-[11px] text-emerald-700">
                Verified against official factory EPC parts schematics and chassis VIN specifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
