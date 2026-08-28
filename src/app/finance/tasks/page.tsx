'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Check,
  Filter,
} from 'lucide-react';
import { financeService } from '@/services/finance/financeService';
import { FinanceTask } from '@/types/finance';

export default function FinanceTasksPage() {
  const [tasks, setTasks] = useState<FinanceTask[]>([]);
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'Due Today' | 'Upcoming' | 'Completed'>('All');

  const loadData = () => {
    setTasks(financeService.getTasks());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_finance_updated', handleUpdate);
    return () => window.removeEventListener('procurly_finance_updated', handleUpdate);
  }, []);

  const handleToggle = (taskId: string) => {
    financeService.toggleTask(taskId);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'Completed') return t.isCompleted;
    if (filter === 'Urgent') return t.priority === 'Urgent' && !t.isCompleted;
    if (filter === 'Due Today') return t.dueCategory === 'Due Today' && !t.isCompleted;
    if (filter === 'Upcoming') return t.dueCategory === 'Upcoming' && !t.isCompleted;
    return !t.isCompleted;
  });

  const urgentCount = tasks.filter((t) => t.priority === 'Urgent' && !t.isCompleted).length;
  const dueTodayCount = tasks.filter((t) => t.dueCategory === 'Due Today' && !t.isCompleted).length;
  const upcomingCount = tasks.filter((t) => t.dueCategory === 'Upcoming' && !t.isCompleted).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Finance Work Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational finance verification, failed transaction reviews, credit approvals, and settlement reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{tasks.filter((t) => !t.isCompleted).length} Open Tasks</span>
          </div>
        </div>
      </div>

      {/* Task Categories & Summary Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('All')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
            filter === 'All'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          )}
        >
          All Active ({tasks.filter((t) => !t.isCompleted).length})
        </button>
        <button
          onClick={() => setFilter('Urgent')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
            filter === 'Urgent'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Urgent ({urgentCount})</span>
        </button>
        <button
          onClick={() => setFilter('Due Today')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
            filter === 'Due Today'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due Today ({dueTodayCount})</span>
        </button>
        <button
          onClick={() => setFilter('Upcoming')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
            filter === 'Upcoming'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          )}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setFilter('Completed')}
          className={cn(
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all ml-auto',
            filter === 'Completed'
              ? 'bg-[#ed2025] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          )}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No tasks in this category</h3>
            <p className="text-xs text-slate-400">All corresponding finance items are resolved and up to date.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                task.isCompleted
                  ? 'border-slate-200 bg-slate-50/50 opacity-70'
                  : task.priority === 'Urgent'
                  ? 'border-red-200 hover:border-red-300'
                  : 'border-slate-200/80 hover:border-emerald-300'
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5',
                    task.isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                  )}
                  title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                >
                  {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md',
                        task.priority === 'Urgent'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                      {task.category}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      'text-sm font-bold text-slate-900',
                      task.isCompleted && 'line-through text-slate-400'
                    )}
                  >
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Due: {task.dueDate}
                    </span>
                    <span>•</span>
                    <span>Assigned to: <strong>{task.assignedTo}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 sm:self-center">
                <Link
                  href={task.targetUrl}
                  className="px-4 py-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98]"
                >
                  <span>Resolve Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
