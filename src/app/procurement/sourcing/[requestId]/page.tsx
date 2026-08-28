'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Search,
  ArrowLeft,
  Car,
  Building2,
  Phone,
  Mail,
  Send,
  Plus,
  CheckCircle,
  FileText,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  MessageSquare,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementRequest, SupplierSummary, SupplierQuoteItem } from '@/types/procurement';
import { INITIAL_PROCUREMENT_REQUESTS, INITIAL_SUPPLIERS, INITIAL_SUPPLIER_QUOTES } from '@/services/procurement/mockData';

export default function SourcingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.requestId as string) || 'req_01';

  const resolveRequest = (id: string): ProcurementRequest => {
    return (
      procurementService.getRequestById(id) ||
      INITIAL_PROCUREMENT_REQUESTS.find((r) => r.id.toLowerCase() === id.toLowerCase() || r.requestNumber.toLowerCase() === id.toLowerCase()) ||
      INITIAL_PROCUREMENT_REQUESTS[0]
    );
  };

  const initialRequest = resolveRequest(rawId);
  const [request, setRequest] = useState<ProcurementRequest>(initialRequest);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>(() => procurementService.getSuppliers());
  const [quotes, setQuotes] = useState<SupplierQuoteItem[]>(() => procurementService.getQuotesByRequestId(initialRequest.id));

  // Supplier Search & Selected Supplier for RFQ
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSummary | null>(() => {
    const sups = procurementService.getSuppliers();
    return sups.length > 0 ? sups[0] : INITIAL_SUPPLIERS[0];
  });

  // Supplier Contact Message
  const [rfqMessage, setRfqMessage] = useState(
    `Konnichiwa / Hello,\n\nPlease quote availability, landed freight cost, and lead time for:\nPart: ${initialRequest.part.name}\nOEM Part Number: ${initialRequest.part.partNumber || 'N/A'}\nVehicle: ${initialRequest.vehicle.year} ${initialRequest.vehicle.make} ${initialRequest.vehicle.model} (VIN: ${initialRequest.vehicle.vin})\nQuantity Required: ${initialRequest.part.quantity} unit(s).\nTarget Delivery: Auckland Airport Logistics Hub.\n\nThank you,\n${procurementService.getCurrentUser().name}\nAutohub Global Procurement`
  );
  const [contactMethod, setContactMethod] = useState<'Email' | 'Phone' | 'Direct EDI'>('Direct EDI');
  const [rfqSent, setRfqSent] = useState(false);

  // Direct Add Quote Form State
  const [quoteUnitCost, setQuoteUnitCost] = useState<number | ''>(0);
  const [quoteFreightCost, setQuoteFreightCost] = useState<number | ''>(0);
  const [quoteHandlingCost, setQuoteHandlingCost] = useState<number | ''>(0);
  const [quoteAvailability, setQuoteAvailability] = useState<'In Stock' | '1–2 Days' | '3–5 Days' | '7–10 Days' | 'Backorder'>('In Stock');
  const [quoteLeadDays, setQuoteLeadDays] = useState(3);
  const [quoteCondition, setQuoteCondition] = useState('New OEM Factory Boxed');
  const [quoteWarrantyMonths, setQuoteWarrantyMonths] = useState(12);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteRecorded, setQuoteRecorded] = useState(false);

  const loadData = () => {
    const req = resolveRequest(rawId);
    setRequest(req);
    const sups = procurementService.getSuppliers();
    setSuppliers(sups);
    if (sups.length > 0 && !selectedSupplier) {
      setSelectedSupplier(sups[0]);
    }
    setQuotes(procurementService.getQuotesByRequestId(req.id));
    setRfqMessage(
      `Konnichiwa / Hello,\n\nPlease quote availability, landed freight cost, and lead time for:\nPart: ${req.part.name}\nOEM Part Number: ${req.part.partNumber || 'N/A'}\nVehicle: ${req.vehicle.year} ${req.vehicle.make} ${req.vehicle.model} (VIN: ${req.vehicle.vin})\nQuantity Required: ${req.part.quantity} unit(s).\nTarget Delivery: Auckland Airport Logistics Hub.\n\nThank you,\n${procurementService.getCurrentUser().name}\nAutohub Global Procurement`
    );
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [rawId]);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.specialization.some((sp) => sp.toLowerCase().includes(supplierSearch.toLowerCase()))
  );

  const handleSendRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    procurementService.sendSupplierMessage(selectedSupplier.id, rfqMessage, false, request.id);
    procurementService.updateRequestStatus(request.id, 'Awaiting Supplier', 'Supplier Contacted');
    setRfqSent(true);
    setTimeout(() => setRfqSent(false), 3000);
  };

  const handleRecordQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    const total =
      (Number(quoteUnitCost) || 0) * (request.part.quantity || 1) +
      (Number(quoteFreightCost) || 0) +
      (Number(quoteHandlingCost) || 0);

    procurementService.addSupplierQuote({
      requestId: request.id,
      requestRef: request.requestNumber,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      supplierCode: selectedSupplier.code,
      partName: request.part.name,
      partNumber: request.part.partNumber,
      quantity: request.part.quantity,
      condition: quoteCondition,
      warrantyMonths: quoteWarrantyMonths,
      unitCostNZD: Number(quoteUnitCost) || 0,
      freightCostNZD: Number(quoteFreightCost) || 0,
      handlingCostNZD: Number(quoteHandlingCost) || 0,
      totalCostNZD: total,
      availability: quoteAvailability,
      leadTimeDays: quoteLeadDays,
      leadTimeDisplay: `${quoteLeadDays} Days`,
      validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Received',
      paymentTerms: 'Net 30 Days',
      notes: quoteNotes,
      attachments: [{ name: 'Quotation_Sheet.pdf', size: '320 KB', url: '#' }],
    });

    setQuoteRecorded(true);
    setTimeout(() => {
      setQuoteRecorded(false);
      router.push(`/procurement/quote-comparison?requestId=${request.id}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/procurement/sourcing"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {request.requestNumber}
              </span>
              <span className="text-xs font-bold text-slate-800">
                5-Step Sourcing Workflow
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Sourcing: {request.part.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/procurement/quote-comparison?requestId=${request.id}`}
          className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
        >
          <Zap className="w-3.5 h-3.5" />
          Compare Received Quotes ({quotes.length})
        </Link>
      </div>

      {/* Section 1: Request Requirement */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Request Requirement
            </h2>
          </div>
          <span className="text-xs font-bold text-brand-blue">
            Customer: {request.customerName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400">Vehicle</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
            </p>
            <p className="text-slate-500 font-mono mt-1">VIN: {request.vehicle.vin}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400">Part Required</p>
            <p className="font-bold text-slate-900 mt-0.5">{request.part.name}</p>
            <p className="text-brand-blue font-mono mt-1 font-bold">
              OEM #: {request.part.partNumber || 'Direct Match'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400">Quantity & Preferences</p>
            <p className="font-bold text-slate-900 mt-0.5">{request.part.quantity} Unit(s)</p>
            <p className="text-emerald-700 font-semibold mt-1">
              {request.part.qualityPreference} • {request.part.condition}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400">Customer Notes</p>
            <p className="text-slate-700 italic mt-0.5 line-clamp-2">
              {request.part.notes || 'Standard OEM verified fitment required.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Supplier Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Supplier Search & Identification
            </h2>
          </div>
          <div className="w-64">
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Search preferred suppliers..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              onClick={() => setSelectedSupplier(sup)}
              className={cn(
                'p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2',
                selectedSupplier?.id === sup.id
                  ? 'bg-blue-50/80 border-brand-blue ring-2 ring-brand-blue/30 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{sup.name}</span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded',
                    sup.status === 'Preferred'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {sup.status}
                </span>
              </div>
              <p className="text-slate-500">{sup.location}, {sup.country}</p>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                <span>Lead: <strong className="text-slate-800">{sup.avgLeadTimeDays}d</strong></span>
                <span>Response: <strong className="text-emerald-700">{sup.responseRatePct}%</strong></span>
                <span>Score: <strong className="text-brand-blue">{sup.reliabilityScore}/100</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Supplier Contact (RFQ Dispatch) */}
      {selectedSupplier && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Supplier Contact & RFQ Dispatch — {selectedSupplier.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Transmit Via:</span>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="Direct EDI">Direct Supplier EDI</option>
                <option value="Email">Email ({selectedSupplier.contactEmail})</option>
                <option value="Phone">Phone ({selectedSupplier.contactPhone})</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSendRFQ} className="space-y-3">
            <textarea
              rows={5}
              value={rfqMessage}
              onChange={(e) => setRfqMessage(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Contact Rep: <strong className="text-slate-700">{selectedSupplier.contactName}</strong>
              </span>
              <button
                type="submit"
                className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
              >
                <Send className="w-3.5 h-3.5" />
                {rfqSent ? 'RFQ Dispatched!' : 'Transmit Sourcing RFQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section 4 & 5: Supplier Response & Add Quote */}
      {selectedSupplier && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4 & 5
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Supplier Response & Add Quotation
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700">
              Recording for {selectedSupplier.name}
            </span>
          </div>

          {quoteRecorded ? (
            <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-emerald-900">Quotation Successfully Added!</h3>
              <p className="text-xs text-emerald-700 mt-1">Redirecting to quote comparison...</p>
            </div>
          ) : (
            <form onSubmit={handleRecordQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Part Unit Cost (NZD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quoteUnitCost}
                    onChange={(e) => setQuoteUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Supplier Freight to NZ Hub (NZD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quoteFreightCost}
                    onChange={(e) => setQuoteFreightCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Handling / Packaging (NZD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quoteHandlingCost}
                    onChange={(e) => setQuoteHandlingCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Availability</label>
                  <select
                    value={quoteAvailability}
                    onChange={(e) => setQuoteAvailability(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="1–2 Days">1–2 Days</option>
                    <option value="3–5 Days">3–5 Days</option>
                    <option value="7–10 Days">7–10 Days</option>
                    <option value="Backorder">Backorder</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lead Time (Days to Hub)</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteLeadDays}
                    onChange={(e) => setQuoteLeadDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Condition Offered</label>
                  <input
                    type="text"
                    value={quoteCondition}
                    onChange={(e) => setQuoteCondition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={quoteWarrantyMonths}
                    onChange={(e) => setQuoteWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Supplier Response Notes</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Factory warranty cert included, sealed OEM box, 48h dispatch..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="btn-red-polished text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-brand-red/30"
                >
                  Save Quote & Add to Comparison
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
