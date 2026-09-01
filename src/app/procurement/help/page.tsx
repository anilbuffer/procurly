'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  BookOpen,
  FileCheck,
  LifeBuoy,
  Send,
  CheckCircle,
  ChevronDown,
  Mail,
  Phone,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export default function ProcurementHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [issueCategory, setIssueCategory] = useState('EDI Connection Issue');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const sops = [
    {
      title: '1. Sourcing Intake & VIN Decode Protocol',
      desc: 'Verify chassis code and engine number against manufacturer microfiche before dispatching RFQs to overseas partners.',
    },
    {
      title: '2. Multi-Supplier Quotation Matrix Rules',
      desc: 'Procurement policy requires at least two competitive quotations for parts over NZD $1,000 to guarantee price efficiency.',
    },
    {
      title: '3. Purchase Order Generation & Binding Lock',
      desc: 'Ensure supplier lead-time terms and warranty certificates are explicitly recorded before transmitting official POs.',
    },
    {
      title: '4. 4-Point Pre-Dispatch Verification Checklist',
      desc: 'Confirm physical fitment, unit count, reinforced packaging foam, and destination barcoding prior to freight carrier handover.',
    },
    {
      title: '5. Sourcing & Logistics Exception Resolution',
      desc: 'Follow the 6-stage lifecycle (Review → Assign → Investigate → Supplier Comm → Resolution → Close) for transit delays or part mismatches.',
    },
  ];

  const faqs = [
    {
      q: 'How do I mark a supplier quote as the accepted preferred option?',
      a: 'Navigate to Quote Comparison (/procurement/quote-comparison), choose the request, and click "Select Supplier" on the winning quotation. This locks in the quote and readies the order for customer sign-off and PO generation.',
    },
    {
      q: 'Can I add a custom supplier that is not currently in the directory?',
      a: 'Yes, open the Supplier Directory (/procurement/suppliers) and click "+ Add New Supplier" to input the vendor credentials, location, and specialization.',
    },
    {
      q: 'What should I do if a flight cargo leg is delayed overseas?',
      a: 'Open Logistics Exceptions (/procurement/exceptions), log the incident under "Shipping Delay", and advance the stage to "Supplier Communication" to coordinate re-manifesting with Qantas or Air NZ Cargo.',
    },
    {
      q: 'How is customer privacy maintained during supplier communications?',
      a: 'All vendor messaging in the Supplier Communications hub is strictly isolated from customer-facing portal threads. Trade account pricing margins are kept confidential.',
    },
  ];

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription) return;
    setIssueSubmitted(true);
    setTimeout(() => {
      setIssueSubmitted(false);
      setIssueDescription('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Procurement Process Guide, SOPs & Support
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational handbook for parts specialists: Sourcing → Compare → Select → Order → Track → Resolve
        </p>
      </div>

      {/* 2. Process Workflow Stepper Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-300">
            PROCURly Standard Procurement Lifecycle (SOP-01)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono text-sky-300 block">Step 01</span>
            <strong className="text-sm block mt-0.5">Sourcing</strong>
            <span className="text-[10px] text-slate-300">Intake & RFQ</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono text-sky-300 block">Step 02</span>
            <strong className="text-sm block mt-0.5">Compare</strong>
            <span className="text-[10px] text-slate-300">Matrix Review</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono text-sky-300 block">Step 03</span>
            <strong className="text-sm block mt-0.5">Select</strong>
            <span className="text-[10px] text-slate-300">Lock Preferred</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono text-sky-300 block">Step 04</span>
            <strong className="text-sm block mt-0.5">Order</strong>
            <span className="text-[10px] text-slate-300">Dispatch PO</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono text-sky-300 block">Step 05</span>
            <strong className="text-sm block mt-0.5">Track</strong>
            <span className="text-[10px] text-slate-300">Freight & Hub</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-mono text-sky-300 block">Step 06</span>
            <strong className="text-sm block mt-0.5">Resolve</strong>
            <span className="text-[10px] text-slate-300">Exceptions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SOPs & FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SOPs Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Standard Operating Procedures (SOPs)
            </h3>

            <div className="space-y-3">
              {sops.map((sop, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <h4 className="font-bold text-slate-900">{sop.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{sop.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-blue" />
              Frequently Asked Questions (FAQ)
            </h3>

            <div className="space-y-2 text-xs">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3.5 bg-slate-50 text-left font-bold text-slate-900 flex items-center justify-between transition-colors hover:bg-slate-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform duration-200',
                        openFaq === idx && 'rotate-180'
                      )}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 bg-white text-slate-600 leading-relaxed border-t border-slate-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Administrator & Report an Issue (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contact Administrator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-brand-blue" />
              Contact IT & Operations Support
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">Autohub IT & Operations Support</p>
              <p className="text-slate-600 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> support@autohub.co.nz
              </p>
              <p className="text-slate-600 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> +64 9 275 8800 (Ext 4)
              </p>
              <p className="text-[11px] text-slate-400 mt-2">Operating Hours: Mon–Fri 07:30 – 18:00 NZST</p>
            </div>
          </div>

          {/* Report an Issue Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-red" />
              Report System Issue or Feature Request
            </h3>

            {issueSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-center space-y-1">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-bold">Ticket Submitted to Support Team</p>
                <p className="text-[11px] text-emerald-700">Reference: TKT-{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitIssue} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Issue Category</label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="EDI Connection Issue">EDI / Supplier Connection Issue</option>
                    <option value="VIN Decoder Discrepancy">VIN Decoder / Microfiche Discrepancy</option>
                    <option value="Pricing Calculation Bug">Pricing / Freight Calculation Bug</option>
                    <option value="General Support Request">General Support Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Description & Reproduction Steps</label>
                  <textarea
                    rows={3}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe the unexpected behavior..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-red-polished text-white font-bold w-full py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
