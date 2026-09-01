'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Bell,
  Key,
  Laptop,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  Lock,
  LogOut,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementStaffUser } from '@/types/procurement';

export default function ProcurementProfilePage() {
  const [currentUser, setCurrentUser] = useState<ProcurementStaffUser>(() => procurementService.getDefaultUser());
  const [name, setName] = useState(procurementService.getDefaultUser().name);
  const [email, setEmail] = useState(procurementService.getDefaultUser().email);
  const [phone, setPhone] = useState(procurementService.getDefaultUser().phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const user = procurementService.getCurrentUser();
    setCurrentUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    const handleUpdate = () => {
      const u = procurementService.getCurrentUser();
      setCurrentUser(u);
      setName(u.name);
      setEmail(u.email);
      setPhone(u.phone);
    };
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  // Notification Preferences
  const [emailNotif, setEmailNotif] = useState(true);
  const [urgentSms, setUrgentSms] = useState(true);
  const [quoteAlerts, setQuoteAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Procurement Specialist Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, regional sourcing assignments, security keys, and notification channels
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Profile preferences successfully updated and stored!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Info & Role (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-blue to-indigo-600 text-white font-black text-base flex items-center justify-center ring-4 ring-slate-100">
                {currentUser.avatar}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-xs text-brand-blue font-semibold">{currentUser.role}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Regional Specializations & Brand Portfolios */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-blue" />
              Assigned Sourcing Portfolios & Regions
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Brand & Component Specializations:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.specialization.map((sp, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-brand-blue font-bold border border-blue-200">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Primary Supplier Hub Corridors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.activeRegions.map((reg, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notification Preferences, Security, Sessions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-500" />
              Notification Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Email Notifications</p>
                  <p className="text-[11px] text-slate-500">Quotes received and customer sign-offs</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="w-4 h-4 text-brand-red rounded focus:ring-brand-red/20"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">SMS Urgent Delays</p>
                  <p className="text-[11px] text-slate-500">Critical flight or customs exceptions</p>
                </div>
                <input
                  type="checkbox"
                  checked={urgentSms}
                  onChange={(e) => setUrgentSms(e.target.checked)}
                  className="w-4 h-4 text-brand-red rounded focus:ring-brand-red/20"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Quote Expiration Warnings</p>
                  <p className="text-[11px] text-slate-500">24h countdown on supplier quotes</p>
                </div>
                <input
                  type="checkbox"
                  checked={quoteAlerts}
                  onChange={(e) => setQuoteAlerts(e.target.checked)}
                  className="w-4 h-4 text-brand-red rounded focus:ring-brand-red/20"
                />
              </label>
            </div>
          </div>

          {/* Security & Active Session */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-brand-blue" />
              Security & Active Session
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-slate-600" /> Auckland Procurement Office
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Current
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">IP: 202.89.4.12 • Last active just now</p>
              </div>

              <button
                type="button"
                className="w-full py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Change Security Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
