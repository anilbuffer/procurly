'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BRAND } from '@/lib/constants';
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: 'Trade Account Application',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0 py-12 lg:py-20 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
          <MessageSquare className="w-3.5 h-3.5" /> Direct Support & Regional Hubs
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Connect with the Autohub Parts Procurement Team
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Speak with our dedicated automotive parts sourcing desk or visit our nationwide New Zealand distribution centres.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info Col */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 border border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold">Trade Support & Inquiries</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our parts specialists are available Monday to Friday to assist with urgent hoists, VIN fitment confirmation, and custom shipping requirements.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Toll-Free Phone</p>
                  <p className="text-slate-300 font-mono">0800 288 6482</p>
                  <p className="text-slate-400 font-mono mt-0.5">Direct: +64 9 525 6800</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Direct Email</p>
                  <p className="text-slate-300 font-mono">procurement@procurly.autohub.co.nz</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Operating Hours</p>
                  <p className="text-slate-300">{BRAND.contact.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Hubs Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Regional Depot Locations
            </h4>
            <div className="space-y-3 text-xs">
              {BRAND.contact.hubs.map((hub, idx) => (
                <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">{hub.city}</span>
                    <span className="text-slate-500">{hub.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Col */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card">
          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Inquiry Received!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for contacting Procurly by Autohub. A dedicated parts specialist will be in touch with you shortly.
              </p>
              <Button variant="outline" size="md" onClick={() => setSubmitted(false)} className="text-xs">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Send an Online Inquiry</h3>
                <p className="text-xs text-slate-500">
                  Fill out the details below and our team will get back to you within 2 business hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  placeholder="e.g. Marcus Henderson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Workshop / Business Name"
                  required
                  placeholder="e.g. Apex Auto Specialists"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="marcus@apexauto.co.nz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone / Mobile"
                  required
                  placeholder="021 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Inquiry Topic
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-brand-blue"
                >
                  <option value="Trade Account Application">Trade Account Application & Credit Limits</option>
                  <option value="Urgent Part Sourcing">Urgent Hoist / VOR Part Sourcing</option>
                  <option value="Air / Sea Freight Inquiries">Air / Sea Freight Logistics Lanes</option>
                  <option value="Customs & Biosecurity">NZ Customs Brokerage & Biosecurity</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Message / Part Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you're looking for, including any vehicle VINs or parts questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold text-xs tracking-wide shadow-md"
              >
                Send Inquiry to Autohub Desk
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
