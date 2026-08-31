'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  ArrowLeft,
  User,
  Car,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Truck,
  MessageSquare,
  History,
  Shield,
  ShieldCheck,
  Plus,
  Send,
  Eye,
  Edit,
  ExternalLink,
  ChevronRight,
  MapPin,
  RefreshCw,
  PlusCircle,
  Building2,
  Lock,
  Download,
  Check,
  AlertCircle,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import {
  OperationalPartRequest,
  SupplierQuote,
  LandedCostCalculation,
  OperationsStaffUser,
  OperationalMessage,
  OperationalDocument,
} from '@/types/operations';
import { StatusChangeModal } from '@/components/operations/layout/StatusChangeModal';
import { EndToEndFlowNavigator } from '@/components/ui/EndToEndFlowNavigator';
import { cn } from '@/lib/utils';

export default function RequestDetailWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const idOrRef = (params?.id as string) || 'AH-P-000123';
  const initialTab = searchParams.get('tab') || 'overview';

  const [request, setRequest] = useState<OperationalPartRequest | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [staffUsers, setStaffUsers] = useState<OperationsStaffUser[]>(operationsService.getStaffUsers());
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddSupplierQuoteOpen, setIsAddSupplierQuoteOpen] = useState(false);
  const [isQuotePreviewOpen, setIsQuotePreviewOpen] = useState(false);
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState<OperationalDocument | null>(null);

  // Message & Note Composer state
  const [composerText, setComposerText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Landed Cost Live Inputs (for Tab 4)
  const [supplierCostInput, setSupplierCostInput] = useState(280);
  const [supplierFreightInput, setSupplierFreightInput] = useState(70);
  const [handlingInput, setHandlingInput] = useState(20);
  const [otherInput, setOtherInput] = useState(15);
  const [marginInput, setMarginInput] = useState(50);
  const [marginPercentInput, setMarginPercentInput] = useState(13);

  // Add Supplier Quote Form State
  const [newSupName, setNewSupName] = useState('');
  const [newSupPartCost, setNewSupPartCost] = useState('');
  const [newSupFreight, setNewSupFreight] = useState('');
  const [newSupAvailability, setNewSupAvailability] = useState<'In Stock' | '1–3 Days' | '4–7 Days' | 'Backorder'>('In Stock');
  const [newSupNotes, setNewSupNotes] = useState('');

  const loadData = () => {
    const req = operationsService.getRequestById(idOrRef);
    if (req) {
      setRequest(req);
      if (req.landedCost) {
        setSupplierCostInput(req.landedCost.supplierCostNZD);
        setSupplierFreightInput(req.landedCost.supplierFreightNZD);
        setHandlingInput(req.landedCost.handlingCostNZD);
        setOtherInput(req.landedCost.otherCostsNZD);
        setMarginInput(req.landedCost.marginAmountNZD);
        setMarginPercentInput(req.landedCost.marginPercentage);
      }
    }
    setCurrentUser(operationsService.getCurrentUser());
    setStaffUsers(operationsService.getStaffUsers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, [idOrRef]);

  if (!request) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Request Not Found</h2>
        <p className="text-xs text-slate-500">The procurement request &quot;{idOrRef}&quot; could not be located.</p>
        <Link
          href="/operations/requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    );
  }

  // Live calculations for Landed Cost
  const calculatedInternalCost = supplierCostInput + supplierFreightInput + handlingInput + otherInput;
  const calculatedCustomerPrice = calculatedInternalCost + marginInput + 50; // + service

  const handleSelectSupplier = (quoteId: string) => {
    operationsService.selectSupplierQuote(request.id, quoteId);
    loadData();
  };

  const handleSaveSupplierQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupPartCost) return;

    operationsService.addSupplierQuote(request.id, {
      supplierId: `sup_${Date.now()}`,
      supplierName: newSupName,
      supplierCode: newSupName.substring(0, 3).toUpperCase(),
      partDescription: request.part.name,
      partCostNZD: Number(newSupPartCost),
      availability: newSupAvailability,
      estimatedDispatchDays: newSupAvailability === 'In Stock' ? 'Same day' : '3 days',
      supplierFreightNZD: Number(newSupFreight) || 50,
      supplierHandlingNZD: 15,
      totalSupplierCostNZD: Number(newSupPartCost) + (Number(newSupFreight) || 50) + 15,
      notes: newSupNotes,
      validUntil: '2026-09-15',
    });

    setIsAddSupplierQuoteOpen(false);
    setNewSupName('');
    setNewSupPartCost('');
    setNewSupFreight('');
    setNewSupNotes('');
    loadData();
  };

  const handleSendCustomerQuote = () => {
    operationsService.updateLandedCost(request.id, {
      supplierCostNZD: supplierCostInput,
      supplierFreightNZD: supplierFreightInput,
      handlingCostNZD: handlingInput,
      otherCostsNZD: otherInput,
      totalInternalCostNZD: calculatedInternalCost,
      marginAmountNZD: marginInput,
      marginPercentage: Number(((marginInput / calculatedCustomerPrice) * 100).toFixed(1)),
      finalCustomerPriceNZD: calculatedCustomerPrice,
    });

    operationsService.sendCustomerQuote(request.id);
    loadData();
  };

  const handleSimulateApproval = () => {
    operationsService.simulateCustomerApproval(request.id);
    loadData();
  };

  const handleSendMessageOrNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    operationsService.addMessage(request.id, composerText.trim(), isInternalNote);
    setComposerText('');
    loadData();
  };

  const handleAssignOwner = (staffId: string) => {
    operationsService.assignRequestOwner(request.id, staffId);
    setIsAssignModalOpen(false);
    loadData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'vehicle-part', label: 'Vehicle & Part', icon: Car },
    { id: 'supplier-quotes', label: 'Supplier Quotes', icon: DollarSign, badge: request.sourcing?.supplierQuotes?.length },
    { id: 'customer-quote', label: 'Customer Quote', icon: FileText, badge: request.customerQuote ? 'Ready' : undefined },
    { id: 'procurement', label: 'Procurement', icon: Package },
    { id: 'freight', label: 'Freight & Logistics', icon: Truck },
    { id: 'messages', label: 'Messages & Notes', icon: MessageSquare, badge: request.messages?.length },
    { id: 'documents', label: 'Documents', icon: FileText, badge: request.documents?.length },
    { id: 'audit', label: 'Audit History', icon: History },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 0. INTERACTIVE END-TO-END FLOW NAVIGATOR & ROLE SWITCHER */}
      <EndToEndFlowNavigator
        requestId={request.referenceNumber}
        currentStatus={request.status}
        onStatusChanged={loadData}
      />

      {/* 21. Header Workspace Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Link
                href="/operations/requests"
                className="text-xs font-bold text-slate-500 hover:text-[#2B4499] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Requests</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-black text-[#2B4499]">{request.referenceNumber}</span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-[#2B4499] border border-blue-200">
                {request.status}
              </span>
              <span
                className={cn(
                  'text-[10px] font-black px-2 py-0.5 rounded-full border',
                  request.priority === 'Urgent'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : request.priority === 'High'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                )}
              >
                {request.priority} Priority
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {request.vehicle.year} {request.vehicle.make} {request.vehicle.model} · {request.part.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Customer: <span className="font-bold text-slate-800">{request.customerName}</span> · Assigned Owner:{' '}
              <span className="font-bold text-[#2B4499]">{request.ownerName}</span> · Submitted:{' '}
              <span>{request.submittedDate}</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Assign</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('messages');
                setIsInternalNote(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Message Customer</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('messages');
                setIsInternalNote(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>Add Note</span>
            </button>

            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </button>
          </div>
        </div>

        {/* 22. Request Detail Workspace Tabs Navigation */}
        <div className="flex items-center gap-1 border-t border-slate-100 mt-5 pt-3 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-[#ed2025] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB CONTENT AREA --- */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Summary & Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* 23. Request Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2B4499]" />
                <span>Customer & Destination</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Trade Account</span>
                  <p className="font-bold text-slate-900 text-sm">{request.customerName}</p>
                  <p className="text-slate-500 mt-0.5">{request.customerEmail}</p>
                  <p className="text-slate-500">{request.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Delivery Workshop Branch</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2B4499]" />
                    {request.deliveryBranch}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Trade Credit Account (20th Mth)
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle & Part Quick Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#2B4499]" />
                  <span>Vehicle Specifications</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Make / Model</span>
                    <span className="font-bold text-slate-800">{request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">VIN</span>
                    <span className="font-mono font-bold text-slate-800">{request.vehicle.vin}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Registration</span>
                    <span className="font-bold text-slate-800">{request.vehicle.rego || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Engine / Sub-model</span>
                    <span className="font-bold text-slate-800">{request.vehicle.engineCode || request.vehicle.subModel || '2.0L Petrol'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#2B4499]" />
                  <span>Part Details</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Part Description</span>
                    <span className="font-bold text-slate-800">{request.part.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">OEM Number</span>
                    <span className="font-mono font-bold text-slate-800">{request.part.partNumber || '48069-26150'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Quality Preference</span>
                    <span className="font-bold text-blue-700">{request.part.qualityPreference}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Quantity / Condition</span>
                    <span className="font-bold text-slate-800">{request.part.quantity} unit · {request.part.conditionPreference}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: 24. INTERNAL REQUEST TIMELINE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Internal Request Timeline</span>
              <span className="text-[10px] font-bold text-[#2B4499] bg-blue-50 px-2 py-0.5 rounded-full">
                Active Workflow
              </span>
            </h2>

            <div className="space-y-4 flex-1">
              {request.timeline.map((event, idx) => (
                <div key={event.id || idx} className="flex items-start gap-3 relative group">
                  {/* Vertical connector line */}
                  {idx < request.timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-slate-200" />
                  )}

                  {/* Indicator Icon */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 relative z-10',
                      event.isCompleted
                        ? 'bg-emerald-500 text-white'
                        : event.isCurrent
                        ? 'bg-[#ed2025] text-white ring-4 ring-red-100 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    )}
                  >
                    {event.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900">{event.stage}</p>
                      <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{event.action}</p>
                    {event.note && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5 bg-slate-50 p-1 rounded border border-slate-100">
                        &quot;{event.note}&quot;
                      </p>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">by {event.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VEHICLE & PART */}
      {activeTab === 'vehicle-part' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#2B4499]" />
              <span>Full Vehicle Technical Specifications</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">VIN / Chassis</span>
                <span className="font-mono font-bold text-slate-900">{request.vehicle.vin}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Registration</span>
                <span className="font-bold text-slate-900">{request.vehicle.rego || 'NZE412'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Make & Model</span>
                <span className="font-bold text-slate-900">{request.vehicle.year} {request.vehicle.make} {request.vehicle.model}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Engine Code</span>
                <span className="font-bold text-slate-900">{request.vehicle.engineCode || '1TR-FE (2.0L VVT-i)'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Chassis Code</span>
                <span className="font-bold text-slate-900">{request.vehicle.chassisCode || 'TRH200V'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Transmission</span>
                <span className="font-bold text-slate-900">{request.vehicle.transmission || '6-Speed Automatic'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2B4499]" />
              <span>Component Details & Photos</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Component Name</span>
                <span className="text-sm font-black text-slate-900">{request.part.name}</span>
                <p className="text-slate-600 mt-1">{request.part.description || 'Full OEM replacement assembly'}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Vehicle Position</span>
                  <span className="font-bold text-slate-800">{request.part.vehicleSide || 'Left (Passenger)'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Quantity</span>
                  <span className="font-bold text-slate-800">{request.part.quantity} unit</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Condition</span>
                  <span className="font-bold text-emerald-700">{request.part.conditionPreference}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-2">Attached Component Reference Photos:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-32 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                    <img
                      src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=60"
                      alt="Control arm diagram"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[11px] p-2 text-center">
                    <Plus className="w-5 h-5 mb-1" />
                    <span>Upload additional photo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 26. SUPPLIER QUOTES & COMPARISON */}
      {activeTab === 'supplier-quotes' && (
        <div className="space-y-6">
          {/* Security Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black">INTERNAL OPERATIONAL SOURCING WORKSPACE</p>
                <p className="text-[11px] text-slate-400">
                  Supplier pricing and source codes are confidential and never exposed in customer quotes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddSupplierQuoteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Supplier Quote</span>
            </button>
          </div>

          {/* Supplier Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900">Supplier Quote Comparison</h2>
              <span className="text-xs text-slate-500">
                {request.sourcing?.supplierQuotes?.length || 0} quotes received
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-3 text-right">Part Cost</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3 text-right">Freight</th>
                    <th className="py-3 px-3 text-right">Total Landed</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {(!request.sourcing?.supplierQuotes || request.sourcing.supplierQuotes.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No supplier quotes logged yet. Click &quot;+ Add Supplier Quote&quot; to add wholesale rates.
                      </td>
                    </tr>
                  ) : (
                    request.sourcing.supplierQuotes.map((sq) => {
                      const isSelected = sq.isSelected || request.sourcing?.selectedSupplierQuoteId === sq.id;
                      return (
                        <tr
                          key={sq.id}
                          className={cn(
                            'hover:bg-slate-50 transition-colors',
                            isSelected ? 'bg-blue-50/50 font-semibold' : ''
                          )}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>
                              <span>{sq.supplierName}</span>
                              <span className="text-[10px] text-slate-400 font-normal block">
                                Ref: {sq.supplierCode} · Added by {sq.quotedBy}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                            NZ${sq.partCostNZD.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                              {sq.availability} ({sq.estimatedDispatchDays})
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                            NZ${sq.supplierFreightNZD.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-black text-[#2B4499]">
                            NZ${sq.totalSupplierCostNZD.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Selected</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Alternative</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isSelected ? (
                              <span className="text-xs font-bold text-emerald-600">Active Sourcing</span>
                            ) : (
                              <button
                                onClick={() => handleSelectSupplier(sq.id)}
                                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white text-xs font-bold text-slate-700 transition-colors"
                              >
                                Select Supplier
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 28. LANDED COST CALCULATOR & 29. CUSTOMER QUOTE BUILDER */}
      {activeTab === 'customer-quote' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 28. LANDED COST CALCULATOR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Landed Cost Calculator</h2>
                  <p className="text-[11px] text-slate-500">Commercial internal pricing model</p>
                </div>
                <span className="text-[10px] font-black uppercase text-[#2B4499] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  NZD Pricing
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-medium">Supplier Wholesale Cost</label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">NZ$</span>
                    <input
                      type="number"
                      value={supplierCostInput}
                      onChange={(e) => setSupplierCostInput(Number(e.target.value))}
                      className="w-24 p-1.5 text-right font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-medium">Supplier Freight (Origin Hub)</label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">NZ$</span>
                    <input
                      type="number"
                      value={supplierFreightInput}
                      onChange={(e) => setSupplierFreightInput(Number(e.target.value))}
                      className="w-24 p-1.5 text-right font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-medium">Handling & Consumables</label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">NZ$</span>
                    <input
                      type="number"
                      value={handlingInput}
                      onChange={(e) => setHandlingInput(Number(e.target.value))}
                      className="w-24 p-1.5 text-right font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-medium">Other Import Charges / Admin</label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">NZ$</span>
                    <input
                      type="number"
                      value={otherInput}
                      onChange={(e) => setOtherInput(Number(e.target.value))}
                      className="w-24 p-1.5 text-right font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
                  <span className="text-slate-900">Total Internal Cost</span>
                  <span className="font-mono text-sm text-slate-900">NZ${calculatedInternalCost.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[#2B4499] font-bold">Autohub Margin ($)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">NZ$</span>
                      <input
                        type="number"
                        value={marginInput}
                        onChange={(e) => setMarginInput(Number(e.target.value))}
                        className="w-24 p-1.5 text-right font-mono font-black text-[#2B4499] bg-white border border-blue-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-blue-900">
                    <span>Effective Margin %</span>
                    <span className="font-bold font-mono">
                      {((marginInput / calculatedCustomerPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">Final Customer Price</span>
                    <span className="text-[10px] text-slate-500">Includes freight & verified fitment service</span>
                  </div>
                  <span className="font-mono text-xl font-black text-[#2B4499]">
                    NZ${calculatedCustomerPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 29. CUSTOMER QUOTE BUILDER & ACTIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Customer Quote Builder</h2>
                    <p className="text-[11px] text-slate-500">Configure customer breakdown and validity</p>
                  </div>
                  {request.customerQuote?.status && (
                    <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                      Status: {request.customerQuote.status}
                    </span>
                  )}
                </div>

                {/* Breakdown List */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-700 font-medium">Part: {request.part.name}</span>
                    <span className="font-mono font-bold text-slate-900">NZ$350.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-700 font-medium">Freight: Air Freight (5–8 days)</span>
                    <span className="font-mono font-bold text-slate-900">NZ$85.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-700 font-medium">Procurement Service & Import Handling</span>
                    <span className="font-mono font-bold text-slate-900">NZ$50.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Quotation</span>
                    <span className="text-xl font-black">NZ${calculatedCustomerPrice.toFixed(2)}</span>
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">Valid until 15 Sept 2026</span>
                </div>

                {/* 31. Customer Approval Status Record */}
                {request.customerQuote?.acceptanceRecord && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Customer Approval Verified</span>
                    </div>
                    <p className="text-[11px]">
                      Approved by: <strong>{request.customerQuote.acceptanceRecord.acceptedBy}</strong> on{' '}
                      {request.customerQuote.acceptanceRecord.acceptedAt}
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Terms: {request.customerQuote.acceptanceRecord.termsVersion} · Quote Version:{' '}
                      {request.customerQuote.acceptanceRecord.quoteVersion} · Digital Signature Verified
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsQuotePreviewOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Preview Customer View</span>
                </button>

                <div className="flex items-center gap-2">
                  {!request.customerQuote?.acceptanceRecord && (
                    <button
                      onClick={handleSimulateApproval}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition-colors"
                      title="Simulate customer clicking Accept Quote on portal"
                    >
                      Simulate Customer Acceptance
                    </button>
                  )}

                  <button
                    onClick={handleSendCustomerQuote}
                    className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Quote to Customer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 35. PROCUREMENT ORDER WORKSPACE */}
      {activeTab === 'procurement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Procurement Order Summary</h2>
              <p className="text-[11px] text-slate-500">
                Supplier PO Reference: <span className="font-bold text-[#2B4499]">ORD-000123</span>
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#2B4499] border border-blue-200">
              Ordered From Supplier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Supplier</span>
              <p className="text-sm font-black text-slate-900">Tokyo Auto Spares (TAS-JP)</p>
              <p className="text-slate-500 mt-0.5">Yokohama Export Facility</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Expected at Shipping Hub</span>
              <p className="text-sm font-black text-slate-900">30 Aug 2026</p>
              <p className="text-slate-500 mt-0.5">Narita Air Cargo Hub</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">Procurement PO Total</span>
              <p className="text-sm font-black text-[#2B4499]">NZ$370.00</p>
              <p className="text-slate-500 mt-0.5">Includes origin hub freight</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-black text-slate-900">Next Action in Lifecycle:</h4>
            <p className="text-slate-600">
              Awaiting supplier dispatch scan at Tokyo consolidation hub. Once received, advance status to{' '}
              <strong>&ldquo;Received at Shipping Facility&rdquo;</strong> for air freight booking.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-sm transition-colors"
              >
                Advance Procurement Status →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 38. FREIGHT / LOGISTICS & TIMELINE */}
      {activeTab === 'freight' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">SHP-000123 — Air Freight Tracking</h2>
                <p className="text-xs text-slate-500">
                  Carrier: <span className="font-bold text-slate-800">DHL Express</span> · Tracking:{' '}
                  <span className="font-mono font-bold text-[#2B4499]">DHL-NZ-9428-1192</span> · ETA:{' '}
                  <span className="font-bold text-emerald-700">18 September 2026</span>
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                In Transit
              </span>
            </div>

            {/* 38. Shipment Milestone Timeline */}
            <div className="space-y-4">
              {[
                { title: 'Procurement Completed', loc: 'Tokyo Auto Spares Hub', time: '28 Aug 10:10', status: 'completed' },
                { title: 'Received at Shipping Facility', loc: 'Autohub Narita Air Depot', time: '28 Aug 14:00', status: 'completed' },
                { title: 'Dispatched on Flight NZ90', loc: 'Tokyo Narita Airport (NRT)', time: '28 Aug 19:30', status: 'completed' },
                { title: 'In Transit', loc: 'Pacific Trans-Air Cargo Corridor', time: 'In Progress', status: 'in-progress', note: 'Flight en route to Auckland Gateway' },
                { title: 'Arrived in New Zealand', loc: 'Auckland Airport Cargo Terminal', time: 'Pending', status: 'pending' },
                { title: 'Customs & MPI Clearance', loc: 'Auckland Customs Examination Bay', time: 'Pending', status: 'pending' },
                { title: 'Out for Delivery', loc: 'CourierPost Penrose Depot', time: 'Pending', status: 'pending' },
                { title: 'Delivered', loc: 'AutoCare Auckland Workshop', time: 'Pending', status: 'pending' },
              ].map((m, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {idx < 7 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-slate-200" />}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 relative z-10',
                      m.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : m.status === 'in-progress'
                        ? 'bg-[#ed2025] text-white ring-4 ring-red-100 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    )}
                  >
                    {m.status === 'completed' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-900">{m.title}</p>
                      <span className="text-[10px] text-slate-400">{m.time}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{m.loc}</p>
                    {m.note && <p className="text-[10px] text-blue-700 italic mt-0.5">{m.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: 44. MESSAGES & 45. INTERNAL NOTES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Communication & Internal Notes</h2>
              <p className="text-[11px] text-slate-500">
                Customer-facing dialogue and staff-only notes
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600 font-medium">Customer Visible</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" />
              <span className="text-slate-600 font-medium">Internal Only</span>
            </div>
          </div>

          {/* Message Thread */}
          <div className="space-y-3.5 max-h-[450px] overflow-y-auto custom-scrollbar p-1">
            {(!request.messages || request.messages.length === 0) ? (
              <p className="py-6 text-center text-slate-400 text-xs">No messages or notes logged yet.</p>
            ) : (
              request.messages.map((msg) => {
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
                            msg.authorRole === 'Customer'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-[#ed2025] text-white'
                          )}
                        >
                          {msg.authorRole}
                        </span>
                        {/* 45. Internal Note Distinction Banner */}
                        {isInternal && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            Internal — Not visible to customer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <p className={cn('text-xs leading-relaxed', isInternal ? 'text-amber-950 font-medium' : 'text-slate-800')}>
                      {msg.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSendMessageOrNote} className="space-y-3 pt-3 border-t border-slate-100">
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
                  Customer Message
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
                  <span>Confidential Internal Log</span>
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder={
                isInternalNote
                  ? 'Enter internal note for Autohub staff (pricing notes, supplier logs, delivery info)...'
                  : 'Type message to send directly to customer on their portal...'
              }
              className={cn(
                'w-full text-xs font-medium rounded-xl p-3 focus:outline-none focus:ring-2 transition-all',
                isInternalNote
                  ? 'bg-amber-50/50 border border-amber-300 focus:ring-amber-500'
                  : 'bg-slate-50 border border-slate-200 focus:ring-[#ed2025]'
              )}
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className={cn(
                  'px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5',
                  isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#ed2025] hover:bg-[#d3181d]'
                )}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isInternalNote ? 'Save Internal Note' : 'Send Message to Customer'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 8: 46. DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Request Documents</h2>
              <p className="text-[11px] text-slate-500">Quotation PDFs, supplier documents, and tax receipts</p>
            </div>
            <button
              onClick={() => alert('Document upload modal initiated')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(!request.documents || request.documents.length === 0) ? (
              <p className="col-span-3 py-8 text-center text-slate-400 text-xs">No documents attached.</p>
            ) : (
              request.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#2B4499] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2B4499] border border-blue-200">
                      {doc.category}
                    </span>
                    {doc.isInternalOnly && (
                      <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        Internal
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate" title={doc.title}>
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {doc.fileFormat} · {doc.fileSizeFormatted} · {doc.date}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <button
                      onClick={() => setIsDocumentPreviewOpen(doc)}
                      className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => alert(`Downloading ${doc.title}`)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 9: 49. AUDIT HISTORY */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Audit History & Event Trail</h2>
              <p className="text-[11px] text-slate-500">Immutable compliance log for {request.referenceNumber}</p>
            </div>
            <span className="text-xs font-bold text-slate-400">ISO 9001 / Enterprise Audit Ready</span>
          </div>

          <div className="space-y-3">
            {operationsService
              .getAuditLogs()
              .filter((a) => a.objectId.includes(request.referenceNumber) || a.objectId === request.id)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{entry.action}</span>
                      <span className="text-[10px] font-bold text-[#2B4499] bg-blue-50 px-1.5 py-0.2 rounded">
                        {entry.user} ({entry.userRole})
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{entry.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{entry.timestamp}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 30. CUSTOMER QUOTE PREVIEW MODAL */}
      {isQuotePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsQuotePreviewOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            {/* Header banner */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                  Customer Portal Exact View
                </span>
                <h3 className="text-sm font-black">PROCURly Procurement Quotation</h3>
              </div>
              <button
                onClick={() => setIsQuotePreviewOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Customer Quote Paper */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs bg-[#F7F8FA]">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{request.referenceNumber}</h4>
                    <p className="text-slate-500">{request.vehicle.year} {request.vehicle.make} {request.vehicle.model}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Fitment
                  </span>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{request.part.name}</span>
                    <span className="font-bold text-slate-900">NZ$350.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Air Freight (5–8 business days)</span>
                    <span className="font-bold text-slate-900">NZ$85.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Procurement Service & Import Handling</span>
                    <span className="font-bold text-slate-900">NZ$50.00</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                    <span>TOTAL</span>
                    <span className="text-[#2B4499]">NZ${calculatedCustomerPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                  <span>Air Freight Option (5–8 business days)</span>
                  <span className="font-bold">Recommended</span>
                </div>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-not-allowed opacity-90"
                  >
                    [ Accept Quote Button as seen by customer ]
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 text-center text-xs">
              <button
                onClick={() => setIsQuotePreviewOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 27. ADD SUPPLIER QUOTE MODAL */}
      {isAddSupplierQuoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddSupplierQuoteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">Add Supplier Wholesale Quote</h3>
              <button onClick={() => setIsAddSupplierQuoteOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplierQuote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="e.g. Osaka Auto Spares"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Part Cost (NZD) *</label>
                  <input
                    type="number"
                    required
                    value={newSupPartCost}
                    onChange={(e) => setNewSupPartCost(e.target.value)}
                    placeholder="280"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Supplier Freight (NZD)</label>
                  <input
                    type="number"
                    value={newSupFreight}
                    onChange={(e) => setNewSupFreight(e.target.value)}
                    placeholder="65"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Availability</label>
                <select
                  value={newSupAvailability}
                  onChange={(e) => setNewSupAvailability(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="In Stock">In Stock (Immediate Dispatch)</option>
                  <option value="1–3 Days">1–3 Days</option>
                  <option value="4–7 Days">4–7 Days</option>
                  <option value="Backorder">Backorder</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Supplier Notes</label>
                <textarea
                  rows={2}
                  value={newSupNotes}
                  onChange={(e) => setNewSupNotes(e.target.value)}
                  placeholder="e.g. Factory OEM packaging. Japanese domestic warehouse."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierQuoteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold shadow-sm"
                >
                  Save Supplier Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 25. ASSIGNMENT MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAssignModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-slide-up text-xs">
            <h3 className="text-sm font-black text-slate-900">Reassign Request Owner</h3>
            <div className="space-y-1">
              {staffUsers.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleAssignOwner(staff.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 text-left transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{staff.name}</span>
                    <span className="text-[10px] text-slate-500">{staff.roleTitle}</span>
                  </div>
                  {request.ownerName === staff.name && <Check className="w-4 h-4 text-[#ed2025]" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          requestId={request.referenceNumber}
          currentStatus={request.status}
        />
      )}
    </div>
  );
}
