'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plane,
  Ship,
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Package,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { FreightCarrierControl } from '@/types/operations';
import { formatNZD } from '@/lib/utils';

export default function FreightConfigurationPage() {
  const [carriers, setCarriers] = useState<FreightCarrierControl[]>([]);
  const [airBaseRateNZD, setAirBaseRateNZD] = useState(85.0);
  const [seaBaseRateNZD, setSeaBaseRateNZD] = useState(35.0);
  const [mpiBiosecurityFeeNZD, setMpiBiosecurityFeeNZD] = useState(45.0);
  const [defaultMarginPercent, setDefaultMarginPercent] = useState(15.0);
  const [airTransitDays, setAirTransitDays] = useState('3–5 business days');
  const [seaTransitDays, setSeaTransitDays] = useState('18–25 business days');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = () => {
    setCarriers(operationsService.getFreightCarriers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const handleToggle = (carrierId: string, currentEnabled: boolean) => {
    const updated = operationsService.toggleFreightCarrier(carrierId, !currentEnabled);
    setCarriers(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    operationsService.addAuditLog({
      action: 'Freight Rates Updated',
      objectType: 'System',
      objectId: 'FREIGHT-CONFIG',
      details: `Updated Air Base: $${airBaseRateNZD}, Sea Base: $${seaBaseRateNZD}, Margin: ${defaultMarginPercent}%, MPI Fee: $${mpiBiosecurityFeeNZD}`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B4499] uppercase tracking-wider bg-blue-50 px-3 py-0.5 rounded-full border border-blue-200 mb-1.5">
            <Truck className="w-3.5 h-3.5" /> Logistics Engine Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Freight Management & Landed Rate Controls
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enable/disable international freight lines, adjust base shipping calculations, and override transit times.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            NZ Post API Active
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Freight calculation rules and carrier availability successfully saved and synced to the Quotation Engine!</span>
        </div>
      )}

      {/* 2. Carrier Enablement Toggles */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900">Active Freight Carriers & Routes</h2>
          <p className="text-xs text-slate-500">
            Toggle which freight delivery options are presented to customers during landed quote generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carriers.map((carrier) => (
            <div
              key={carrier.id}
              className={`p-5 rounded-2xl border transition-all ${
                carrier.isEnabled
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/70 opacity-75'
              } flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                      carrier.category.includes('Air')
                        ? 'bg-blue-50 text-[#2B4499]'
                        : carrier.category.includes('Sea')
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {carrier.category.includes('Air') ? (
                      <Plane className="w-5 h-5" />
                    ) : carrier.category.includes('Sea') ? (
                      <Ship className="w-5 h-5" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{carrier.name}</h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {carrier.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(carrier.id, carrier.isEnabled)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    carrier.isEnabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {carrier.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard Transit</span>
                  <span className="font-bold text-slate-800">{carrier.transitTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracking Gateway</span>
                  <span className="font-bold text-slate-800">{carrier.trackingIntegration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Base Landed Cost Calculation Engine Overrides */}
      <section className="p-6 bg-white rounded-3xl border border-slate-200 shadow-card space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900">Freight & Landed Cost Calculation Overrides</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Default rate tables used by the Quotation Engine when computing all-inclusive landed New Zealand pricing.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Air Freight Base (NZD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  value={airBaseRateNZD}
                  onChange={(e) => setAirBaseRateNZD(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-400">Standard priority express air freight allowance</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Sea Freight Base (NZD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  value={seaBaseRateNZD}
                  onChange={(e) => setSeaBaseRateNZD(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-400">Consolidated maritime shipping container allowance</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">MPI Biosecurity & Customs Entry (NZD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  value={mpiBiosecurityFeeNZD}
                  onChange={(e) => setMpiBiosecurityFeeNZD(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-400">Standard Ministry for Primary Industries inspection charge</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Procurement Margin Percentage (%)</label>
              <input
                type="number"
                step="0.5"
                value={defaultMarginPercent}
                onChange={(e) => setDefaultMarginPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400">Base target margin applied across wholesale sourced parts</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Air Freight Transit Time Display</label>
              <input
                type="text"
                value={airTransitDays}
                onChange={(e) => setAirTransitDays(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400">Shown to customers on quotation cards</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Sea Freight Transit Time Display</label>
              <input
                type="text"
                value={seaTransitDays}
                onChange={(e) => setSeaTransitDays(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400">Shown to customers on quotation cards</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>All updates logged to the immutable audit trail.</span>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B4499] hover:bg-[#203375] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save & Sync Freight Rules</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
