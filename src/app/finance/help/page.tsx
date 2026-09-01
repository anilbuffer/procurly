'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CircleHelp,
  FileText,
  CreditCard,
  RotateCcw,
  Wallet,
  ShieldCheck,
  ChevronDown,
  Mail,
  Phone,
  AlertTriangle,
} from 'lucide-react';

export default function FinanceHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does an order transition from Customer Approval to Procurement Release?',
      a: 'When a customer approves a quotation, the order enters the "Awaiting Payment" state. Once payment is settled via Direct Bank Transfer (Account2Account or manual wire) or verified against an active Trade Credit facility (20th of Month Following), a Finance specialist grants "Financial Clearance", unlocking procurement for the operations team.',
    },
    {
      q: 'What is the required workflow for processing customer refunds?',
      a: 'Refunds must progress through three audited stages: 1. Intake Reason Review (verifying supplier unavailability or customer cancellation before dispatch), 2. Finance Risk & Threshold Approval, and 3. Bank Remittance Settlement Execution. Each step permanently logs actor attribution in the ledger.',
    },
    {
      q: 'How are Trade Credit account limits monitored and placed on hold?',
      a: 'When a customer reaches 90%+ credit utilization or exceeds their agreed payment terms (e.g., 20th of month following), the system automatically flags the account as "Near Limit" or "Overdue". Finance can adjust limits or place a temporary hold, pausing new order clearances until an interim remittance is received.',
    },
    {
      q: 'How are manual bank transfers reconciled?',
      a: 'Customers uploading ANZ / BNZ remittance advice trigger a "Verify Payment" task. Specialists match the deposit against our BNZ API statement feed. Once matched, clicking "Record Payment" or "Reconcile" updates the general ledger and automatically notifies Procurement.',
    },
  ];

  const sops = [
    {
      title: 'SOP-FIN-001: Commercial Payment Settlement & Bank Feed Clearance',
      description: 'Step-by-step standard operating procedure for Account2Account settlements and BNZ manual wire verification.',
      icon: CreditCard,
    },
    {
      title: 'SOP-FIN-002: Customer Refund & Credit Note Authorization',
      description: 'Mandatory verification protocols for supplier part cancellations, freight consolidation rebates, and damaged in transit claims.',
      icon: RotateCcw,
    },
    {
      title: 'SOP-FIN-003: Trade Credit Risk Management & Delinquency Escalation',
      description: 'Guidelines on credit limit adjustments, hold restrictions, NZBN credit checks, and debt collection recovery.',
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Finance SOPs, Guidelines & Support</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official standard operating procedures, credit policy documentation, frequently asked questions, and treasury contacts.
        </p>
      </div>

      {/* Finance SOPs */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Standard Operating Procedures (SOPs)</h2>
        <div className="grid grid-cols-1 gap-3">
          {sops.map((sop, idx) => {
            const Icon = sop.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start gap-4 hover:border-slate-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">{sop.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sop.description}</p>
                </div>
                <button
                  onClick={() => alert(`Opening ${sop.title} documentation PDF...`)}
                  className="px-3 py-1.5 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] shrink-0"
                >
                  View SOP
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Frequently Asked Questions (FAQ)
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200/70 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-bold text-xs text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                    openFaq === idx ? 'transform rotate-180' : ''
                  )}
                />
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support & Contacts */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-3">
        <h3 className="text-sm font-bold">Treasury & Administration Contacts</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          For payment gateway outages, high-value transaction approval overrides (&gt;NZ$20,000), or IRD tax queries:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <p className="font-bold text-slate-200">Commercial Treasury Desk</p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>treasury@autohub.co.nz</span>
            </p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+64 9 525 8800 (Ext. 402)</span>
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <p className="font-bold text-slate-200">Credit Risk & Legal Compliance</p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>compliance@autohub.co.nz</span>
            </p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>+64 9 525 8800 (Ext. 405)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
