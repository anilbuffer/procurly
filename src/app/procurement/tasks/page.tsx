'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ListTodo,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Check,
  ArrowRight,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import { ProcurementTaskItem } from '@/types/procurement';

export default function ProcurementTasksPage() {
  const [tasks, setTasks] = useState<ProcurementTaskItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Today' | 'Overdue' | 'Upcoming' | 'Completed'>('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const loadData = () => {
    setTasks(procurementService.getTasks());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, []);

  const handleToggle = (taskId: string) => {
    procurementService.toggleTaskComplete(taskId);
  };

  // Counts
  const todayCount = tasks.filter((t) => !t.isCompleted && t.dueBucket === 'Today').length;
  const overdueCount = tasks.filter((t) => !t.isCompleted && t.dueBucket === 'Overdue').length;
  const upcomingCount = tasks.filter((t) => !t.isCompleted && t.dueBucket === 'Upcoming').length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'Today' && (t.isCompleted || t.dueBucket !== 'Today')) return false;
    if (activeTab === 'Overdue' && (t.isCompleted || t.dueBucket !== 'Overdue')) return false;
    if (activeTab === 'Upcoming' && (t.isCompleted || t.dueBucket !== 'Upcoming')) return false;
    if (activeTab === 'Completed' && !t.isCompleted) return false;

    if (selectedType !== 'All' && t.type !== selectedType) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.requestRef.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.vehicleSummary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const taskTypes = [
    'Review sourcing request',
    'Contact supplier',
    'Add supplier quotation',
    'Compare quotations',
    'Confirm supplier',
    'Create purchase order',
    'Follow up supplier',
    'Update procurement status',
    'Resolve procurement exception',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Procurement Work Queue
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
              {todayCount + overdueCount} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personal procurement operational tasks, supplier follow-ups, and exception resolutions
          </p>
        </div>
      </div>

      {/* 2. Task Summary Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('Today')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            activeTab === 'Today'
              ? 'bg-blue-50/80 border-brand-blue shadow-xs ring-1 ring-brand-blue'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Today</span>
            <Clock className={cn('w-4 h-4', activeTab === 'Today' ? 'text-brand-blue' : 'text-slate-400')} />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{todayCount}</p>
          <p className="text-[11px] text-brand-blue font-medium mt-0.5">Due today</p>
        </button>

        <button
          onClick={() => setActiveTab('Overdue')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            activeTab === 'Overdue'
              ? 'bg-red-50/80 border-brand-red shadow-xs ring-1 ring-brand-red'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Overdue</span>
            <AlertTriangle className={cn('w-4 h-4', activeTab === 'Overdue' ? 'text-brand-red' : 'text-slate-400')} />
          </div>
          <p className="text-2xl font-black text-brand-red mt-1">{overdueCount}</p>
          <p className="text-[11px] text-brand-red font-medium mt-0.5">Requires immediate action</p>
        </button>

        <button
          onClick={() => setActiveTab('Upcoming')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            activeTab === 'Upcoming'
              ? 'bg-amber-50/80 border-amber-500 shadow-xs ring-1 ring-amber-500'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Upcoming</span>
            <Calendar className={cn('w-4 h-4', activeTab === 'Upcoming' ? 'text-amber-600' : 'text-slate-400')} />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{upcomingCount}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Due next 48 hours</p>
        </button>

        <button
          onClick={() => setActiveTab('Completed')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            activeTab === 'Completed'
              ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Completed</span>
            <CheckCircle className={cn('w-4 h-4', activeTab === 'Completed' ? 'text-emerald-600' : 'text-slate-400')} />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{completedCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Finished tasks</p>
        </button>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks by request, vehicle, title..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Task Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Task Types</option>
            {taskTypes.map((tt) => (
              <option key={tt} value={tt}>
                {tt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Task Queue List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-800">No tasks in this view</p>
            <p className="text-xs text-slate-400 mt-1">All clear! Great work staying ahead of schedule.</p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={cn(
                'p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors group',
                t.isCompleted ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50/70'
              )}
            >
              {/* Checkbox + Details */}
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  onClick={() => handleToggle(t.id)}
                  aria-label={t.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0',
                    t.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-brand-blue bg-white text-transparent hover:text-slate-300'
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border',
                        t.priority === 'Urgent'
                          ? 'bg-red-50 text-brand-red border-red-200 animate-pulse'
                          : t.priority === 'High'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      )}
                    >
                      {t.priority}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {t.type}
                    </span>

                    <span className="text-xs font-bold text-brand-blue font-mono">
                      {t.requestRef}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      • {t.customerName}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      'text-sm font-bold text-slate-900',
                      t.isCompleted && 'line-through text-slate-400'
                    )}
                  >
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Vehicle: <strong className="text-slate-700">{t.vehicleSummary}</strong></span>
                    <span>Assigned: <strong className="text-slate-700">{t.assignedTo}</strong></span>
                    <span>Due: <strong className={t.dueBucket === 'Overdue' ? 'text-brand-red' : 'text-slate-700'}>{t.dueDate.split('T')[0]}</strong></span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 shrink-0 self-center">
                <Link
                  href={t.targetUrl}
                  className="btn-red-polished text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                >
                  Execute Task <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
