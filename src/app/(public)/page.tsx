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
} from 'lucide-react';

export default function LandingPage() {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);
  const [quickTrackQuery, setQuickTrackQuery] = useState('');

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
        'Upload damage photos & component labels',
        'Hoist urgency flags (Standard, Urgent, Critical VOR)',
      ],
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
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-brand-blue-navy text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background Glows & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#1c2a5c] to-brand-blue opacity-95" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-red/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-red-300">
                <ShieldCheck className="w-4 h-4 text-brand-red" />
                <span>Autohub Global Automotive Supply Chain</span>
                <span className="text-white/40">•</span>
                <span className="text-white">NZ Trade Only</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Precision B2B <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-200 to-white">
                  Automotive Parts Sourcing
                </span>{' '}
                & Global Logistics.
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Eliminate fragmented supplier messaging. One platform to request, quote, clear, and deliver vehicle parts door-to-door across New Zealand.
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/requests/new">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto font-bold tracking-wide shadow-glow py-3.5 px-7"
                  >
                    Submit a Part Request
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto font-bold tracking-wide border-white/30 text-white hover:bg-white/10 py-3.5 px-7"
                  >
                    Register Trade Account
                  </Button>
                </Link>
              </div>

              {/* Hero Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
                  <p className="text-xs text-slate-400">NZ Trade Focused</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">3-5 Days</p>
                  <p className="text-xs text-slate-400">Express Air Transit</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">Landed</p>
                  <p className="text-xs text-slate-400">All-Inclusive NZD</p>
                </div>
              </div>
            </div>

            {/* Right Col: Hero Dynamic Logistics Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
                <div className="aspect-[4/3] relative w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                    alt="Modern logistics warehouse and shipping container hub"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                </div>

                {/* Floating Tracking Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass-dark border border-white/20 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-red-400">
                      LIVE CONSIGNMENT: AH-P-000123
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      In Transit - Air
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate">
                    Toyota Hilux SR5 - OEM LED Headlight Assembly
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Narita (NRT) ✈ Auckland (AKL)</span>
                    <span className="font-semibold text-white">ETA: Tomorrow 11:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUE PROPOSITION (3-COLUMN GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <Award className="w-3.5 h-3.5" /> Built for NZ Automotive Professionals
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Purpose-Built Procurement Network for New Zealand Trade
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Designed to remove the friction of sourcing hard-to-find, late-model, and Japanese/European import vehicle components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Coordination Layer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct connection to global supplier networks in Japan, Australia, Europe, and North America. Every order undergoes physical VIN and parts diagram validation before shipping.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-brand-red" />
              <span>100% Fitment Guarantee</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Landed Cost Transparency</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Single all-inclusive quote covering overseas sourcing, international air/sea freight, export clearance, NZ customs duties, MPI biosecurity, and final-mile courier delivery.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-brand-blue" />
              <span>No Surprise Import Fees</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Door-to-Door Visibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time milestone tracking from foreign warehouse dispatch to your workshop roller door. Complete tracking references with Air NZ cargo flight and local courier integrations.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Consignment Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE QUICK QUOTE ESTIMATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Calculate Live Trade Sourcing Estimates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Select a common NZ vehicle to preview our landed cost structure with Air vs Sea freight choices.
          </p>
        </div>
        <QuickQuoteEstimator />
      </section>

      {/* 4. WORKFLOW EXPLAINER ("HOW PROCLURY WORKS") */}
      <section className="bg-slate-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950 px-3 py-1 rounded-full border border-red-800">
              End-to-End Procurement Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Procurly Works
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              A 4-step streamlined process engineered to keep your hoists moving and eliminate supplier chasing.
            </p>
          </div>

          {/* Step Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {workflowSteps.map((s) => {
              const isActive = activeWorkflowStep === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveWorkflowStep(s.id)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-brand-red border-red-400 text-white shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold opacity-80">{s.number}</span>
                    <Icon className="w-4 h-4 opacity-90" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide">{s.title}</p>
                  <p className="text-[11px] opacity-80 truncate">{s.subtitle}</p>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase */}
          {(() => {
            const current = workflowSteps.find((s) => s.id === activeWorkflowStep) || workflowSteps[0];
            const Icon = current.icon;
            return (
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-8 lg:p-12 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-red text-white flex items-center justify-center font-bold text-lg shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-red-400">
                          STEP {current.number} OF 04
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white">
                          {current.title}: {current.subtitle}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {current.description}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {current.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <Link href="/requests/new">
                        <Button variant="primary" size="md" className="font-bold text-xs">
                          Try Submitting a Request
                        </Button>
                      </Link>
                      <button
                        onClick={() =>
                          setActiveWorkflowStep((prev) => (prev % workflowSteps.length) + 1)
                        }
                        className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Col: Diagram Preview Card */}
                  <div className="lg:col-span-5 bg-slate-900/90 rounded-xl p-6 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-mono text-slate-400">PROCURLEY_WORKFLOW.STAGE_{current.number}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                        AUTOHUB VERIFIED
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                        <span className="text-slate-400">Action:</span>
                        <span className="font-bold text-white">{current.title}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                        <span className="text-slate-400">Target Time:</span>
                        <span className="font-bold text-red-400">Immediate / Under 2 Hours</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                        <span className="text-slate-400">Biosecurity & Customs:</span>
                        <span className="font-bold text-emerald-400">Pre-Cleared</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic text-center pt-2">
                      Backed by 25+ years of Autohub global automotive transport infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. TRUST & TRADE CREDENTIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
              <div className="aspect-[4/3] relative w-full">
                <Image
                  src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80"
                  alt="Professional automotive technician inspecting vehicle chassis"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Float badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-dark border border-white/20 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                  NZ Workshop Quality Standard
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  100% Fitment Certified prior to international air dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Building2 className="w-3.5 h-3.5" /> Autohub Group Heritage
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Hundreds of New Zealand Dealerships & Repairers
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Autohub has pioneered vehicle logistics between Japan, the UK, Australia, and New Zealand for over two decades. Procurly extends this world-class infrastructure directly to parts procurement for trade workshops.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Direct Customs Bonded Facilities</h4>
                  <p className="text-xs text-slate-600">
                    Faster MPI biosecurity clearance and direct tariff filing with NZ Customs Service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <Truck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Regional Delivery Hubs</h4>
                  <p className="text-xs text-slate-600">
                    Penrose (Auckland) and Middleton (Christchurch) cross-dock hubs for rapid local delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/register">
                <Button variant="primary" size="lg" className="font-bold text-xs tracking-wide">
                  Open Your Trade Account Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-blue-navy to-brand-blue rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-red/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Streamline Your Workshop Parts Sourcing?
              </h3>
              <p className="text-sm sm:text-base text-blue-100 max-w-2xl">
                Get started in under 3 minutes. Experience transparent landed quotes, verified fitments, and door-to-door delivery across NZ.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link href="/requests/new">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold text-xs tracking-wide shadow-glow"
                >
                  Submit a Part Request
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-bold text-xs tracking-wide border-white/40 text-white hover:bg-white/10"
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
