'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  PlusCircle,
  ClipboardList,
  Building2,
  FileText,
  Receipt,
  ShoppingCart,
  Truck,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationsStaffUser } from '@/types/operations';
import { cn } from '@/lib/utils';

export interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCreateModal({ isOpen, onClose }: QuickCreateModalProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(operationsService.getCurrentUser());
    const handleUpdate = () => setCurrentUser(operationsService.getCurrentUser());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  // Quick Request state
  const [reqCustomer, setReqCustomer] = useState('cust_autocare');
  const [reqMake, setReqMake] = useState('Toyota');
  const [reqModel, setReqModel] = useState('Hiace');
  const [reqYear, setReqYear] = useState('2021');
  const [reqVin, setReqVin] = useState('');
  const [reqPartName, setReqPartName] = useState('');
  const [reqPriority, setReqPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  // Quick Note state
  const [noteReqRef, setNoteReqRef] = useState('AH-P-000123');
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPartName.trim()) return;

    const custs = operationsService.getCustomers();
    const selectedCust = custs.find((c) => c.id === reqCustomer) || custs[0];

    const newReq = operationsService.createRequest({
      customerName: selectedCust.businessName,
      customerId: selectedCust.id,
      customerEmail: selectedCust.primaryContact.email,
      customerPhone: selectedCust.primaryContact.phone,
      deliveryBranch: selectedCust.branches[0]?.name || 'Main Workshop',
      priority: reqPriority,
      vehicle: {
        vin: reqVin || 'VIN-PENDING',
        year: Number(reqYear) || 2021,
        make: reqMake,
        model: reqModel,
      },
      part: {
        name: reqPartName,
        quantity: 1,
        qualityPreference: 'Genuine OEM',
        conditionPreference: 'New',
        vehicleSide: 'Front',
      },
    });

    onClose();
    router.push(`/operations/requests/${newReq.referenceNumber}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    operationsService.addMessage(noteReqRef, noteText, true);
    onClose();
    router.push(`/operations/requests/${noteReqRef}`);
  };

  const createOptions = [
    {
      id: 'nzpost_pickup',
      label: 'Schedule NZ Post Pickup',
      description: 'Book courier pickup consignment for NZ Post / CourierPost',
      icon: Truck,
      color: 'bg-red-50 text-[#ed2025] border-red-200',
      allowed: true,
      action: () => {
        onClose();
        router.push('/operations/dashboard#nzpost-tracking');
      },
    },
    {
      id: 'logistics_exception',
      label: 'Log Logistics Exception',
      description: 'Flag cargo delay, transit damage, or biosecurity hold',
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      allowed: true,
      action: () => {
        onClose();
        router.push('/operations/exceptions');
      },
    },
    {
      id: 'dispatch_shipment',
      label: 'Update Delivery Status',
      description: 'Update tracking milestone and customer delivery state',
      icon: ClipboardList,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      allowed: true,
      action: () => {
        onClose();
        router.push('/operations/shipments');
      },
    },
    {
      id: 'internal_note',
      label: 'Internal Operational Note',
      description: 'Record internal logistics note or dispatch instruction',
      icon: MessageSquare,
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      allowed: true,
      action: () => setActiveForm('note'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ed2025] text-white flex items-center justify-center font-black">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {activeForm === 'request'
                  ? 'Create New Procurement Request'
                  : activeForm === 'note'
                  ? 'Add Internal Operational Note'
                  : 'Quick Operational Actions'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeForm
                  ? 'Fill details to submit action immediately'
                  : `Role: ${currentUser.roleTitle} (${currentUser.name})`}
              </p>
            </div>
          </div>
          <button
            onClick={activeForm ? () => setActiveForm(null) : onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {/* Main Selection View */}
          {!activeForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {createOptions.map((opt) => {
                const Icon = opt.icon;
                if (!opt.allowed) return null;

                return (
                  <button
                    key={opt.id}
                    onClick={opt.action}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#ed2025] hover:bg-red-50/40 transition-all text-left group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn('p-2 rounded-xl border shrink-0', opt.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-900 group-hover:text-[#ed2025]">
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Form: New Request */}
          {activeForm === 'request' && (
            <form onSubmit={handleCreateRequest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
                <select
                  value={reqCustomer}
                  onChange={(e) => setReqCustomer(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                >
                  <option value="cust_autocare">AutoCare Auckland Limited (Penrose)</option>
                  <option value="cust_central">Central Motors Wellington Ltd</option>
                  <option value="cust_west">West Auto Commercial Group Ltd</option>
                  <option value="cust_northshore">North Shore European Specialist Ltd</option>
                  <option value="cust_wellington">Wellington Commercial Motors Ltd</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={reqYear}
                    onChange={(e) => setReqYear(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    value={reqMake}
                    onChange={(e) => setReqMake(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={reqModel}
                    onChange={(e) => setReqModel(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  VIN / Chassis Number (Optional)
                </label>
                <input
                  type="text"
                  value={reqVin}
                  onChange={(e) => setReqVin(e.target.value)}
                  placeholder="e.g. TRH200-0198421"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Part Description *</label>
                <input
                  type="text"
                  required
                  value={reqPartName}
                  onChange={(e) => setReqPartName(e.target.value)}
                  placeholder="e.g. Left Front Lower Control Arm Assembly"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                <div className="flex items-center gap-2">
                  {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setReqPriority(p)}
                      className={cn(
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all',
                        reqPriority === p
                          ? p === 'Urgent'
                            ? 'bg-red-500 text-white border-red-600'
                            : p === 'High'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-[#ed2025] text-white border-[#ed2025]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ed2025] hover:bg-[#d3181d] text-white transition-all shadow-sm"
                >
                  Create & Open Request →
                </button>
              </div>
            </form>
          )}

          {/* Form: Internal Note */}
          {activeForm === 'note' && (
            <form onSubmit={handleAddNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Request</label>
                <select
                  value={noteReqRef}
                  onChange={(e) => setNoteReqRef(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                >
                  <option value="AH-P-000123">AH-P-000123 — 2019 Toyota Hiace (Left Front Lower Control Arm)</option>
                  <option value="AH-P-000122">AH-P-000122 — Mazda CX-5 (Headlamp)</option>
                  <option value="AH-P-000121">AH-P-000121 — Ford Ranger (Door Mirror)</option>
                  <option value="AH-P-000118">AH-P-000118 — Toyota Hilux (Turbocharger)</option>
                  <option value="AH-P-000104">AH-P-000104 — Mazda CX-5 (Tailgate)</option>
                  <option value="AH-P-000108">AH-P-000108 — Hyundai Santa Fe (Booster)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Internal Operational Note:</strong> This note is strictly internal to Autohub staff and will
                  never be exposed to the customer.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note Content *</label>
                <textarea
                  required
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter internal sourcing notes, supplier conversations, or tracking details..."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ed2025] hover:bg-[#d3181d] text-white transition-all shadow-sm"
                >
                  Save Internal Note
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
