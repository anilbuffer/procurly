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
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200 mb-4">
          <Layers className="w-3.5 h-3.5" /> End-to-End Trade Architecture
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How Procurly Simplifies B2B Vehicle Parts Procurement
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          From Japanese OEM export hubs to your workshop hoist in New Zealand. Learn how our integrated sourcing and logistics network operates.
        </p>
      </section>

      {/* 4 Detailed Stages */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0 space-y-12">
        {/* Stage 1 */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-mono font-bold text-brand-red bg-red-50 px-2.5 py-1 rounded border border-red-200">
              STAGE 01
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Request Submission & Digital VIN Validation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When a vehicle arrives at your workshop with damaged or missing components, submit a request via Procurly using the VIN, chassis number, or OEM part number. You can upload photos of damaged assemblies directly.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-red" />
                <span>Instant VIN decode across JDM, European, Australian & US databases</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-red" />
                <span>Condition filtering: New OEM, Grade A Used, or Certified Reconditioned</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-red" />
                <span>Urgency level assignment for rapid hoist prioritization</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-red-400 font-bold"># STAGE 01 VERIFICATION MATRIX</div>
            <div className="p-3 bg-slate-800/80 rounded-lg">VIN: JTEBX3EJ9K1208941 [MATCH: 2021 TOYOTA HILUX]</div>
            <div className="p-3 bg-slate-800/80 rounded-lg">PART: 81110-0KP70 (RH LED HEADLAMP)</div>
            <div className="p-3 bg-slate-800/80 rounded-lg text-emerald-400">FITMENT STATUS: 100% CONFIRMED JDM/NZ SPEC</div>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4 text-left">
            <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              STAGE 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Global Sourcing & Guaranteed Landed Cost Quotation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Autohub’s procurement specialists in Tokyo, Nagoya, Sydney, and Munich query authorized distributors and certified salvage partners. We calculate the exact landed cost before you commit.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                <span>Transparent breakdown: Part cost + Freight + Duties + GST + Delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                <span>Air Freight Express (3-5 Days) vs Consolidated Sea Freight (18-24 Days)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                <span>Zero hidden customs surprise charges upon arrival</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 lg:order-1 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wide">Landed Cost Quotation Preview</div>
            <div className="space-y-1.5 border-t border-slate-200 pt-3">
              <div className="flex justify-between"><span>Sourced Part Ex-Works (Tokyo):</span><span className="font-bold">$1,850.00 NZD</span></div>
              <div className="flex justify-between"><span>International Air Freight (Priority):</span><span className="font-bold">$340.00 NZD</span></div>
              <div className="flex justify-between"><span>NZ Customs Duty & MPI Biosecurity:</span><span className="font-bold">$65.00 NZD</span></div>
              <div className="flex justify-between"><span>NZ GST (15%):</span><span className="font-bold">$338.25 NZD</span></div>
              <div className="flex justify-between"><span>Local Auckland Metro Courier:</span><span className="font-bold">$45.00 NZD</span></div>
              <div className="flex justify-between text-base font-black text-brand-red pt-2 border-t border-slate-300"><span>TOTAL LANDED NZD:</span><span>$2,638.25 NZD</span></div>
            </div>
          </div>
        </div>

        {/* Stage 3 */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              STAGE 03
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Export Packing & Air/Sea Freight Dispatch
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Once you approve the quote with one click, parts are physically inspected at our overseas export depot, wrapped in high-impact protective crating, and loaded onto scheduled air or sea routes.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Heavy-duty foam and custom wooden crating for panels and glass</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Daily scheduled air cargo flights with Air New Zealand & Qantas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live airway bill (AWB) and vessel tracking identifiers</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-video border border-slate-200">
            <Image
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
              alt="Air freight logistics hub"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Stage 4 */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4 text-left">
            <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
              STAGE 04
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              NZ Customs Clearance & Workshop Delivery
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consignments enter our bonded facility at Auckland International Airport or Ports of Auckland. Autohub manages direct MPI biosecurity clearance and arranges dedicated final-mile transport straight to your workshop entrance.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Fast-track green-lane customs clearance via Autohub brokerage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Forklift and loading dock coordination tailored to your premises</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Consolidated monthly invoicing (20th month following)</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 lg:order-1 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-purple-400 font-bold"># MILESTONE DELIVERED</div>
            <div className="p-3 bg-slate-800 rounded-lg text-xs space-y-1">
              <p className="font-bold text-emerald-400">✓ Auckland Cargo Terminal: MPI Cleared</p>
              <p className="font-bold text-emerald-400">✓ Dispatched: Penrose Logistics Depot</p>
              <p className="font-bold text-white">✓ Handover: Apex Workshop Bay 2 (Signed Marcus H.)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0 text-center">
        <div className="p-10 bg-slate-100 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">Ready to try Procurly for your workshop?</h3>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Submit a part request in seconds or register your trade account for instant quote generation.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href="/requests/new" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold text-xs">
                Submit a Request Now
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-xs">
                Register Trade Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
