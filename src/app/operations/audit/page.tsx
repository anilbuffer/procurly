'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Calendar,
  User,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalAuditEntry } from '@/types/operations';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<OperationalAuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('All');

  useEffect(() => {
    setLogs(operationsService.getAuditLogs());
    const handleUpdate = () => setLogs(operationsService.getAuditLogs());
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const filteredLogs = logs.filter((entry) => {
    if (userFilter !== 'All' && entry.user !== userFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        entry.action.toLowerCase().includes(q) ||
        entry.objectId.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.user.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const header = 'Timestamp,User,Role,Action,Object,Details,OldValue,NewValue\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.user}","${l.userRole}","${l.action}","${l.objectId}","${l.details}","${l.oldValue || ''}","${l.newValue || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Procurly_Audit_Log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 49. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable chronological record of all status changes, quotes, approvals, and security events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, request #, user..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ed2025]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">User:</span>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
          >
            <option value="All">All Staff Users</option>
            <option value="Michael Chen">Michael Chen</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
            <option value="James Taylor">James Taylor</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Object</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {entry.timeFormatted || entry.timestamp.split(' ')[1]}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    <span className="block">{entry.user}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{entry.userRole}</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-[#2B4499] whitespace-nowrap">
                    {entry.action}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {entry.objectId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-md">
                    {entry.details}
                    {entry.oldValue && entry.newValue && (
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        <span className="line-through">{entry.oldValue}</span> →{' '}
                        <strong className="text-slate-700">{entry.newValue}</strong>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
