'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_VEHICLES, PART_CATEGORIES } from '@/lib/constants';
import { formatNZD } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Plane, Ship, ShieldCheck, ArrowRight, Calculator, CheckCircle2, Sparkles, Check, PackageCheck } from 'lucide-react';

export function QuickQuoteEstimator() {
  const [selectedVehicleVin, setSelectedVehicleVin] = useState(SAMPLE_VEHICLES[0].vin);
  const [selectedCategory, setSelectedCategory] = useState(PART_CATEGORIES[0]);
  const [condition, setCondition] = useState<'New OEM' | 'Grade A Used'>('New OEM');
  const [selectedFreight, setSelectedFreight] = useState<'air' | 'sea'>('air');

  const activeVehicle = SAMPLE_VEHICLES.find((v) => v.vin === selectedVehicleVin) || SAMPLE_VEHICLES[0];

  // Dynamic calculations based on category and vehicle
  const basePartCost = condition === 'New OEM' ? 1450 : 850;
  
  // Air option
  const airFreight = 290;
  const customsBiosecurity = 55;
  const airGst = (basePartCost + airFreight + customsBiosecurity) * 0.15;
  const localCourier = 45;
  const totalAirLanded = basePartCost + airFreight + customsBiosecurity + airGst + localCourier;

  // Sea option
  const seaFreight = 95;
  const seaGst = (basePartCost + seaFreight + customsBiosecurity) * 0.15;
  const totalSeaLanded = basePartCost + seaFreight + customsBiosecurity + seaGst + localCourier;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-elevated overflow-hidden transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue-navy via-[#1e306e] to-brand-blue p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-red-400 shrink-0">
              <Calculator className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-white tracking-tight">Instant Landed Cost Estimator</h3>
              <p className="text-[11px] sm:text-xs text-blue-200">
                Explore transparent NZ landed pricing for popular trade parts
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-600/50 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Live NZD Tariff Model
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        {/* Step 1: Vehicle & Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sample NZ Vehicle
            </label>
            <select
              value={selectedVehicleVin}
              onChange={(e) => setSelectedVehicleVin(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            >
              {SAMPLE_VEHICLES.map((v) => (
                <option key={v.vin} value={v.vin}>
                  {v.year} {v.make} {v.model} ({v.originMarket})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-mono">
              VIN: {activeVehicle.vin.slice(0, 10)}•••
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Part Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            >
              {PART_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              Verified OEM Fitment Guaranteed
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Condition Required
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('New OEM')}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  condition === 'New OEM'
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                New OEM
              </button>
              <button
                type="button"
                onClick={() => setCondition('Grade A Used')}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  condition === 'Grade A Used'
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                Grade A Used
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {condition === 'New OEM' ? 'Factory Sealed Packaging' : 'Grade A Inspected & Cleaned'}
            </p>
          </div>
        </div>

        {/* Comparison Cards: Interactive Air vs Sea Freight Toggles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Select Freight Method to Compare</span>
            <span className="text-slate-400 font-normal">Click card to select</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option 1: Express Air */}
            <div
              onClick={() => setSelectedFreight('air')}
              className={`p-6 rounded-2xl relative transition-all duration-200 cursor-pointer ${
                selectedFreight === 'air'
                  ? 'bg-white border-2 border-brand-red shadow-[0_8px_25px_-5px_rgba(237,32,37,0.25)] ring-2 ring-red-500/20'
                  : 'bg-slate-50/80 border border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
                  <div className="p-1.5 rounded-lg bg-red-50 text-brand-red">
                    <Plane className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold">Priority Air Freight</span>
                </div>

                {selectedFreight === 'air' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-brand-red text-white px-2.5 py-1 rounded-full shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" /> SELECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Select
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-3xl font-heading font-black text-slate-900 tracking-tight">
                  {formatNZD(totalAirLanded)}{' '}
                  <span className="text-xs font-semibold text-slate-500">Landed NZD</span>
                </p>

                {/* Micro-copy tag */}
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Includes GST, Customs & Final Mile Delivery
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimated Transit:</span>
                  <span className="font-bold text-slate-900 bg-red-50 text-brand-red px-2 py-0.5 rounded font-mono">
                    3 - 5 Business Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Air Freight & Export:</span>
                  <span className="font-medium text-slate-800">{formatNZD(airFreight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NZ Customs, MPI & Duty:</span>
                  <span className="font-medium text-slate-800">{formatNZD(customsBiosecurity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (15%) & Local Courier:</span>
                  <span className="font-medium text-slate-800">{formatNZD(airGst + localCourier)}</span>
                </div>
              </div>
            </div>

            {/* Option 2: Consolidated Sea Freight */}
            <div
              onClick={() => setSelectedFreight('sea')}
              className={`p-6 rounded-2xl relative transition-all duration-200 cursor-pointer ${
                selectedFreight === 'sea'
                  ? 'bg-white border-2 border-brand-blue shadow-[0_8px_25px_-5px_rgba(43,68,153,0.25)] ring-2 ring-blue-500/20'
                  : 'bg-slate-50/80 border border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-brand-blue">
                    <Ship className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold">Consolidated Sea Freight</span>
                </div>

                {selectedFreight === 'sea' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-brand-blue text-white px-2.5 py-1 rounded-full shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" /> SELECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Select
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-3xl font-heading font-black text-slate-900 tracking-tight">
                  {formatNZD(totalSeaLanded)}{' '}
                  <span className="text-xs font-semibold text-slate-500">Landed NZD</span>
                </p>

                {/* Micro-copy tag */}
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Includes GST, Customs & Final Mile Delivery
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimated Transit:</span>
                  <span className="font-bold text-slate-900 bg-blue-50 text-brand-blue px-2 py-0.5 rounded font-mono">
                    18 - 24 Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sea Freight & Port:</span>
                  <span className="font-medium text-slate-800">{formatNZD(seaFreight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NZ Customs, MPI & Duty:</span>
                  <span className="font-medium text-slate-800">{formatNZD(customsBiosecurity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (15%) & Local Courier:</span>
                  <span className="font-medium text-slate-800">{formatNZD(seaGst + localCourier)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee & Action */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-brand-red shrink-0" />
            <span>Quotes include all import brokerage, MPI biosecurity pre-clearance, and direct workshop delivery.</span>
          </div>

          <Link href="/requests/new" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto text-xs font-bold tracking-wide"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Exact Part Request
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

