'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalPartRequest } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function ProcurementOrdersPage() {
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);

  useEffect(() => {
    setRequests(operationsService.getRequests());
    const handleUpdate = () => setRequests(operationsService.getRequests());
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

  const poRequests = requests.filter(
    (r) =>
      r.procurementOrder ||
      r.status === 'Ordered From Supplier' ||
      r.status === 'Received At Shipping Facility' ||
      r.status === 'Payment Received' ||
      r.status === 'In Transit' ||
      r.status === 'Customs Clearance' ||
      r.status === 'Delivered'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Procurement Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage purchase orders issued to global suppliers and track facility intake.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900">Active Purchase Orders ({poRequests.length})</h2>
          <span className="text-xs text-slate-500">Supplier Order Fulfillment Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">PO #</th>
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Part Details</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Expected Intake</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {poRequests.map((req) => {
                const po = req.procurementOrder;
                const poNumber = po?.orderNumber || `ORD-${req.referenceNumber.replace('AH-P-', '')}`;
                const supplier = po?.supplierName || req.sourcing?.supplierQuotes.find((s) => s.isSelected)?.supplierName || 'Tokyo Auto Spares';

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#2B4499]">
                      {poNumber}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <Link href={`/operations/requests/${req.referenceNumber}`} className="hover:underline">
                        {req.referenceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{supplier}</td>
                    <td className="py-3.5 px-3 text-slate-700">{req.customerName}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{req.part.name}</p>
                      <p className="text-[11px] text-slate-500">{req.vehicle.make} {req.vehicle.model}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#2B4499] border border-blue-200">
                        {po?.status || req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">
                      {po?.expectedShippingFacilityDate || '30 Aug 2026'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/operations/requests/${req.referenceNumber}?tab=procurement`}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white text-xs font-bold text-slate-700 transition-colors inline-block"
                      >
                        Manage PO →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
