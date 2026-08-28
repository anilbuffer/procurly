import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-10 text-left">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          <FileText className="w-3.5 h-3.5" /> B2B Trade Policy
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Terms of Trade & Landed Cost Conditions
        </h1>
        <p className="text-sm text-slate-500">
          Last updated: August 2026 • Autohub Logistics Limited (NZBN 9429038201948)
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Trade Account Qualification</h2>
          <p>
            Procurly by Autohub is a specialized B2B vehicle parts procurement and logistics platform operated exclusively for verified New Zealand motor vehicle dealerships, collision repair facilities, automotive mechanical workshops, and commercial fleet operators holding a valid NZBN and GST registration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. Landed Cost Pricing Guarantee</h2>
          <p>
            All quotations generated within the Procurly platform represent all-inclusive landed New Zealand Dollar (NZD) pricing unless specifically denoted otherwise. A quotation encompasses:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Ex-works sourced component cost from verified global distributors or certified salvage partners.</li>
            <li>Export packaging, high-impact crating, and domestic transport to the origin international hub.</li>
            <li>International scheduled air freight or consolidated maritime shipping to New Zealand.</li>
            <li>New Zealand Customs tariffs, import documentation charges, and Ministry for Primary Industries (MPI) biosecurity inspection fees.</li>
            <li>New Zealand Goods and Services Tax (GST 15%).</li>
            <li>Final-mile courier or tailgate transport directly to your designated workshop delivery address.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. 100% Fitment Verification & Physical Inspection</h2>
          <p>
            Prior to foreign export dispatch, all ordered components undergo cross-referencing against the manufacturer electronic parts catalog (EPC) using the customer-supplied VIN, chassis number, and high-resolution damage photographs. In the rare event of a supplier incorrect supply, Autohub assumes complete liability for replacement or refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Payment Terms & Trade Credit</h2>
          <p>
            Approved trade account holders are granted credit terms of payment on or before the 20th day of the month following invoice date. Statements are generated on the final calendar day of each month.
          </p>
        </section>
      </div>
    </div>
  );
}
