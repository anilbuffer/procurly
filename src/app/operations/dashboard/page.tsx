'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  PlusCircle,
  ShieldAlert,
  ChevronRight,
  Sliders,
  MapPin,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle,
  XCircle,
  Navigation,
  Info,
  ClipboardList,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import {
  OperationsStaffUser,
  OperationalReportMetrics,
  FreightCarrierControl,
  NZPostPickupBooking,
  OperationalPartRequest,
  OperationalException,
} from '@/types/operations';
import { QuickCreateModal } from '@/components/operations/layout/QuickCreateModal';
import { INITIAL_REPORT_METRICS } from '@/services/operations/mockData';
import { cn } from '@/lib/utils';

export default function OperationsDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<OperationsStaffUser>(operationsService.getDefaultUser());
  const [metrics, setMetrics] = useState<OperationalReportMetrics>(() => INITIAL_REPORT_METRICS);
  const [freightCarriers, setFreightCarriers] = useState<FreightCarrierControl[]>([]);
  const [nzpostPickups, setNzpostPickups] = useState<NZPostPickupBooking[]>([]);
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);
  const [exceptions, setExceptions] = useState<OperationalException[]>([]);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isSchedulePickupModalOpen, setIsSchedulePickupModalOpen] = useState(false);

  // New NZ Post Pickup form state
  const [pickupCustomer, setPickupCustomer] = useState('AutoCare Auckland');
  const [pickupBranch, setPickupBranch] = useState('Penrose Workshop Hub');
  const [pickupAddress, setPickupAddress] = useState('42 Station Road, Penrose, Auckland');
  const [pickupParcels, setPickupParcels] = useState(2);
  const [pickupPostcode, setPickupPostcode] = useState('1061');

  const loadData = () => {
    setCurrentUser(operationsService.getCurrentUser());
    setMetrics(operationsService.getReportMetrics());
    setFreightCarriers(operationsService.getFreightCarriers());
    setNzpostPickups(operationsService.getNZPostPickups());
    setRequests(operationsService.getRequests());
    setExceptions(operationsService.getExceptions());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    window.addEventListener('procurly_ops_updated', handleUpdate);
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    window.addEventListener('procurly_finance_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
      window.removeEventListener('procurly_ops_updated', handleUpdate);
      window.removeEventListener('procurly_procurement_updated', handleUpdate);
      window.removeEventListener('procurly_finance_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggleCarrier = (id: string, currentStatus: boolean) => {
    const updated = operationsService.toggleFreightCarrier(id, !currentStatus);
    setFreightCarriers(updated);
  };

  const handleSchedulePickup = (e: React.FormEvent) => {
    e.preventDefault();
    operationsService.scheduleNZPostPickup({
      customerName: pickupCustomer,
      pickupBranch: pickupBranch,
      pickupAddress: pickupAddress,
      parcelCount: pickupParcels,
      postcode: pickupPostcode,
    });
    setIsSchedulePickupModalOpen(false);
    loadData();
  };

  const handleResolveException = (id: string) => {
    operationsService.updateExceptionStatus(id, 'Resolved', 'Resolved via Operations Freight Dispatch re-route.');
    loadData();
  };

  // Filter shipments currently in execution
  const activeShipments = requests.filter(
    (r) => r.shipment || r.status === 'In Transit' || r.status === 'Customs Clearance' || r.status === 'Out For Delivery'
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Role Responsibility Scope Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#2B4499] text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#ed2025] text-white text-[10px] uppercase font-black tracking-wider">
              Operations Domain
            </span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Role Ownership: Freight & Logistics Execution
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Operations & Logistics Command Centre
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Operations strictly manages freight enablement, carrier routing, NZ Post pickups & tracking, delivery status updates, and logistics exceptions. Procurement requests and sourcing belong exclusively to the Procurement role.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/procurement/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs transition-all"
          >
            <span>Procurement Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsSchedulePickupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-glow transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book NZ Post Pickup</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Shipments */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Active Freight Shipments</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2B4499]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeShipments.length || 18}</p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">In transit & local dispatch</span>
        </div>

        {/* NZ Post Scheduled Pickups */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">NZ Post Pickups Pending</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-[#ed2025]">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{nzpostPickups.filter((p) => p.status !== 'Picked Up').length}</p>
          <span className="text-[11px] font-medium text-emerald-600 mt-1 block">Scheduled for today</span>
        </div>

        {/* Active Freight Carriers */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Enabled Freight Carriers</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {freightCarriers.filter((c) => c.isEnabled).length} / {freightCarriers.length}
          </p>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">Carrier routes online</span>
        </div>

        {/* Logistics Exceptions */}
        <Link
          href="/operations/exceptions"
          className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-white border-2 border-[#ed2025] shadow-xs relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-red-700 uppercase tracking-wider">Logistics Exceptions</span>
            <div className="p-1.5 rounded-lg bg-[#ed2025] text-white animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#ed2025]">
            0{exceptions.filter((e) => e.status !== 'Resolved' && e.status !== 'Closed').length}
          </p>
          <span className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
            <span>Requires operational action</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* SECTION 0: ACTIVE PROCUREMENT REQUESTS MONITOR */}
      <div id="procurement-requests" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#2B4499]" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Procurement Requests</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor active workshop part requests, landed quotes, and status progression.
            </p>
          </div>
          <Link
            href="/operations/requests"
            className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Procurement Requests ({requests.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Part Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requests.slice(0, 5).map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-[#2B4499]">
                    <Link href={`/operations/requests/${req.referenceNumber}`} className="hover:underline">
                      {req.referenceNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{req.customerName}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium max-w-[200px] truncate" title={req.part.name}>
                    {req.part.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border',
                        req.status === 'Awaiting Customer Approval' && 'bg-purple-50 text-purple-700 border-purple-200',
                        req.status === 'Quote Ready' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        req.status === 'In Transit' && 'bg-cyan-50 text-cyan-700 border-cyan-200',
                        req.status.includes('Exception') && 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{req.ownerName}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/operations/requests/${req.referenceNumber}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#2B4499] hover:text-white text-slate-700 font-bold text-[11px] transition-colors"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 1: FREIGHT & CARRIER ENABLEMENT CONTROLS */}
      <div id="freight-controls" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Freight & Carrier Control Panel</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enable or disable freight options dynamically across customer quotations & checkout calculations.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full shrink-0">
            Real-time Carrier Routing Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freightCarriers.map((carrier) => (
            <div
              key={carrier.id}
              className={cn(
                'p-4 rounded-xl border transition-all flex flex-col justify-between',
                carrier.isEnabled
                  ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-100/70 border-slate-200 opacity-75'
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {carrier.category}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5">{carrier.name}</h3>
                  </div>

                  {/* Toggle Switch Button */}
                  <button
                    onClick={() => handleToggleCarrier(carrier.id, carrier.isEnabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                      carrier.isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        carrier.isEnabled ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600 my-3 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Est. Transit:</span>
                    <span className="font-bold text-slate-800">{carrier.transitTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Daily Cutoff:</span>
                    <span className="font-semibold text-slate-700">{carrier.cutoffTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Integration:</span>
                    <span className="font-semibold text-slate-700">{carrier.trackingIntegration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span
                  className={cn(
                    'font-bold flex items-center gap-1',
                    carrier.isEnabled ? 'text-emerald-700' : 'text-slate-500'
                  )}
                >
                  {carrier.isEnabled ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {carrier.isEnabled ? 'Active Freight Method' : 'Disabled'}
                </span>
                <span className="text-slate-400 truncate max-w-[150px]">{carrier.statusNote}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: NZ POST PICKUP & TRACKING HUB */}
      <div id="nzpost-tracking" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ed2025] text-white flex items-center justify-center font-bold text-xs">
                NZ
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                NZ Post Pickup & Courier Tracking Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage NZ Post pickup dispatches, manifest creation, and courier driver tracking.
            </p>
          </div>

          <button
            onClick={() => setIsSchedulePickupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Schedule NZ Post Pickup</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Tracking & Consignment</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Pickup Address</th>
                <th className="py-3 px-4">Parcels</th>
                <th className="py-3 px-4">Scheduled Window</th>
                <th className="py-3 px-4">Courier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {nzpostPickups.map((pickup) => (
                <tr key={pickup.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-[#ed2025] font-black">{pickup.trackingNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{pickup.consignmentId}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{pickup.customerName}</p>
                    <span className="text-[11px] text-slate-500">{pickup.pickupBranch}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{pickup.pickupAddress}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                      {pickup.parcelCount} PKG
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pickup.scheduledTime}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1',
                        pickup.status === 'Scheduled' && 'bg-amber-100 text-amber-800 border border-amber-200',
                        pickup.status === 'Dispatched' && 'bg-blue-100 text-blue-800 border border-blue-200',
                        pickup.status === 'Picked Up' && 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {pickup.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`https://www.nzpost.co.nz/tools/tracking/item/${pickup.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                    >
                      <span>Live Track</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: DELIVERY STATUS EXECUTION QUEUE */}
      <div id="delivery-updates" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Delivery Status Execution Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update real-time shipment delivery states for workshop customers.
            </p>
          </div>
          <Link
            href="/operations/shipments"
            className="text-xs font-bold text-[#2B4499] hover:underline flex items-center gap-1"
          >
            <span>View Full Shipments Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-[#2B4499]">SHP-90812-NZ</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">In Transit</span>
              </div>
              <p className="text-sm font-black text-slate-900">Hyundai Santa Fe Brake Booster</p>
              <p className="text-xs text-slate-500 mt-0.5">Customer: AutoCare Auckland (Penrose)</p>
              <div className="my-3 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                <p><span className="font-semibold text-slate-500">Carrier:</span> NZ Post Air Express</p>
                <p><span className="font-semibold text-slate-500">Tracking:</span> NZP-AKL-882109</p>
              </div>
            </div>
            <Link
              href="/operations/shipments"
              className="w-full inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-[#2B4499] hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Update Delivery Milestone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Item 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-[#2B4499]">SHP-90815-NZ</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  Customs Clearance
                </span>
              </div>
              <p className="text-sm font-black text-slate-900">Subaru Outback Steering Rack</p>
              <p className="text-xs text-slate-500 mt-0.5">Customer: Wellington Fleet Hub</p>
              <div className="my-3 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                <p><span className="font-semibold text-slate-500">Carrier:</span> NZ Post Express Courier</p>
                <p><span className="font-semibold text-slate-500">Status:</span> MPI Biosecurity Hold Clearance</p>
              </div>
            </div>
            <Link
              href="/operations/shipments"
              className="w-full inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-[#2B4499] hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Update Delivery Milestone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Item 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-[#2B4499]">SHP-90820-NZ</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Out For Delivery
                </span>
              </div>
              <p className="text-sm font-black text-slate-900">Nissan Leaf High Voltage Relay</p>
              <p className="text-xs text-slate-500 mt-0.5">Customer: Christchurch Electric Hub</p>
              <div className="my-3 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                <p><span className="font-semibold text-slate-500">Carrier:</span> NZ Post Courier Van #4</p>
                <p><span className="font-semibold text-slate-500">Driver ETA:</span> Today, 02:45 PM</p>
              </div>
            </div>
            <Link
              href="/operations/shipments"
              className="w-full inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Confirm Workshop Delivery</span>
              <CheckCircle className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 4: LOGISTICS EXCEPTIONS RESOLUTION */}
      <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ed2025]" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Logistics Exceptions</h2>
          </div>
          <Link
            href="/operations/exceptions"
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <span>Open Exception Centre</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {exceptions
            .filter((e) => e.status !== 'Resolved' && e.status !== 'Closed')
            .slice(0, 3)
            .map((exc) => (
              <div
                key={exc.id}
                className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-red-700">{exc.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                      {exc.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{exc.customerName}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{exc.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{exc.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolveException(exc.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Resolve & Clear
                  </button>
                  <Link
                    href={`/operations/exceptions`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL: Schedule NZ Post Pickup */}
      {isSchedulePickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSchedulePickupModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ed2025] text-white flex items-center justify-center font-bold text-xs">
                  NZ
                </div>
                <h3 className="text-sm font-black text-slate-900">Schedule NZ Post Courier Pickup</h3>
              </div>
              <button
                onClick={() => setIsSchedulePickupModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSchedulePickup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Workshop</label>
                <input
                  type="text"
                  value={pickupCustomer}
                  onChange={(e) => setPickupCustomer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Branch</label>
                  <input
                    type="text"
                    value={pickupBranch}
                    onChange={(e) => setPickupBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={pickupPostcode}
                    onChange={(e) => setPickupPostcode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Pickup Address</label>
                <textarea
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parcel Count</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={pickupParcels}
                  onChange={(e) => setPickupParcels(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSchedulePickupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ed2025] text-white hover:bg-red-700 shadow-md"
                >
                  Confirm & Schedule Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal isOpen={isQuickCreateOpen} onClose={() => setIsQuickCreateOpen(false)} />
    </div>
  );
}
