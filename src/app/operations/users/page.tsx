'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  CheckCircle2,
  Mail,
  Phone,
  Plus,
  Lock,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';

export default function UsersDirectoryPage() {
  const staff = operationsService.getStaffUsers();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Staff & User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal Autohub operations, procurement, finance, and system administrator accounts.
          </p>
        </div>

        <button
          onClick={() => alert('Invite staff member initiated')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Staff User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {staff.map((usr) => (
          <div
            key={usr.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2B4499] to-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {usr.avatar}
                </div>
                <span className="text-[10px] font-black uppercase text-[#2B4499] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {usr.role}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{usr.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{usr.roleTitle}</p>
                <p className="text-[11px] text-slate-400">{usr.department}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{usr.email}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{usr.phone}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Active Session
              </span>
              <button
                onClick={() => operationsService.switchUser(usr.id)}
                className="text-xs font-bold text-[#2B4499] hover:underline"
              >
                Switch to this user →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
