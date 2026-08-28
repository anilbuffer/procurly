'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Clock,
  Building2,
  BadgeCheck,
  Globe,
  Radio,
  Send,
  Sparkles,
  Plane,
  Ship,
  Lock,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function Footer() {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 5000);
      setSubscribedEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. TOP OPERATIONAL STATUS & VALUE STRIP */}
      <div className="border-b border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8 bg-slate-900/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-0 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Live Operational Status */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              GLOBAL LOGISTICS NETWORK ACTIVE
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400">
              Air NZ Cargo (Tokyo ✈ AKL) & Melbourne Depots Operating at Full Capacity
            </span>
          </div>

          {/* Quick Urgency Hotline Pill */}
          <a
            href="tel:08002886482"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/15 hover:bg-brand-red/25 border border-brand-red/30 text-red-300 transition-all font-heading font-bold"
          >
            <Phone className="w-3.5 h-3.5 text-brand-red animate-pulse" />
            <span>24/7 VOR Parts Hotline: 0800 288 6482</span>
          </a>
        </div>
      </div>

      {/* 2. VALUE PROPOSITION TRIPLE CARDS */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-start gap-4 p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
              <div className="p-3 rounded-2xl bg-brand-red/20 text-brand-red shrink-0 border border-brand-red/30 shadow-sm">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-heading font-bold flex items-center gap-1.5">
                  100% Fitment Guaranteed
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Chassis and parts diagram cross-validation prior to overseas flight departure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
              <div className="p-3 rounded-2xl bg-brand-blue/30 text-blue-400 shrink-0 border border-blue-500/30 shadow-sm">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-heading font-bold">Landed NZD Pricing</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Consolidated single tax invoice including air freight, customs, MPI & GST.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 sm:p-6 hover:bg-white/[0.02] transition-colors">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30 shadow-sm">
                <MapPin className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-heading font-bold">Door-to-Hoist Delivery</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Rapid regional courier dispatch from Auckland & Christchurch cross-dock depots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN FOOTER GRID */}
      <div className="max-w-7xl mx-auto px-4 lg:px-0 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand & Sourcing Newsletter (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-red to-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/20 border border-white/20">
                <Box className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white tracking-tight font-heading">Procurly</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30">
                    B2B TRADE
                  </span>
                </div>
                <span className="text-xs block font-semibold text-slate-400">
                  by Autohub New Zealand Limited
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Precision B2B automotive parts sourcing and global freight platform. Engineered exclusively for New Zealand franchised dealerships, commercial fleet operators, and certified collision workshops.
            </p>

            {/* Newsletter / Trade Alerts Form */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-red" />
                Trade Stock & Freight Alerts
              </span>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="Enter workshop work email..."
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="bg-brand-red hover:bg-red-600 text-white p-2.5 rounded-xl shrink-0 transition-colors shadow-md focus:outline-none"
                  aria-label="Subscribe to trade updates"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {isSubscribed && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed to trade logistics bulletins.
                </p>
              )}
            </div>

            {/* Direct Contact Details */}
            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <a
                href="tel:08002886482"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-red shrink-0" />
                <span>0800 288 6482 (Toll Free NZ) / +64 9 525 6800</span>
              </a>
              <a
                href="mailto:procurement@procurly.autohub.co.nz"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-red shrink-0" />
                <span>procurement@procurly.autohub.co.nz</span>
              </a>
            </div>
          </div>

          {/* Col 2: Platform Navigation (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How Procurly Works
                </Link>
              </li>
              <li>
                <Link href="/requests/new" className="hover:text-white transition-colors flex items-center gap-1">
                  Submit Part Request <ArrowUpRight className="w-3.5 h-3.5 text-brand-red" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register Trade Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Trade Portal Sign In
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Autohub Heritage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Dashboards (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Portals & Workflows</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dealer Portal
                </Link>
              </li>
              <li>
                <Link href="/procurement/dashboard" className="hover:text-white transition-colors">
                  Procurement Console
                </Link>
              </li>
              <li>
                <Link href="/operations/dashboard" className="hover:text-white transition-colors">
                  Operations & Freight
                </Link>
              </li>
              <li>
                <Link href="/finance/dashboard" className="hover:text-white transition-colors">
                  Finance & Accounts
                </Link>
              </li>
              <li>
                <Link href="/procurement/quote-comparison" className="hover:text-white transition-colors">
                  Quote Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/procurement/tracking" className="hover:text-white transition-colors">
                  Consignment Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Global Sourcing Lanes (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Global Sourcing Lanes</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-3 h-3 text-blue-400" /> Japan (Tokyo/Nagoya)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Daily Express Flights</span>
              </li>
              <li className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-3 h-3 text-blue-400" /> Australia (Trans-Tasman)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">2-3 Business Days</span>
              </li>
              <li className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-3 h-3 text-blue-400" /> Europe & UK OEM
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Priority Munich/Frankfurt</span>
              </li>
              <li className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Ship className="w-3 h-3 text-emerald-400" /> Consolidated Sea
                  </span>
                </div>
                <span className="text-[10px] text-blue-300 font-mono">Yokohama & Tauranga Port</span>
              </li>
            </ul>
          </div>

          {/* Col 5: NZ Regional Logistics Hubs (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NZ Logistics Hubs</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <p className="font-bold text-slate-200">Auckland Central Hub</p>
                <p className="text-slate-400 text-[11px] mt-0.5">142 Neilson St, Penrose, Auckland</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <p className="font-bold text-slate-200">Christchurch Hub</p>
                <p className="text-slate-400 text-[11px] mt-0.5">55 Lunns Road, Middleton, CHC</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <p className="font-bold text-slate-200">Wellington Depot</p>
                <p className="text-slate-400 text-[11px] mt-0.5">8 Seaview Road, Lower Hutt</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. INDUSTRY ACCREDITATION & TRUST BADGES */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-brand-red shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">NZ Customs Service</p>
              <p className="text-[10px] text-slate-400">Bonded Importer of Record</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">MPI Biosecurity</p>
              <p className="text-[10px] text-slate-400">Green-Lane Pre-Cleared</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">MTA NZ Aligned</p>
              <p className="text-[10px] text-slate-400">Motor Trade Association</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">256-Bit SSL Encrypted</p>
              <p className="text-[10px] text-slate-400">Bank-Grade Data Security</p>
            </div>
          </div>
        </div>

        {/* 5. BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Autohub Logistics Limited. All rights reserved. Procurly™ is a registered trademark.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Trade
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Trade Credit Conditions
            </Link>
            <span className="text-slate-600 font-mono">NZBN: 9429038201948</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

