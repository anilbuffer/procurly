'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { X, Download, Printer, CheckCircle, FileText, Building2 } from 'lucide-react';
import { PurchaseOrderItem } from '@/types/procurement';

export interface POPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrderItem | null;
}

export function POPreviewModal({ isOpen, onClose, po }: POPreviewModalProps) {
  if (!isOpen || !po) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-slide-up my-8 flex flex-col max-h-[90vh]">
        {/* Modal Top Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              {po.poNumber}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Official Purchase Order Specification
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Purchase Order Body */}
        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar text-slate-900 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-950">
                  PROCUR<span className="text-brand-red">ly</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                  by Autohub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Autohub Procurement & Global Sourcing Division
              </p>
              <p className="text-xs text-slate-500">
                12 Verissimo Drive, Mangere, Auckland 2022, New Zealand
              </p>
              <p className="text-xs text-slate-500">
                NZBN: 9429038291048 • Tel: +64 9 275 8800
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                PURCHASE ORDER
              </h2>
              <p className="text-sm font-bold text-brand-blue font-mono mt-1">
                {po.poNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date: <span className="font-semibold text-slate-800">{po.createdAt.split('T')[0]}</span>
              </p>
              <p className="text-xs text-slate-500">
                Ref Request: <span className="font-semibold text-slate-800">{po.requestRef}</span>
              </p>
            </div>
          </div>

          {/* Supplier & Delivery Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                VENDOR / SUPPLIER
              </p>
              <p className="text-sm font-bold text-slate-900">{po.supplierName}</p>
              <p className="text-slate-600 mt-0.5">Attn: {po.supplierContact}</p>
              <p className="text-slate-600">Email: {po.supplierEmail}</p>
              <p className="text-slate-600 font-medium mt-1">
                Terms: {po.paymentTerms}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                DELIVERY DESTINATION / HUB
              </p>
              <p className="text-sm font-bold text-slate-900">{po.deliveryHub}</p>
              <p className="text-slate-600 mt-0.5">{po.deliveryAddress}</p>
              <p className="text-slate-600 font-medium mt-1">
                Target Dispatch: <span className="font-bold text-emerald-700">{po.expectedDispatchDate}</span>
              </p>
              <p className="text-slate-600 font-medium">
                Incoterms: {po.shippingTerms}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item / Description</th>
                  <th className="py-2.5 px-3">Part #</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price (NZD)</th>
                  <th className="py-2.5 px-3 text-right">Total (NZD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{po.partName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Vehicle: {po.vehicleSummary}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {po.partNumber || 'OEM Standard'}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">{po.quantity}</td>
                  <td className="py-3 px-3 text-right font-medium">
                    ${po.unitPriceNZD.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ${(po.unitPriceNZD * po.quantity).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 font-medium text-slate-600">
                    International Supplier Freight to Auckland Hub
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    ${po.freightCostNZD.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-xs border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right text-slate-700 uppercase tracking-wider">
                    Total Purchase Order Amount (NZD):
                  </td>
                  <td className="py-3 px-3 text-right text-sm text-brand-blue font-black">
                    ${po.totalAmountNZD.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes & Authorizations */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              Handling & Quality Compliance Notice
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {po.notes ||
                'All goods must be inspected for physical fitment integrity prior to packaging. Include commercial invoice, packing declaration, and bill of lading referencing this PO number.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Authorized By:</p>
              <p className="font-bold text-slate-900 mt-4 border-b border-slate-300 pb-1">
                Sarah Wilson — Senior Procurement Specialist
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Autohub Operations Management</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Supplier Confirmation:</p>
              <p className="font-semibold text-slate-700 mt-4 border-b border-slate-300 pb-1">
                {po.status === 'Ordered' || po.status === 'Supplier Confirmed'
                  ? `Confirmed by ${po.supplierContact} • EDI Logged`
                  : 'Pending Supplier Acknowledgment'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Binding Supplier Execution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
