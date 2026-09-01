'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import {
  FileCheck,
  Search,
  Plane,
  Ship,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Truck,
  Building2,
  Clock,
  Layers,
  Sparkles,
  Radio,
  BadgeCheck,
  PackageCheck,
  CreditCard,
  Zap,
  Check,
  Cpu,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-brand-blue-navy text-white pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#172554] to-brand-blue opacity-95" />
        <div className="absolute inset-0 bg-grid-tech opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 right-10 -z-10 h-[300px] w-[300px] rounded-full bg-[#2b4499]/30 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 uppercase tracking-widest bg-red-950/80 px-3.5 py-1 rounded-full border border-red-800/80 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-red-400" /> End-to-End Procurement Flow
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            How Procurly Simplifies B2B Vehicle Parts Procurement
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            From Japanese and European OEM export hubs to your workshop hoists in New Zealand. A transparent, automated 4-stage pipeline engineered to keep your hoists turning.
          </p>

          {/* Quick-Jump Stage Pills */}
          <div className="pt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { num: '01', title: 'Digital Request & Fitment Verification' },
              { num: '02', title: 'Global Sourcing & Landed Quote' },
              { num: '03', title: 'Export Crating & Air Dispatch' },
              { num: '04', title: 'Bonded Clearance & Hoist Delivery' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="glass-pill px-3.5 py-2 rounded-xl border border-white/15 text-xs font-medium text-slate-200 flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-md bg-brand-red text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {step.num}
                </span>
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stage 01: Vehicle Intake & Fitment Verification */}
      <section id="stage-1" className="py-12 sm:py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-brand-red text-xs font-bold font-mono tracking-wide border border-red-200 uppercase">
                Stage 01 • Vehicle Verification
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Request Submission & Vehicle Fitment Verification
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                When a vehicle arrives at your workshop with damaged, missing, or unavailable components, submit a request via Procurly using the VIN, chassis code (e.g. GUN126R, ZE1, G20), or OEM part number. You can attach photos of the vehicle identification plate or damaged assembly directly.
              </p>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span><strong>17-Digit VIN & Chassis Verification:</strong> Manually entered VINs cross-referenced by specialists against Japanese Domestic Market (JDM), European, Australian, and US OEM parts catalogs.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span><strong>Condition Filtering:</strong> Choose between Brand New OEM, Grade A Inspected Used, or Certified Reconditioned components.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span><strong>VOR Priority Flagging:</strong> Mark urgent vehicle-off-road jobs for emergency airline slot allocations.</span>
                </div>
              </div>
            </div>

            {/* Right Telemetry Card */}
            <div className="lg:col-span-6 bg-slate-950 rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white border border-slate-800 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs text-slate-400 font-sans font-bold">EPC_VALIDATION_MATRIX.ts</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">Chassis Identification</span>
                  <p className="text-white font-bold">VIN: MR0HA3CD6K0129482 • Toyota Hilux (GUN126R)</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">Requested Component</span>
                  <p className="text-amber-300 font-bold">OEM #81110-0KP70 • Front RH Bi-Beam LED Headlamp Assembly</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">JDM / NZ Spec Match:</span>
                    <span className="text-emerald-400 font-bold">100% Guaranteed Fitment</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Available Stock:</span>
                    <span className="text-blue-400 font-bold">Yokohama Direct & Nagoya Hub (x3 Units)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 2: GLOBAL SOURCING & GUARANTEED LANDED QUOTE (SOFT SLATE) */}
      <section className="w-full bg-slate-50/90 border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Landed Matrix Preview Card */}
            <div className="lg:col-span-6 lg:order-1 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-elevated space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
                    <CreditCard className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-heading font-bold text-slate-900">
                      Guaranteed Landed Cost Breakdown
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">QUOTE #PQ-2026-8941</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  Fixed Price Locked
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Genuine OEM Part (Ex-Works Tokyo):</span>
                  <span className="font-semibold text-slate-900">$1,450.00 NZD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Priority Air Cargo Freight (Air NZ Direct):</span>
                  <span className="font-semibold text-slate-900">$290.00 NZD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">NZ Customs Duty & MPI Biosecurity Pre-Clearance:</span>
                  <span className="font-semibold text-slate-900">$55.00 NZD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">NZ Goods & Services Tax (GST 15%):</span>
                  <span className="font-semibold text-slate-900">$269.25 NZD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Local Penrose Cross-Dock Hoist Delivery:</span>
                  <span className="font-semibold text-slate-900">$45.00 NZD</span>
                </div>
                <div className="flex justify-between pt-3 text-base sm:text-lg font-heading font-black text-brand-red">
                  <span>Total Landed Door-to-Door:</span>
                  <span>$2,109.25 NZD</span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 lg:order-2 space-y-4 sm:space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase">
                Stage 02 • Global Sourcing
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Direct Supplier Sourcing & Locked Landed Cost Quotation
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Autohub’s international parts specialists in Tokyo, Nagoya, Sydney, and Munich query authorized OEM distributor networks and certified dismantling partners. We calculate the exact landed cost—including freight, tariffs, and GST—before you spend a dollar.
              </p>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span><strong>Zero Hidden Import Charges:</strong> The price quoted is the exact total billed. No unexpected biosecurity hold fees or carrier surcharges.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span><strong>Flexible Transit Modes:</strong> Compare 3-5 day Priority Air vs 18-24 day Consolidated Sea Freight side-by-side.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span><strong>Trade Credit Alignment:</strong> Approve quotes with 1-click and consolidate onto your 20th of the month trade account.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 3: EXPORT CRATING & AIR FREIGHT (PURE WHITE) */}
      <section className="w-full bg-white border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
                Stage 03 • Secure Export
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Depot Physical Inspection, Protective Crating & Air Transit
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Once a quote is approved, components arrive at our overseas export depot. Certified technicians perform physical fitment and cosmetic audits, encase fragile panels in custom heavy-duty protective crating, and load consignments onto scheduled international flights.
              </p>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Impact-Resistant Packaging:</strong> Double-walled corrugated boxing and timber crating for body panels, windshields, and headlamps.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Daily Air Cargo Allocations:</strong> Guaranteed cargo space with Air New Zealand, Qantas, and Singapore Airlines.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Live Telemetry Tracking:</strong> Track flight progress and customs pre-lodgement in real time from your Procurly dashboard.</span>
                </div>
              </div>
            </div>

            {/* Right Full-Height Image Card */}
            <div className="lg:col-span-6 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group h-80 sm:h-96 lg:h-[440px]">
              <Image
                src="/images/air-cargo-export.jpg"
                alt="Autohub Global Logistics Air Cargo Boeing 777 Loading at International Airport"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Floating Flight Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="glass-dark px-3.5 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-lg backdrop-blur-md">
                  <Plane className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-[11px] font-bold font-mono">Flight NZ90 • NRT ✈ AKL</span>
                </div>
              </div>

              {/* Floating QA Tag */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="glass-dark p-3.5 rounded-xl border border-white/20 text-white flex items-center justify-between shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold">Physical Inspection Passed</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                    AWB #086-49219482
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STAGE 4: BONDED CLEARANCE & HOIST DELIVERY (SOFT SLATE) */}
      <section className="w-full bg-slate-50/90 border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Full-Height Workshop Image Card */}
            <div className="lg:col-span-6 lg:order-1 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group h-80 sm:h-96 lg:h-[440px]">
              <Image
                src="/images/workshop-heritage.jpg"
                alt="Delivered parts installed on automotive workshop hoist in New Zealand"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Floating Delivery Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="glass-dark px-3.5 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-lg backdrop-blur-md">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold">Penrose Express Final-Mile</span>
                </div>
              </div>

              {/* Floating Handover HUD */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="glass-dark p-3.5 rounded-xl border border-white/20 text-white space-y-1 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400">✓ Delivered & Handed Over</span>
                    <span className="text-slate-300 font-mono text-[10px]">Today 11:24 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Signed: Marcus H. • Apex Euro Specialists (Bay 2 Hoist)</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 lg:order-2 space-y-4 sm:space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 uppercase">
                Stage 04 • Final-Mile Delivery
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Bonded Customs Clearance & Direct Workshop Delivery
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Consignments enter our bonded facility at Auckland International Airport. Autohub acts as the importer of record, managing immediate MPI biosecurity clearance and direct tariff filing with NZ Customs before dispatching straight to your workshop hoists.
              </p>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Green-Lane Customs Clearance:</strong> Autohub direct electronic tariff submission prevents airport terminal hold delays.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Direct Hoist-Side Handover:</strong> Regional courier fleets in Auckland, Hamilton, Wellington, and Christchurch deliver directly to your bays.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Consolidated Tax Invoicing:</strong> Sourced parts, international freight, and local logistics merged into a single NZ IRD compliant tax invoice.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 TRADE GUARANTEES (PURE WHITE) */}
      <section className="w-full bg-white border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Built For The Automotive Trade
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Our 4 Pillars of Trade Trust
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Why leading New Zealand dealerships, panel shops, and mechanics trust Procurly for daily parts procurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">100% Fitment Guarantee</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-checked against global manufacturer EPC databases prior to overseas crating.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">3-5 Days Priority Air</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                VOR priority flight allocations get vehicle parts to your hoists in record time.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">20th Month Terms</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidated monthly invoicing keeps your workshop cashflow smooth and predictable.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <PackageCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">Zero Hidden MPI Fees</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Biosecurity clearance, customs duty, and GST are pre-cleared transparently in our quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="w-full py-16 sm:py-20 lg:py-24 bg-slate-50/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-cta-mesh rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left border border-white/15">
            <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-red/25 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-8 space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">
                  Ready to Experience Seamless Parts Procurement?
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">
                  Submit a part request in seconds or register your trade account to unlock wholesale pricing and consolidated credit terms.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center w-full">
                <Link href="/requests/new" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-heading font-bold text-xs tracking-wide shadow-glow"
                  >
                    Submit a Part Request
                  </Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button
                    variant="outline-dark"
                    size="lg"
                    className="w-full font-heading font-bold text-xs tracking-wide"
                  >
                    Register Verified Trade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
