'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, AlertTriangle, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, ExceptionType, ExceptionSeverity } from '@/types/procurement';

export interface ReportExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRequestId?: string;
}

export function ReportExceptionModal({ isOpen, onClose, defaultRequestId }: ReportExceptionModalProps) {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState(defaultRequestId || '');
  const [type, setType] = useState<ExceptionType>('Supplier Delay');
  const [severity, setSeverity] = useState<ExceptionSeverity>('High');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const reqs = procurementService.getRequests();
      setRequests(reqs);
      if (defaultRequestId) {
        setSelectedRequestId(defaultRequestId);
      } else if (reqs.length > 0) {
        setSelectedRequestId(reqs[0].id);
      }
      setTitle('Carrier transit delay reported');
      setDescription('Consignment delayed due to air freight hub backlog.');
      setSuccess(false);
    }
  }, [isOpen, defaultRequestId]);

  if (!isOpen) return null;

  const currentReq = requests.find((r) => r.id === selectedRequestId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReq) return;

    setSubmitting(true);
    const newExc = procurementService.createException({
      title,
      type,
      severity,
      stage: 'Review',
      requestId: currentReq.id,
      requestRef: currentReq.requestNumber,
      supplierName: 'Tokyo Auto Spares Co., Ltd.',
      customerName: currentReq.customerName,
      vehicleSummary: `${currentReq.vehicle.year} ${currentReq.vehicle.make} ${currentReq.vehicle.model}`,
      partSummary: currentReq.part.name,
      description,
      assignedTo: procurementService.getCurrentUser().name,
    });

    setCreatedCode(newExc.code);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slide-up my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-brand-red flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Log Procurement Exception
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Flag supplier delays, discrepancies, damages, or shipping issues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-100 text-brand-red flex items-center justify-center animate-scale-in">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Exception {createdCode} Logged!</h3>
            <p className="text-sm text-slate-600 max-w-sm">
              The issue has been registered on the procurement exceptions board for active resolution.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Request Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Affected Request *
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:outline-none"
                required
              >
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.requestNumber} — {r.customerName} ({r.part.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Exception Type & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Exception Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ExceptionType)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:outline-none"
                  required
                >
                  <option value="Supplier Delay">Supplier Delay</option>
                  <option value="Supplier Cancellation">Supplier Cancellation</option>
                  <option value="Part Unavailable">Part Unavailable</option>
                  <option value="Wrong Part">Wrong Part</option>
                  <option value="Damaged Part">Damaged Part</option>
                  <option value="Quantity Mismatch">Quantity Mismatch</option>
                  <option value="Shipping Delay">Shipping Delay</option>
                  <option value="Documentation Issue">Documentation Issue</option>
                  <option value="Customs Issue">Customs Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ExceptionSeverity)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:outline-none"
                  required
                >
                  <option value="Critical">Critical (Immediate Escalation)</option>
                  <option value="High">High (Fleet / Urgent Order)</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Summary Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flight connection missed in Tokyo Narita"
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Investigation & Situation Details *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail supplier response, affected transit legs, proposed workaround..."
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red focus:outline-none"
                required
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-red hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-brand-red/30 transition-all"
              >
                {submitting ? 'Registering...' : 'Log & Assign Exception'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
