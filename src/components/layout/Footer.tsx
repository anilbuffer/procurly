import React from 'react';
import Link from 'next/link';
import { Box, ShieldCheck, Phone, Mail, MapPin, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-brand-blue-navy text-white border-t border-slate-800">
      {/* Top Banner / Value Strip */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-lg bg-brand-red/20 text-brand-red">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100% Fitment Guaranteed</h4>
              <p className="text-xs text-slate-400">Physical VIN validation prior to overseas dispatch.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-lg bg-brand-blue/30 text-blue-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Transparent Landed Pricing</h4>
              <p className="text-xs text-slate-400">Single all-inclusive NZD quote. No surprise customs fees.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Nationwide Door Delivery</h4>
              <p className="text-xs text-slate-400">Direct courier to workshops across North & South Island.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white font-black text-xl shadow-md">
                <Box className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white tracking-tight">Procurly</span>
                <span className="text-xs block font-bold text-brand-blue-subtle uppercase tracking-wider">
                  by Autohub New Zealand
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Precision B2B automotive parts sourcing and global logistics platform. Engineered exclusively for New Zealand franchised dealerships, collision repairers, and mechanical workshops.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-red" />
                <span>0800 288 6482 / +64 9 525 6800</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-red" />
                <span>procurement@procurly.autohub.co.nz</span>
              </div>
            </div>
          </div>

          {/* Col 3: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
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
                <Link href="/register" className="hover:text-white transition-colors flex items-center gap-1">
                  Open Trade Account <ArrowUpRight className="w-3.5 h-3.5 text-brand-red" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Trade Portal Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Customer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Logistics Lanes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Global Sourcing Lanes</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center justify-between">
                <span>Japan (Tokyo & Nagoya)</span>
                <span className="text-[11px] text-emerald-400 font-mono">Air / Sea Daily</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Australia (Melbourne & Sydney)</span>
                <span className="text-[11px] text-emerald-400 font-mono">2-3 Days Air</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Europe & UK OEM</span>
                <span className="text-[11px] text-emerald-400 font-mono">Express Air</span>
              </li>
              <li className="flex items-center justify-between">
                <span>USA & North America</span>
                <span className="text-[11px] text-emerald-400 font-mono">Weekly Flights</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Regional NZ Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">NZ Logistics Hubs</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <p className="font-semibold text-slate-200">Auckland Central Hub</p>
                <p className="text-slate-400">142 Neilson St, Penrose</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Christchurch Hub</p>
                <p className="text-slate-400">55 Lunns Road, Middleton</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Customs Clearance</p>
                <p className="text-slate-400">Auckland International Airport</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Autohub Logistics Limited. All rights reserved. Procurly™ is a registered trademark.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Trade
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Support & Inquiries
            </Link>
            <span className="text-slate-600">NZBN: 9429038201948</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
