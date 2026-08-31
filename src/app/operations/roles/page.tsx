'use client';

import React from 'react';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';

export default function RolesPermissionsPage() {
  const matrix = [
    { permission: 'View & Manage Requests', ops: true, proc: true, fin: true, admin: true },
    { permission: 'Assign Staff / Request Owners', ops: true, proc: false, fin: false, admin: true },
    { permission: 'Source Parts & RFQ Dispatch', ops: true, proc: true, fin: false, admin: true },
    { permission: 'Add Supplier Wholesale Quotes', ops: true, proc: true, fin: false, admin: true },
    { permission: 'Build & Send Customer Quotes', ops: true, proc: true, fin: false, admin: true },
    { permission: 'Issue Purchase Orders (POs)', ops: true, proc: true, fin: false, admin: true },
    { permission: 'Update Freight & Milestones', ops: true, proc: true, fin: false, admin: true },
    { permission: 'Manage & Resolve Exceptions', ops: true, proc: true, fin: true, admin: true },
    { permission: 'Reconcile Customer Payments', ops: true, proc: false, fin: true, admin: true },
    { permission: 'Process Customer Refunds', ops: false, proc: false, fin: true, admin: true },
    { permission: 'Approve Trade Customer Accounts', ops: true, proc: false, fin: true, admin: true },
    { permission: 'Configure Margins & SLAs', ops: false, proc: false, fin: false, admin: true },
    { permission: 'Manage Users & RBAC Matrix', ops: false, proc: false, fin: false, admin: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            RBAC Roles & Permissions Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Role-based access control matrix governing Operations, Procurement, and Finance desks.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Functional Permission</th>
                <th className="py-3.5 px-3 text-center">Operations</th>
                <th className="py-3.5 px-3 text-center">Procurement</th>
                <th className="py-3.5 px-3 text-center">Finance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {matrix.map((row) => (
                <tr key={row.permission} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.permission}</td>
                  <td className="py-3 px-3 text-center">
                    {row.ops ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.proc ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.fin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
