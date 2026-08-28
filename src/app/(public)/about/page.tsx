'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Building2,
  Award,
  Users,
  CheckCircle2,
  MapPin,
  Globe,
  Plane,
  Truck,
  PackageCheck,
  Clock,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Zap,
  CreditCard,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-brand-blue-navy text-white pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#172554] to-brand-blue opacity-95" />
        <div className="absolute inset-0 bg-grid-tech opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-[#2b4499]/30 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-widest bg-blue-950/80 px-3.5 py-1 rounded-full border border-blue-800/80 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-blue-400" /> 25+ Years Autohub Automotive Legacy
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Pioneering Automotive Supply Chains & Trade Procurement
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Procurly was engineered by Autohub to solve the greatest challenge facing New Zealand dealerships, collision repairers, and specialist workshops: fragmented, slow, and opaque vehicle parts sourcing.
          </p>

          {/* Key Metric Counters in Hero */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="glass-pill p-3 sm:p-4 rounded-2xl border border-white/15 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white">250,000+</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5">Vehicles Shipped</p>
            </div>
            <div className="glass-pill p-3 sm:p-4 rounded-2xl border border-white/15 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-emerald-400">15,000+</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5">Sourced Parts Delivered</p>
            </div>
            <div className="glass-pill p-3 sm:p-4 rounded-2xl border border-white/15 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-red-400">100%</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5">Landed Price Guarantee</p>
            </div>
            <div className="glass-pill p-3 sm:p-4 rounded-2xl border border-white/15 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-blue-300">4 Gateways</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5">NZ & Overseas Hubs</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STORY & MISSION (PURE WHITE) */}
      <section className="w-full bg-white border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200 uppercase">
                  Our Evolution
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                  From Complete Vehicle Logistics to Precision Component Sourcing
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                  For over two decades, Autohub has stood at the core of the New Zealand automotive import trade, moving hundreds of thousands of motor vehicles seamlessly across Japan, the United Kingdom, Australia, and New Zealand.
                </p>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                  With the rapid evolution of modern vehicle technology—complex ADAS sensors, hybrid inverters, specialized European platforms, and JDM chassis variants—workshops began facing severe parts availability bottlenecks. Sourcing required contacting dozens of unverified suppliers, guessing import duties, and waiting weeks on hoists.
                </p>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                  Procurly was built to modernize this process: an intelligent digital platform backed by Autohub’s established bonded freight infrastructure, licensed customs brokers, and direct overseas supplier relationships.
                </p>
              </div>

              {/* Verified Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">MPI Biosecurity</span>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Facility Filing
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Customs Brokerage</span>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" /> Fast-Track Green Lanes
                  </p>
                </div>
              </div>
            </div>

            {/* Right Full-Height Image Card */}
            <div className="lg:col-span-6 flex flex-col h-full">
              <div className="relative flex-1 min-h-[440px] sm:min-h-[520px] lg:min-h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
                <Image
                  src="/images/parts-inspection.jpg"
                  alt="Autohub Certified Bonded Parts Inspection Facility and Technical Testing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-20">
                  <div className="glass-dark px-3.5 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold">Certified Bonded Inspection Hub</span>
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl glass-dark border border-white/20 text-white shadow-2xl backdrop-blur-md">
                  <p className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider">
                    Precision Quality Assurance
                  </p>
                  <p className="text-xs sm:text-sm font-semibold mt-1 text-slate-100 leading-relaxed">
                    Every sourced part undergoes barcode logging, physical fitment checks, and damage inspection before international air dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GLOBAL SOURCING NETWORK & REGIONAL INFRASTRUCTURE (SOFT SLATE) */}
      <section className="w-full bg-slate-50/90 border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Globe className="w-3.5 h-3.5" /> International Logistics Footprint
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Physical Gateways & Cross-Dock Distribution Hubs
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Direct, bonded physical operations across key international export origins and nationwide New Zealand receiving centres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {BRAND.contact.hubs.map((hub, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-red uppercase tracking-wider">
                      {hub.region}
                    </span>
                    <h4 className="text-lg font-heading font-bold text-slate-900 mt-0.5">
                      {hub.city} Hub
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hub.address}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cross-Dock Active
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">{hub.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AIR & SEA FREIGHT CAPABILITIES (PURE WHITE) */}
      <section className="w-full bg-white border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Full-Height Air Cargo Image */}
            <div className="lg:col-span-6 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group h-80 sm:h-96 lg:h-[440px]">
              <Image
                src="/images/air-cargo-export.jpg"
                alt="Autohub Global Logistics Air Cargo Boeing 777 at Airport Terminal"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

              {/* Floating Air Freight Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="glass-dark px-3.5 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-lg backdrop-blur-md">
                  <Plane className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-[11px] font-bold font-mono">Autohub Direct Cargo Lanes</span>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="glass-dark p-3.5 rounded-xl border border-white/20 text-white flex items-center justify-between shadow-xl backdrop-blur-md">
                  <span className="text-xs font-bold">Scheduled Air Cargo Routes</span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                    Daily Flights NZ / QF
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase">
                Logistics Powerhouse
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                End-to-End Customs Bonded Supply Lines
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                By controlling the entire logistics chain from depot collection in Tokyo or Munich to hoist delivery in Penrose or Middleton, Procurly eliminates third-party freight forwarding markups and customs clearance delays.
              </p>

              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span><strong>Direct Importer of Record:</strong> Autohub manages all tariff classifications and MPI documentation directly with New Zealand government agencies.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span><strong>Priority Airline Allocations:</strong> Guaranteed freight space on daily wide-body flights between Tokyo (NRT/HND), Sydney (SYD), and Auckland (AKL).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <span><strong>Dedicated Regional Delivery:</strong> Final-mile transport vehicles equipped for fragile automotive glass, body shells, and heavy powertrains.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4 CORE TRADE COMMITMENTS (SOFT SLATE) */}
      <section className="w-full bg-slate-50/90 border-b border-slate-200/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <Award className="w-3.5 h-3.5" /> Built Exclusively For Trade
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Our Core Commitments to Kiwi Workshops
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Every feature on the Procurly platform is designed around the operational realities of automotive repair businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">Exact Landed Price Lock</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The landed quote you approve is the exact amount billed on your invoice. No surprises.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">Rapid Hoist Turnover</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency VOR priority flight allocations get critical parts to your hoists in 3-5 days.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">20th Month Credit Terms</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smooth your workshop cashflow with consolidated monthly invoicing across all sourced parts.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900">Dedicated NZ Concierges</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct phone and digital support from NZ-based parts sourcing specialists who know vehicle chassis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA STRIP */}
      <section className="w-full py-16 sm:py-20 lg:py-24 bg-slate-50/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-cta-mesh rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left border border-white/15">
            <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-red/25 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-8 space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">
                  Partner with New Zealand&apos;s Leading Sourcing Platform
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">
                  Join hundreds of verified New Zealand automotive dealerships and repairers using Procurly for daily parts procurement.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center w-full">
                <Link href="/register" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-heading font-bold text-xs tracking-wide shadow-glow"
                  >
                    Register Verified Trade
                  </Button>
                </Link>
                <Link href="/contact" className="w-full">
                  <Button
                    variant="outline-dark"
                    size="lg"
                    className="w-full font-heading font-bold text-xs tracking-wide"
                  >
                    Contact Procurement Team
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
