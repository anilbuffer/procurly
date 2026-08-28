'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  CircleHelp,
  PhoneCall,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Send,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does Autohub guarantee 100% vehicle fitment?',
      a: 'Our sourcing engineers cross-reference every request using official factory electronic parts catalogues (EPC) matched against your vehicle’s full 17-character VIN/chassis number before quotation issuance.',
    },
    {
      q: 'What are the standard international freight lead times?',
      a: 'Express Air Freight typically delivers within 5–8 business days from overseas dispatch to your workshop. Consolidated Sea Freight takes 18–30 business days and provides optimal cost savings for bulk panels and structural assemblies.',
    },
    {
      q: 'Are customs tariffs, GST, and MPI biosecurity fees included in the quote?',
      a: 'Yes. All PROCURly quotations are all-inclusive landed prices in NZD. There are zero surprise import tariffs, quarantine fees, or local courier surcharges upon workshop delivery.',
    },
    {
      q: 'How does payment and trade credit billing work?',
      a: 'Approved automotive trade customers can charge procurement directly to their 20th Month Following trade account ($50,000 credit limit). Alternatively, credit card and POLi direct bank deposit options are supported.',
    },
    {
      q: 'What is the return policy for procurement parts?',
      a: 'In the rare event of a physical fitment mismatch against the verified VIN specifications, Autohub provides immediate expedited replacement or a 100% refund under our Trade Fitment Guarantee.',
    },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportModalOpen(false);
      setSupportMessage('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trade procurement assistance, logistics inquiries, and dedicated parts desk contacts.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setSupportModalOpen(true)}
          leftIcon={<MessageSquare className="w-4 h-4" />}
          className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-sm"
        >
          Message Support Desk
        </Button>
      </div>

      {/* 2-Column Grid: FAQs & Direct Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FAQs (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CircleHelp className="w-4 h-4 text-brand-blue" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left font-bold text-xs text-slate-900 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-2 text-xs text-slate-600 bg-slate-50 border-t border-slate-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Direct Trade Desk Contacts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-card">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800 inline-block">
              Dedicated Trade Desk
            </span>
            <div>
              <h3 className="text-base font-black text-white">Contact Autohub Support</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immediate phone & email support for approved trade accounts
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <PhoneCall className="w-4 h-4 text-[#ed2025] shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Toll Free Trade Desk:</span>
                  <span className="font-mono font-bold text-white text-sm">0800 288 6482</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <PhoneCall className="w-4 h-4 text-brand-blue shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Auckland Direct Line:</span>
                  <span className="font-mono font-bold text-white text-sm">09 525 6800</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Support:</span>
                  <span className="font-semibold text-white">procurement@procurly.autohub.co.nz</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Operating Hours:</span>
                  <span className="text-slate-300">Mon – Fri: 7:30 AM – 5:30 PM NZST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Support Modal */}
      <Modal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} size="md" title="Message Autohub Trade Support">
        {supportSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Message Transmitted</h4>
            <p className="text-xs text-slate-500">
              Your message has been assigned to your dedicated parts desk specialist.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Account</label>
              <input
                type="text"
                disabled
                value="AutoCare Auckland (James Wilson)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                How can Autohub assist your workshop?
              </label>
              <textarea
                rows={4}
                required
                placeholder="Inquire about an ongoing procurement request, custom freight arrangements, or invoice billing..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSupportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold"
              >
                Send Message
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
