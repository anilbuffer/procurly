'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Building2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function ProcurementReportsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedReport, setSelectedReport] = useState('Procurement Volume');
  const [exportSuccess, setExportSuccess] = useState(false);

  const reportCategories = [
    'Procurement Volume',
    'Supplier Performance',
    'Sourcing Performance',
    'Supplier Costs',
    'Purchase Orders',
    'Average Procurement Time',
    'Supplier Response Time',
    'Procurement Exceptions',
    'Order Fulfilment',
    'Part Availability',
  ];

  const handleExport = (format: 'Excel' | 'CSV') => {
    setExportSuccess(true);
    // Simulate CSV generation and download
    const csvContent = `data:text/csv;charset=utf-8,Report,${selectedReport}\nDate Range,${dateRange}\nGenerated At,${new Date().toISOString()}\nMetric,Value\nTotal Sourced Volume,142 Units\nTotal Procurement Spend,$184,920 NZD\nAvg Lead Time,3.2 Days\nFulfillment Rate,97.6%\nException Rate,1.8%\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PROCURly_${selectedReport.replace(/\s+/g, '_')}_${format}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setExportSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Procurement Operational Reports & Analytics
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live BI Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export operational metrics covering procurement volume, supplier costs, sourcing velocities, and fulfillment SLAs
          </p>
        </div>

        {/* Date Range & Export Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none shadow-xs"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter</option>
            <option value="Year to Date">Year to Date (2026)</option>
          </select>

          <button
            onClick={() => handleExport('CSV')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {selectedReport} report successfully compiled and downloaded!
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Spend (NZD)</span>
          <p className="text-2xl font-black text-slate-900 mt-1">$184,920.00</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Across 142 parts orders</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Sourcing Velocity</span>
          <p className="text-2xl font-black text-brand-blue mt-1">4.2 Hours</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Intake to 3x supplier quotes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Procurement Cycle</span>
          <p className="text-2xl font-black text-slate-900 mt-1">3.4 Days</p>
          <p className="text-[11px] text-brand-blue font-semibold mt-1">PO dispatch to Auckland Hub</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Order Fulfillment SLA</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">98.2%</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Delivered within quoted ETA</p>
        </div>
      </div>

      {/* 3. Report Categories Grid & Interactive Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Selector List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Available Reports ({reportCategories.length})
          </h3>
          <div className="space-y-1">
            {reportCategories.map((rep) => (
              <button
                key={rep}
                onClick={() => setSelectedReport(rep)}
                className={cn(
                  'w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between',
                  selectedReport === rep
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>{rep}</span>
                <span className="text-[10px] opacity-70">View</span>
              </button>
            ))}
          </div>
        </div>

        {/* Report Visual Breakdown Panel (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">{selectedReport} Report</h2>
              <p className="text-xs text-slate-500">Period: {dateRange} • Live Data</p>
            </div>
            <button
              onClick={() => handleExport('CSV')}
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download Dataset
            </button>
          </div>

          {/* Visual Bars Breakdown for Volume & Costs */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Toyota / Lexus OEM Sourcing</span>
                <span>$78,400 NZD (42%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-red rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>German Powertrain & Lighting (BMW/Audi/Merc)</span>
                <span>$49,200 NZD (27%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full" style={{ width: '27%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Commercial Trucks & Diesel (Isuzu / Hino / Fuso)</span>
                <span>$34,100 NZD (18%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Subaru & JDM Performance</span>
                <span>$23,220 NZD (13%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '13%' }} />
              </div>
            </div>
          </div>

          {/* Key Intelligence Highlights */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Operational Report Highlights:</span>
            <p className="text-slate-600 leading-relaxed">
              • Tokyo Auto Spares achieved the lowest average lead time of 2.5 days for Tokyo-Auckland air routes.
            </p>
            <p className="text-slate-600 leading-relaxed">
              • Quote comparison analysis delivered an average landed cost reduction of 8.4% compared to catalogue benchmark pricing.
            </p>
            <p className="text-slate-600 leading-relaxed">
              • Zero fitment mismatch exceptions recorded for all OEM verified VIN requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
