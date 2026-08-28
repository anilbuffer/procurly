'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { SupplierSummary } from '@/types/procurement';

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [addSupplierModalOpen, setAddSupplierModalOpen] = useState(false);

  // Add Supplier form state
  const [newSupName, setNewSupName] = useState('');
  const [newSupCode, setNewSupCode] = useState('');
  const [newSupLocation, setNewSupLocation] = useState('');
  const [newSupCountry, setNewSupCountry] = useState('Japan');
  const [newSupSpecialization, setNewSupSpecialization] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');

  const loadData = () => {
    setSuppliers(procurementService.getSuppliers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const statuses = ['All', 'Preferred', 'Active', 'Under Review', 'Inactive'];

  const filteredSuppliers = suppliers.filter((s) => {
    if (selectedStatus !== 'All' && s.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.specialization.some((sp) => sp.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupCode) return;

    procurementService.addSupplier({
      name: newSupName,
      code: newSupCode,
      location: newSupLocation || 'Tokyo',
      country: newSupCountry,
      specialization: newSupSpecialization.split(',').map((s) => s.trim()).filter(Boolean),
      contactName: newSupContact || 'Representative',
      contactEmail: newSupEmail || 'info@supplier.com',
      contactPhone: newSupPhone || '+81 3 0000 0000',
      responseRatePct: 95,
      avgLeadTimeDays: 3,
      avgResponseTimeHours: 2,
      orderCompletionPct: 98,
      exceptionRatePct: 1,
      status: 'Active',
      operatingRegions: [newSupCountry],
      preferredCategories: ['Automotive Parts'],
    });

    setAddSupplierModalOpen(false);
    setNewSupName('');
    setNewSupCode('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supplier Directory & Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {filteredSuppliers.length} Verified Vendors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global OEM distributors, Japanese dismantlers, and European trade partners
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/procurement/suppliers/performance"
            className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Performance Intelligence
          </Link>
          <button
            onClick={() => setAddSupplierModalOpen(true)}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Supplier
          </button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {statuses.map((st) => {
          const count = st === 'All' ? suppliers.length : suppliers.filter((s) => s.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <span>{st}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  selectedStatus === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier name, code, country, make specialization..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Supplier List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-3 text-center">Active Orders</th>
                <th className="py-3 px-3 text-center">Response Rate</th>
                <th className="py-3 px-3 text-center">Avg Lead Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Supplier */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue font-bold flex items-center justify-center text-xs shrink-0">
                        {s.code}
                      </div>
                      <div>
                        <Link
                          href={`/procurement/suppliers/${s.id}`}
                          className="font-bold text-slate-900 group-hover:text-brand-blue text-xs block"
                        >
                          {s.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">{s.contactName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{s.location}</p>
                    <p className="text-[11px] text-slate-500">{s.country}</p>
                  </td>

                  {/* Specialization */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {s.specialization.slice(0, 3).map((sp, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Active Orders */}
                  <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                    {s.activeOrdersCount}
                  </td>

                  {/* Response Rate */}
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                    {s.responseRatePct}%
                  </td>

                  {/* Avg Lead Time */}
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                    {s.avgLeadTimeDays} Days
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        s.status === 'Preferred'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : s.status === 'Under Review'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-brand-blue border-blue-200'
                      )}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* Profile Link */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/procurement/suppliers/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-blue-dark group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {addSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slide-up my-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add New Supplier</h2>
              <button onClick={() => setAddSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Code *</label>
                  <input
                    type="text"
                    value={newSupCode}
                    onChange={(e) => setNewSupCode(e.target.value)}
                    placeholder="e.g. TAS-JP"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Country *</label>
                  <select
                    value={newSupCountry}
                    onChange={(e) => setNewSupCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="USA">USA</option>
                    <option value="New Zealand">New Zealand</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Location / Hub</label>
                <input
                  type="text"
                  value={newSupLocation}
                  onChange={(e) => setNewSupLocation(e.target.value)}
                  placeholder="e.g. Yokohama, Kanagawa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={newSupSpecialization}
                  onChange={(e) => setNewSupSpecialization(e.target.value)}
                  placeholder="e.g. Toyota OEM, Lexus, Transmissions"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupContact}
                    onChange={(e) => setNewSupContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddSupplierModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-red-polished text-white font-bold px-4 py-1.5 rounded-lg"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
