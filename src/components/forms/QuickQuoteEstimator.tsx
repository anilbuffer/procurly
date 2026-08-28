'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_VEHICLES, PART_CATEGORIES } from '@/lib/constants';
import { formatNZD } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Plane, Ship, ShieldCheck, ArrowRight, Calculator, CheckCircle2, Sparkles } from 'lucide-react';

export function QuickQuoteEstimator() {
  const [selectedVehicleVin, setSelectedVehicleVin] = useState(SAMPLE_VEHICLES[0].vin);
  const [selectedCategory, setSelectedCategory] = useState(PART_CATEGORIES[0]);
  const [condition, setCondition] = useState<'New OEM' | 'Grade A Used'>('New OEM');

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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue-navy to-brand-blue p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10">
              <Calculator className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">Instant Landed Cost Estimator</h3>
              <p className="text-xs text-blue-200">
                Explore transparent NZ landed pricing for popular trade parts
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-700">
            <Sparkles className="w-3 h-3" /> Live NZD Tariff Model
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Vehicle & Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Sample NZ Vehicle
            </label>
            <select
              value={selectedVehicleVin}
              onChange={(e) => setSelectedVehicleVin(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Part Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
            >
              {PART_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Condition Required
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('New OEM')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                  condition === 'New OEM'
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                New OEM
              </button>
              <button
                type="button"
                onClick={() => setCondition('Grade A Used')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                  condition === 'Grade A Used'
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Grade A Used
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Cards: Air vs Sea Freight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Express Air */}
          <div className="p-5 rounded-xl border-2 border-brand-red bg-red-50/20 relative shadow-sm">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-red text-white px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="flex items-center gap-2 text-brand-red font-bold text-sm mb-2">
              <Plane className="w-4 h-4" />
              <span>Priority Air Freight</span>
            </div>

            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatNZD(totalAirLanded)}{' '}
              <span className="text-xs font-normal text-slate-500">Landed NZD</span>
            </p>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-3">
              <div className="flex justify-between">
                <span>Estimated Transit:</span>
                <span className="font-bold text-slate-900">3 - 5 Business Days</span>
              </div>
              <div className="flex justify-between">
                <span>Air Freight & Export:</span>
                <span className="font-medium text-slate-700">{formatNZD(airFreight)}</span>
              </div>
              <div className="flex justify-between">
                <span>NZ Customs, MPI & Duty:</span>
                <span className="font-medium text-slate-700">{formatNZD(customsBiosecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Local Courier:</span>
                <span className="font-medium text-slate-700">{formatNZD(airGst + localCourier)}</span>
              </div>
            </div>
          </div>

          {/* Option 2: Consolidated Sea Freight */}
          <div className="p-5 rounded-xl border border-slate-300 bg-slate-50/60 relative">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-sm mb-2">
              <Ship className="w-4 h-4" />
              <span>Consolidated Sea Freight</span>
            </div>

            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatNZD(totalSeaLanded)}{' '}
              <span className="text-xs font-normal text-slate-500">Landed NZD</span>
            </p>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-3">
              <div className="flex justify-between">
                <span>Estimated Transit:</span>
                <span className="font-bold text-slate-900">18 - 24 Days</span>
              </div>
              <div className="flex justify-between">
                <span>Sea Freight & Port:</span>
                <span className="font-medium text-slate-700">{formatNZD(seaFreight)}</span>
              </div>
              <div className="flex justify-between">
                <span>NZ Customs, MPI & Duty:</span>
                <span className="font-medium text-slate-700">{formatNZD(customsBiosecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Local Courier:</span>
                <span className="font-medium text-slate-700">{formatNZD(seaGst + localCourier)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee & Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-brand-blue shrink-0" />
            <span>Quotes include all import fees, MPI biosecurity clearance, and direct workshop delivery.</span>
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
