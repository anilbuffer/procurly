'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function ConfigurationPage() {
  const [defaultMargin, setDefaultMargin] = useState('15');
  const [sourcingSlaHours, setSourcingSlaHours] = useState('24');
  const [quoteValidityDays, setQuoteValidityDays] = useState('14');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Default commercial margins, SLA thresholds, and international carrier integrations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
        <div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Commercial Margin Defaults</h3>
          <p className="text-slate-500 text-[11px] mb-3">
            Baseline margin percentage applied when generating landed customer quotes.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={defaultMargin}
              onChange={(e) => setDefaultMargin(e.target.value)}
              className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
            <span className="font-bold text-slate-600">% Gross Margin</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-900 mb-1">Operational SLA Timers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Sourcing RFQ SLA (Hours)</label>
              <input
                type="number"
                value={sourcingSlaHours}
                onChange={(e) => setSourcingSlaHours(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Quote Validity Default (Days)</label>
              <input
                type="number"
                value={quoteValidityDays}
                onChange={(e) => setQuoteValidityDays(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration saved successfully</span>
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs shadow-glow transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
