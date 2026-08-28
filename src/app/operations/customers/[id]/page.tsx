'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalCustomer, OperationalPartRequest } from '@/types/operations';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = (params?.id as string) || 'cust_autocare';

  const [customer, setCustomer] = useState<OperationalCustomer | undefined>(undefined);
  const [requests, setRequests] = useState<OperationalPartRequest[]>([]);

  useEffect(() => {
    const custs = operationsService.getCustomers();
    const clean = customerId.toLowerCase();
    const matched = custs.find((c) => c.id.toLowerCase() === clean || c.businessName.toLowerCase().includes(clean));
    setCustomer(matched || custs[0]);

    const reqs = operationsService.getRequests();
    setRequests(reqs.filter((r) => r.customerId === matched?.id || r.customerName === matched?.businessName || r.customerName === matched?.tradingName));
  }, [customerId]);

  if (!customer) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/operations/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2B4499] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {customer.status} Trade Account
        </span>
      </div>

      {/* 42. Company Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{customer.businessName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Trading Name: <strong className="text-slate-800">{customer.tradingName}</strong> · Business Type:{' '}
              <span>{customer.businessType}</span>
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              NZBN: <strong>{customer.nzbn}</strong> · GST: <strong>128-492-910</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Trade Credit Limit</span>
            <span className="text-xl font-black text-[#2B4499]">
              NZ${customer.creditLimitNZD.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-slate-500 block">20th Month Following Terms</span>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Contact</span>
            <p className="font-bold text-slate-900">{customer.primaryContact.name}</p>
            <p className="text-slate-500">{customer.primaryContact.role}</p>
            <p className="text-[#2B4499] font-medium">{customer.primaryContact.email}</p>
            <p className="text-slate-600">{customer.primaryContact.phone}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Accounts / Billing</span>
            <p className="font-bold text-slate-900">{customer.accountsContact.name}</p>
            <p className="text-[#2B4499] font-medium">{customer.accountsContact.email}</p>
            <p className="text-slate-600">{customer.accountsContact.phone}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Goods Inward & Workshop</span>
            <p className="font-bold text-slate-900">{customer.deliveryContact.name}</p>
            <p className="text-slate-600">{customer.deliveryContact.phone}</p>
          </div>
        </div>
      </div>

      {/* Customer's Procurement Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-900">Procurement History for {customer.tradingName}</h2>
          <span className="text-xs text-slate-500">{requests.length} Requests</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {requests.length === 0 ? (
            <p className="p-8 text-center text-slate-400">No active procurement requests for this customer.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/operations/requests/${req.referenceNumber}`} className="font-black text-[#2B4499]">
                      {req.referenceNumber}
                    </Link>
                    <span className="font-bold text-slate-900">
                      {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{req.part.name}</p>
                </div>
                <Link
                  href={`/operations/requests/${req.referenceNumber}`}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#ed2025] hover:text-white font-bold text-slate-700"
                >
                  Workspace →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
