'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  ArrowLeft,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalCustomer } from '@/types/operations';

export default function PendingCustomerApprovalsPage() {
  const [customers, setCustomers] = useState<OperationalCustomer[]>([]);

  const loadData = () => {
    setCustomers(operationsService.getCustomers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const pendingList = customers.filter((c) => c.status === 'Pending Approval');

  const handleApprove = (id: string) => {
    operationsService.approveCustomer(id);
    loadData();
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please provide reason for declining trade registration:', 'Incomplete trade reference verification');
    if (reason) {
      operationsService.rejectCustomer(id, reason);
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/operations/customers"
              className="text-xs font-bold text-slate-500 hover:text-[#2B4499] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customers</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pending Customer Registrations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and approve trade account applications, NZBN verification, and credit limits.
          </p>
        </div>

        <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
          {pendingList.length} Pending Review
        </span>
      </div>

      {/* Pending List */}
      {pendingList.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">All Customer Registrations Processed</p>
          <p>There are currently no new trade account applications pending Autohub approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingList.map((cust) => (
            <div
              key={cust.id}
              className="p-5 bg-white rounded-2xl border-2 border-amber-300 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{cust.businessName}</h3>
                    <p className="text-xs text-slate-500 font-mono">NZBN: {cust.nzbn}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                    Awaiting Review
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <p>
                    <span className="text-slate-400">Trading Name:</span> <strong>{cust.tradingName}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Primary Contact:</span> <strong>{cust.primaryContact.name}</strong> ({cust.primaryContact.phone})
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span> {cust.primaryContact.email}
                  </p>
                  <p>
                    <span className="text-slate-400">Requested Credit Limit:</span>{' '}
                    <strong className="text-[#2B4499]">NZ${cust.creditLimitNZD.toLocaleString()}</strong>
                  </p>
                  {cust.notes && (
                    <p className="text-[11px] text-amber-900 italic pt-1 border-t border-slate-200">
                      &quot;{cust.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleReject(cust.id)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-xs font-bold text-slate-600 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleApprove(cust.id)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Trade Account</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
