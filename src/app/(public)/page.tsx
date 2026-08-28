'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { QuickQuoteEstimator } from '@/components/forms/QuickQuoteEstimator';
import {
  ArrowRight,
  ShieldCheck,
  Plane,
  Ship,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Search,
  Building2,
  Award,
  Layers,
  Sparkles,
  ChevronRight,
  Check,
  Cpu,
  Radio,
  BadgeCheck,
} from 'lucide-react';

export default function LandingPage() {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);
  const [selectedHotspot, setSelectedHotspot] = useState<number>(1);

  // 3D Schematic Interactive Hotspots
  const schematicParts = [
    {
      id: 1,
      name: 'OEM LED Matrix Headlamp (L/H)',
      partNumber: '81110-0KP80',
      x: '24%',
      y: '32%',
      category: 'Lighting & Body',
      status: 'In Air Transit (NRT ✈ AKL)',
      landedCost: '$1,840 NZD',
      leadTime: '3 Days',
      fitment: '100% Guaranteed',
      origin: 'Tokyo OEM Depot',
    },
    {
      id: 2,
      name: 'Twin-Scroll Turbocharger Assembly',
      partNumber: '17201-0L041',
      x: '52%',
      y: '48%',
      category: 'Powertrain',
      status: 'Pre-Cleared NZ Customs',
      landedCost: '$2,450 NZD',
      leadTime: '3-4 Days',
      fitment: '100% Guaranteed',
      origin: 'Nagoya Central Hub',
    },
    {
      id: 3,
      name: 'Monobloc 4-Piston Caliper Kit',
      partNumber: '47730-0K310',
      x: '76%',
      y: '68%',
      category: 'Braking & Chassis',
      status: 'Dispatched Export Hub',
      landedCost: '$890 NZD',
      leadTime: '4 Days',
      fitment: '100% Guaranteed',
      origin: 'Melbourne Logistics',
    },
  ];

  const activePart = schematicParts.find((p) => p.id === selectedHotspot) || schematicParts[0];

  const workflowSteps = [
    {
      id: 1,
      number: '01',
      title: 'Submit Request',
      subtitle: 'VIN, OEM Details & Photos',
      description:
        'Enter VIN or chassis code, specify required part condition (New OEM, Grade A Used, or Certified), and attach damage photos for 100% fitment verification.',
      icon: FileCheck,
      details: [
        'Integrated Japanese, European & Trans-Tasman VIN lookup',
        'Upload damage photos & component labels directly',
        'Hoist urgency flags (Standard, Urgent, Critical VOR)',
      ],
      stageTag: 'PROCURLY_REQ_VALIDATE',
      metrics: 'Under 15 Mins Verification',
      codePreview: {
        vin: 'JTFBA32G0P004921',
        fitmentCheck: 'MATCH_CONFIRMED',
        oemRef: '81110-0KP80',
        biosecurityPreclear: true,
      },
    },
    {
      id: 2,
      number: '02',
      title: 'Sourcing & Quotation',
      subtitle: 'Global Network & Landed Cost',
      description:
        'The Autohub procurement team connects directly to trusted OEM suppliers across Japan, Australia, and Europe to calculate transparent landed NZD pricing.',
      icon: Layers,
      details: [
        'Verified supplier inventory checks in Tokyo & Melbourne',
        'All-inclusive pricing (Part + Freight + Duties + GST + Delivery)',
        'Zero surprise hidden customs or biosecurity brokerage fees',
      ],
      stageTag: 'GLOBAL_SUPPLIER_MATCH',
      metrics: 'Immediate / Under 2 Hours',
      codePreview: {
        supplierId: 'TYO-OEM-8891',
        currency: 'NZD_ALL_INCLUSIVE',
        dutyRate: '0.00% (Free Trade)',
        gstIncluded: true,
      },
    },
    {
      id: 3,
      number: '03',
      title: 'Freight Choice & Approval',
      subtitle: 'Express Air vs Consolidated Sea',
      description:
        'Compare side-by-side Air vs. Sea freight delivery timeframes and landed costs. Approve with one click to trigger immediate dispatch from overseas export depots.',
      icon: Plane,
      details: [
        'Priority Air: 3-5 Business Days to Auckland / Christchurch',
        'Consolidated Sea: 18-24 Days for heavy & non-urgent parts',
        'Instant credit account billing (20th month following)',
      ],
      stageTag: 'ROUTING_AIR_DISPATCH',
      metrics: 'Instant One-Click Approval',
      codePreview: {
        carrier: 'Air New Zealand Cargo (NZ90)',
        route: 'NRT -> AKL Direct',
        customsStatus: 'PRE_LODGED',
        dispatchWindow: '< 12 Hours',
      },
    },
    {
      id: 4,
      number: '04',
      title: 'Track to Delivery',
      subtitle: 'Live Workshop Delivery (AH-P-000123)',
      description:
        'Monitor live milestone tracking from foreign airport/port departure through NZ Customs & MPI clearance straight to your workshop hoist.',
      icon: Compass,
      details: [
        'Real-time flight (Air NZ) and vessel tracking numbers',
        'MPI biosecurity green-lane automated release status',
        'Direct delivery signature with forklift / dock coordination',
      ],
      stageTag: 'LAST_MILE_DELIVERY',
      metrics: 'Door-to-Hoist ETA Live',
      codePreview: {
        consignmentId: 'AH-P-000123',
        mpiClearance: 'APPROVED_GREEN_LANE',
        localCourier: 'Post Haste Logistics NZ',
        etaWorkshop: 'Tomorrow 11:30 AM',
      },
    },
  ];

  const dealershipLogos = [
    { name: 'Toyota Trade Network NZ', tag: 'TOYOTA TRADE NZ' },
    { name: 'European Specialist Workshops', tag: 'EURO SPECIALISTS' },
    { name: 'Giltrap Commercial Fleets', tag: 'GILTRAP FLEET' },
    { name: 'Armstrong Auto Group NZ', tag: "ARMSTRONG'S NETWORK" },
    { name: 'Commercial Fleets NZ', tag: 'COMMERCIAL FLEETS NZ' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-24 pb-16 sm:pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-brand-blue-navy text-white pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28">
        {/* Background Glows, Gradients & Tech Grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#172554] to-brand-blue opacity-95" />
        <div className="absolute inset-0 bg-grid-tech opacity-30 pointer-events-none" />

        {/* Ambient Radial Lights */}
        <div className="absolute top-1/2 right-10 -z-10 h-[280px] sm:h-[380px] w-[280px] sm:w-[380px] rounded-full bg-[#2b4499]/30 blur-[100px] sm:blur-[130px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 -z-10 h-[220px] sm:h-[300px] w-[220px] sm:w-[300px] rounded-full bg-brand-red/15 blur-[90px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
              {/* Top Badge */}
              <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-red-300 shadow-sm max-w-full">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-red stroke-[2.2] shrink-0" />
                <span>Autohub Global Supply Chain</span>
                <span className="text-white/40 hidden xs:inline">•</span>
                <span className="text-white font-bold">NZ Trade Only</span>
              </div>

              {/* Main Headline with Responsive Typography Hierarchy */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-[1.1] sm:leading-[1.08]">
                Precision B2B <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-200 to-white drop-shadow-sm">
                  Automotive Parts Sourcing
                </span>{' '}
                <span className="text-slate-100">& Global Logistics.</span>
              </h1>

              {/* Subheadline with Relaxed Leading */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl">
                Eliminate fragmented supplier messaging. One platform to request, quote, clear, and deliver verified vehicle parts door-to-door across New Zealand.
              </p>

              {/* Action CTAs: Full width on mobile, inline on tablet+ */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                <Link href="/requests/new" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto font-heading font-bold tracking-wide py-3 sm:py-3.5 px-6 sm:px-7 text-sm"
                  >
                    Submit a Part Request
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="outline-dark"
                    size="lg"
                    className="w-full sm:w-auto font-heading font-bold tracking-wide py-3 sm:py-3.5 px-6 sm:px-7 text-sm"
                  >
                    Register Trade Account
                  </Button>
                </Link>
              </div>

              {/* Responsive 3 Metric Counters */}
              <div className="pt-5 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/15">
                <div className="glass-pill p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">100%</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">NZ Trade Focused</p>
                </div>
                <div className="glass-pill p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">3-5 Days</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">Express Air Transit</p>
                </div>
                <div className="glass-pill p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">Landed</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">All-Inclusive NZD</p>
                </div>
              </div>
            </div>

            {/* Right Col: Dynamic 3D Glassmorphic Vehicle Schematic UI Card */}
            <div className="lg:col-span-6 relative w-full">
              <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-950/85 backdrop-blur-xl shadow-2xl overflow-hidden text-left relative group">
                {/* Schematic Top Navigation & Telemetry Bar */}
                <div className="p-3.5 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-brand-red/20 text-brand-red border border-brand-red/30 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading font-bold text-white tracking-wide truncate">
                          3D SCHEMATIC
                        </span>
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">
                        VIN: JTFBA32G0P••• • HILUX SR5
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 sm:px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Air Active
                  </span>
                </div>

                {/* 3D Wireframe / Vehicle Schematic Viewport */}
                <div className="relative h-56 sm:h-72 w-full bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
                  {/* Radar Scanning Line Animation */}
                  <div className="absolute inset-0 bg-grid-tech opacity-40" />
                  <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-radar-scan pointer-events-none" />

                  {/* Vehicle Wireframe Blueprint Graphic */}
                  <svg className="w-full h-full max-w-md opacity-85" viewBox="0 0 500 250" fill="none" stroke="currentColor">
                    {/* Chassis Outline */}
                    <path
                      d="M 50 160 L 90 160 L 110 120 L 170 120 L 220 70 L 340 70 L 400 120 L 450 130 L 460 160 L 420 160"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="opacity-60"
                    />
                    {/* Wheel Arche 1 */}
                    <circle cx="120" cy="165" r="28" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx="120" cy="165" r="14" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* Wheel Arche 2 */}
                    <circle cx="390" cy="165" r="28" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx="390" cy="165" r="14" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* Powertrain / Engine Bay Vector */}
                    <rect x="75" y="100" width="70" height="45" rx="6" stroke="#60a5fa" strokeWidth="1.5" fill="#1e3a8a" fillOpacity="0.25" />
                    {/* Cabin & Suspension Lines */}
                    <path d="M 215 75 L 345 75 L 385 120 L 200 120 Z" stroke="#38bdf8" strokeWidth="1.5" fill="#0284c7" fillOpacity="0.1" />
                    <line x1="120" y1="137" x2="120" y2="100" stroke="#f87171" strokeWidth="2" />
                    <line x1="390" y1="137" x2="390" y2="120" stroke="#f87171" strokeWidth="2" />
                  </svg>

                  {/* Interactive Hotspot Pins */}
                  {schematicParts.map((part) => {
                    const isSelected = selectedHotspot === part.id;
                    return (
                      <button
                        key={part.id}
                        onClick={() => setSelectedHotspot(part.id)}
                        style={{ left: part.x, top: part.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin transition-all focus:outline-none p-2"
                        aria-label={`Inspect ${part.name}`}
                      >
                        <span className="relative flex h-7 w-7 items-center justify-center">
                          {isSelected && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[10px] font-bold text-white shadow-lg transition-transform ${
                              isSelected
                                ? 'bg-brand-red scale-110 ring-4 ring-red-500/30'
                                : 'bg-slate-800 border border-white/40 hover:bg-brand-red hover:scale-110'
                            }`}
                          >
                            {part.id}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Hotspot Inspector & Live Consignment Telemetry Card */}
                <div className="p-3.5 sm:p-5 border-t border-white/10 bg-slate-900/90 text-white space-y-2.5 sm:space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono block truncate">
                        HOTSPOT {activePart.id} • OEM #{activePart.partNumber}
                      </span>
                      <h4 className="text-xs sm:text-sm font-heading font-bold text-white mt-0.5 truncate">
                        {activePart.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm sm:text-base font-heading font-extrabold text-white">
                        {activePart.landedCost}
                      </p>
                      <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                        {activePart.fitment}
                      </span>
                    </div>
                  </div>

                  {/* Flight & Clearance Status */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-[11px] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-300">
                      <span className="flex items-center gap-1.5 truncate">
                        <Plane className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        Air Cargo NZ90 (NRT ✈ AKL)
                      </span>
                      <span className="text-white font-bold shrink-0">ETA: Tomorrow 11:30 AM</span>
                    </div>

                    {/* Milestone Track Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-red-500 to-emerald-400 h-full w-[78%] rounded-full animate-pulse" />
                    </div>

                    <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400">
                      <span>Tokyo Export</span>
                      <span className="text-emerald-400 font-semibold">Customs Pre-Lodged</span>
                      <span>Penrose Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUE PROPOSITION (3-COLUMN GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <Award className="w-3.5 h-3.5" /> Built for NZ Automotive Professionals
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            The Purpose-Built Procurement Network for New Zealand Trade
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Designed to remove the friction of sourcing hard-to-find, late-model, and Japanese/European import vehicle components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">Coordination Layer</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Direct connection to global supplier networks in Japan, Australia, Europe, and North America. Every order undergoes physical VIN and parts diagram validation before shipping.
              </p>
            </div>
            <div className="pt-5 sm:pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-brand-red" />
              <span>100% Fitment Guarantee</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">Landed Cost Transparency</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Single all-inclusive quote covering overseas sourcing, international air/sea freight, export clearance, NZ customs duties, MPI biosecurity, and final-mile courier delivery.
              </p>
            </div>
            <div className="pt-5 sm:pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-brand-blue" />
              <span>No Surprise Import Fees</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">Door-to-Door Visibility</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Real-time milestone tracking from foreign warehouse dispatch to your workshop roller door. Complete tracking references with Air NZ cargo flight and local courier integrations.
              </p>
            </div>
            <div className="pt-5 sm:pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Consignment Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE QUICK QUOTE ESTIMATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Calculate Live Trade Sourcing Estimates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Select a common NZ vehicle to preview our landed cost structure with Air vs Sea freight choices.
          </p>
        </div>
        <QuickQuoteEstimator />
      </section>

      {/* 4. WORKFLOW EXPLAINER ("HOW PROCLURY WORKS" - 4-STEP INTERACTIVE STEPPER) */}
      <section className="bg-slate-900 text-white py-14 sm:py-16 lg:py-24 relative overflow-hidden">
        {/* Subtle Background Radial */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950/80 px-3.5 py-1 rounded-full border border-red-800/80">
              End-to-End Procurement Flow
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight">
              How Procurly Works
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              A 4-step streamlined process engineered to keep your hoists moving and eliminate supplier chasing.
            </p>
          </div>

          {/* Step Selector Tabs with Connecting Progress Rail */}
          <div className="relative mb-8 sm:mb-10">
            {/* Animated Horizontal Progress Rail Connector */}
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-slate-700/80 -translate-y-1/2 -z-0">
              <div
                className="h-full bg-gradient-to-r from-brand-red via-red-500 to-rose-400 transition-all duration-500 shadow-[0_0_12px_rgba(237,32,37,0.8)]"
                style={{ width: `${((activeWorkflowStep - 1) / 3) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10">
              {workflowSteps.map((s) => {
                const isActive = activeWorkflowStep === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveWorkflowStep(s.id)}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl text-left border transition-all duration-200 relative ${
                      isActive
                        ? 'bg-slate-800 border-t-4 border-t-brand-red border-red-500/40 text-white shadow-2xl ring-2 ring-red-500/20'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded ${
                          isActive ? 'bg-brand-red text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {s.number}
                      </span>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider truncate">
                      {s.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{s.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Showcase */}
          {(() => {
            const current = workflowSteps.find((s) => s.id === activeWorkflowStep) || workflowSteps[0];
            const Icon = current.icon;
            return (
              <div className="bg-slate-800/90 rounded-2xl sm:rounded-3xl border border-slate-700/90 p-5 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-red text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                          STAGE {current.number} OF 04 • {current.stageTag}
                        </span>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-white">
                          {current.title}: {current.subtitle}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                      {current.description}
                    </p>

                    <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                      {current.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <Link href="/requests/new">
                        <Button variant="primary" size="md" className="font-heading font-bold text-xs">
                          Try Submitting a Request
                        </Button>
                      </Link>
                      <button
                        onClick={() =>
                          setActiveWorkflowStep((prev) => (prev % workflowSteps.length) + 1)
                        }
                        className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Col: Sleek macOS App Frame Window Mockup */}
                  <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden text-left font-mono w-full">
                    {/* macOS Window Controls Header */}
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                        <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                        <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                        <span className="ml-2 text-[11px] text-slate-400 font-sans font-medium truncate">
                          PROCURLY_PIPELINE.sh
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                        VERIFIED
                      </span>
                    </div>

                    {/* Window Content with Horizontal Scroll Protection */}
                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 text-xs">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                        <span>METRIC:</span>
                        <span className="text-emerald-400 font-bold">{current.metrics}</span>
                      </div>

                      {/* Code Telemetry Block */}
                      <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] sm:text-[11px] space-y-1.5 text-slate-300 overflow-x-auto custom-scrollbar">
                        <p className="text-slate-500">// Real-time pipeline payload</p>
                        <p>
                          <span className="text-rose-400">stage:</span>{' '}
                          <span className="text-amber-300">&quot;{current.stageTag}&quot;</span>,
                        </p>
                        {Object.entries(current.codePreview).map(([key, val]) => (
                          <p key={key} className="whitespace-nowrap">
                            <span className="text-blue-400">{key}:</span>{' '}
                            <span className="text-emerald-300">{JSON.stringify(val)}</span>,
                          </p>
                        ))}
                        <p className="text-slate-400 whitespace-nowrap">
                          <span className="text-purple-400">nz_brokerage:</span> &quot;MPI_GREEN_LANE_READY&quot;
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1">
                        <span>Infrastructure:</span>
                        <span className="text-white font-semibold">Autohub Direct Bonded Hubs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. SOCIAL PROOF & TRUST SECTION (UPGRADED WORKSHOP SCENE & LOGO CLOUD) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Authentic NZ Workshop Scene Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
              <div className="aspect-[4/3] relative w-full">
                <Image
                  src="https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern automotive workshop bay with diagnostic equipment"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating Quality Badge */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl glass-dark border border-white/20 text-white">
                <div className="flex items-center gap-2 text-red-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <BadgeCheck className="w-4 h-4 shrink-0" />
                  <span>NZ Workshop Quality Standard</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold mt-1">
                  100% Fitment Certified prior to international air dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Building2 className="w-3.5 h-3.5" /> Autohub Group Heritage
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Trusted by Hundreds of New Zealand Dealerships & Repairers
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Autohub has pioneered vehicle logistics between Japan, the UK, Australia, and New Zealand for over two decades. Procurly extends this world-class infrastructure directly to parts procurement for trade workshops.
            </p>

            {/* Dealership Logo Cloud Grid: Responsive columns */}
            <div className="pt-1 sm:pt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Supporting NZ Dealer & Trade Networks:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {dealershipLogos.map((logo, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-center hover:bg-white hover:shadow-subtle transition-all"
                  >
                    <span className="text-[10px] sm:text-[11px] font-heading font-bold text-slate-700 tracking-tight block truncate">
                      {logo.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Glowing Feature Cards */}
            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
              <div className="flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-subtle">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#2b4499]/10 text-brand-blue border border-[#2b4499]/20 shrink-0">
                  <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">Direct Customs Bonded Facilities</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Faster MPI biosecurity clearance and direct tariff filing with NZ Customs Service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-subtle">
                <div className="p-2 sm:p-2.5 rounded-xl bg-brand-red/10 text-brand-red border border-brand-red/20 shrink-0">
                  <Truck className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">Regional Delivery Hubs</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Penrose (Auckland) and Middleton (Christchurch) cross-dock hubs for rapid local delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/register" className="inline-block w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-heading font-bold text-xs tracking-wide">
                  Open Your Trade Account Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP (WITH DIAGONAL MESH GRADIENT & AMBIENT GLOW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gradient-cta-mesh rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left border border-white/15">
          {/* Ambient Glows & Grid */}
          <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-red/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -mb-20 w-60 h-60 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-2 sm:space-y-3">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">
                Ready to Streamline Your Workshop Parts Sourcing?
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">
                Get started in under 3 minutes. Experience transparent landed quotes, verified fitments, and door-to-door delivery across NZ.
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
      </section>
    </div>
  );
}
