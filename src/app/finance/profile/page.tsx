'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  User,
  ShieldCheck,
  Bell,
  Lock,
  Smartphone,
  Building2,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceStaffUser } from '@/types/finance';

export default function FinanceProfilePage() {
  const [currentUser, setCurrentUser] = useState<FinanceStaffUser>(() => financeService.getDefaultUser());
  const [staffUsers, setStaffUsers] = useState<FinanceStaffUser[]>(financeService.getStaffUsers());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setCurrentUser(financeService.getCurrentUser());
    setStaffUsers(financeService.getStaffUsers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const handleSwitch = (u: FinanceStaffUser) => {
    financeService.switchUser(u.id);
    setCurrentUser(u);
    setToastMsg(`Switched active profile to ${u.name} (${u.role}).`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-slide-up border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Finance User Profile & Security</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role permissions, financial authorization thresholds, two-factor authentication, and security audit log.
        </p>
      </div>

      {/* Specialist Switcher Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Switch Financial Specialist Profile</span>
        </h2>
        <p className="text-xs text-slate-500">
          Select a specialist to test role-specific thresholds and authorization workflows:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {staffUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => handleSwitch(u)}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all flex items-center gap-3',
                currentUser.id === u.id
                  ? 'bg-red-50/50 border-[#ed2025] ring-2 ring-red-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f03237] to-[#d3181d] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {u.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{u.role}</p>
              </div>
              {currentUser.id === u.id && (
                <CheckCircle2 className="w-4 h-4 text-[#ed2025] shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-lg flex items-center justify-center shadow-sm">
            {currentUser.avatar}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-bold text-slate-900 block mt-0.5">{currentUser.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Direct Phone</span>
            <span className="font-bold text-slate-900 block mt-0.5">{currentUser.phone}</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-900 block">Assigned Security Permissions</span>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.permissions.map((perm, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Sessions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600" />
          <span>Active Treasury Authentication & Sessions</span>
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
              <p className="text-slate-500 text-[11px]">Hardware security key / Authenticator app enabled.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">Current Session</p>
              <p className="text-slate-500 text-[11px]">Auckland, New Zealand • IP: 122.56.192.81 (BNZ Secure VPN)</p>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Expires in 7h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
