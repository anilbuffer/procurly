import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Building2, Award, Users, CheckCircle2, MapPin, Globe } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 pb-20">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-4">
          <Building2 className="w-3.5 h-3.5" /> 25+ Years Autohub Automotive Legacy
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Pioneering Automotive Logistics & Trade Procurement
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Procurly was created by Autohub to solve the biggest headache facing New Zealand dealerships, collision repairers, and specialist workshops: unpredictable, fragmented vehicle parts procurement.
        </p>
      </section>

      {/* Story & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              From Complete Vehicle Shipping to Precision Component Logistics
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              For over two decades, Autohub has been the cornerstone of the New Zealand vehicle import industry, shipping hundreds of thousands of motor vehicles from Japan, the UK, Singapore, and Australia.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              With the rapid rise in vehicle complexity—advanced ADAS sensors, hybrid/EV battery packs, and specialized JDM/European platforms—workshops needed a fast, reliable, transparent parts pipeline. Procurly is the answer: an intelligent digital platform backed by physical global infrastructure.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-2xl font-black text-brand-red">15,000+</p>
                <p className="text-xs text-slate-500 font-medium">Consignments Delivered</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-2xl font-black text-brand-blue">100%</p>
                <p className="text-xs text-slate-500 font-medium">Landed Price Guarantee</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[4/3]">
            <Image
              src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80"
              alt="Autohub engineering and parts inspection"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Regional Infrastructure */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold">New Zealand & Global Infrastructure</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Direct physical operations across key global export gateways and nationwide NZ cross-dock centres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRAND.contact.hubs.map((hub, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/30 text-blue-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{hub.city}</h4>
                <p className="text-xs text-slate-400">{hub.address}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Cross-Dock Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 bg-white rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">Partner with Procurly</h3>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Join hundreds of verified New Zealand automotive businesses using Procurly for hassle-free global parts procurement.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="font-bold text-xs">
                Register Verified Trade Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="font-bold text-xs">
                Contact Our Procurement Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
