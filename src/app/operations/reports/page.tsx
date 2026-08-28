'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalReportMetrics } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function ReportsDashboardPage() {
  const [metrics, setMetrics] = useState<OperationalReportMetrics>(operationsService.getReportMetrics());
  const [activeGroup, setActiveGroup] = useState<'operational' | 'financial' | 'customer' | 'management'>('operational');

  useEffect(() => {
    setMetrics(operationsService.getReportMetrics());
    const handleUpdate = () => setMetrics(operationsService.getReportMetrics());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      'Metric,Value\n' +
      `Open Requests,${metrics.openRequestsCount}\n` +
      `Awaiting Quotes,${metrics.awaitingQuotesCount}\n` +
      `Awaiting Customer Approval,${metrics.awaitingApprovalCount}\n` +
      `Awaiting Payment,${metrics.awaitingPaymentCount}\n` +
      `Active Procurement POs,${metrics.procurementInProgressCount}\n` +
      `Quote Conversion Rate,${metrics.quoteConversionRate}%\n` +
      `Payment Conversion Rate,${metrics.paymentConversionRate}%\n` +
      `Active Procurement Value NZD,$${metrics.activeProcurementValueNZD}\n` +
      `Outstanding Customer Payments NZD,$${metrics.outstandingPaymentsNZD}\n` +
      `Average Processing Time Days,${metrics.avgProcessingDays} days\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Procurly_Operations_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 47. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Operational Reporting & Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Procurement conversion funnels, throughput velocities, revenue reconciliations, and SLAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 47. Report Group Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(
          [
            { id: 'operational', label: 'Operational Reports', icon: Layers },
            { id: 'financial', label: 'Financial Reports', icon: DollarSign },
            { id: 'customer', label: 'Customer Reports', icon: Users },
            { id: 'management', label: 'Management Velocity & SLAs', icon: TrendingUp },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeGroup === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                isActive ? 'bg-[#ed2025] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {activeGroup === 'operational' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Open Requests</span>
              <p className="text-2xl font-black text-slate-900">{metrics.openRequestsCount}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Awaiting Quotes</span>
              <p className="text-2xl font-black text-[#2B4499]">{metrics.awaitingQuotesCount}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Active Procurement POs</span>
              <p className="text-2xl font-black text-emerald-600">{metrics.procurementInProgressCount}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Deliveries in Transit</span>
              <p className="text-2xl font-black text-cyan-700">{metrics.activeShipmentsCount}</p>
            </div>
          </div>

          {/* Lifecycle Volume Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 mb-4">Requests by Procurement Lifecycle Stage</h2>
            <div className="space-y-3">
              {metrics.requestsByStatus.map((item) => {
                const percentage = Math.round((item.count / 48) * 100);
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.status}</span>
                      <span className="text-slate-500">
                        {item.count} items (NZ${item.valueNZD.toLocaleString()})
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ed2025] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeGroup === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Monthly Procurement Revenue</span>
              <p className="text-3xl font-black text-[#2B4499]">
                NZ${metrics.monthlyRevenueNZD.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">+14% vs prior month</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Active Procurement Value</span>
              <p className="text-3xl font-black text-slate-900">
                NZ${metrics.activeProcurementValueNZD.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">24 Active Purchase Orders</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Outstanding Customer Receivables</span>
              <p className="text-3xl font-black text-amber-700">
                NZ${metrics.outstandingPaymentsNZD.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">7 Invoices awaiting payment</p>
            </div>
          </div>
        </div>
      )}

      {activeGroup === 'customer' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900">Customer Activity & Trade Billing Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-900 text-sm">AutoCare Auckland Ltd</p>
              <p className="text-slate-500">8 Active Requests · 4 Open Orders</p>
              <p className="font-bold text-[#2B4499]">NZ$485.00 Outstanding Balance</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-900 text-sm">West Auto Commercial Group</p>
              <p className="text-slate-500">11 Active Requests · 6 Open Orders</p>
              <p className="font-bold text-[#2B4499]">NZ$310.00 Outstanding Balance</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-900 text-sm">Wellington Commercial Motors</p>
              <p className="text-slate-500">7 Active Requests · 3 Open Orders</p>
              <p className="font-bold text-[#2B4499]">NZ$5,155.00 Outstanding Balance</p>
            </div>
          </div>
        </div>
      )}

      {activeGroup === 'management' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Average Processing Time</span>
              <p className="text-2xl font-black text-slate-900">{metrics.avgProcessingDays} days</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Quote Conversion</span>
              <p className="text-2xl font-black text-[#2B4499]">{metrics.quoteConversionRate}%</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Payment Conversion</span>
              <p className="text-2xl font-black text-emerald-600">{metrics.paymentConversionRate}%</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">SLA Compliance</span>
              <p className="text-2xl font-black text-emerald-600">98.4%</p>
            </div>
          </div>

          {/* 48. Velocity Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900">Lifecycle Velocity Breakdown (Days)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">1. Sourcing</span>
                <span className="text-base font-black text-slate-900">{metrics.sourcingTimeDays} days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">2. Quote Prep</span>
                <span className="text-base font-black text-slate-900">{metrics.quotePreparationDays} days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">3. Customer Approval</span>
                <span className="text-base font-black text-slate-900">{metrics.approvalTimeDays} days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">4. Procurement PO</span>
                <span className="text-base font-black text-slate-900">{metrics.procurementTimeDays} days</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">5. Air Freight & Delivery</span>
                <span className="text-base font-black text-[#2B4499]">{metrics.deliveryTimeDays} days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
