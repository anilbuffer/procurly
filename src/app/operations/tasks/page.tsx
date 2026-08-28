'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Filter,
} from 'lucide-react';
import { operationsService } from '@/services/operations/operationsService';
import { OperationalTask } from '@/types/operations';
import { cn } from '@/lib/utils';

export default function MyTasksQueuePage() {
  const [tasks, setTasks] = useState<OperationalTask[]>([]);

  const loadData = () => {
    setTasks(operationsService.getTasks());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_ops_updated', handleUpdate);
    return () => window.removeEventListener('procurly_ops_updated', handleUpdate);
  }, []);

  const handleCompleteTask = (id: string) => {
    operationsService.completeTask(id);
    loadData();
  };

  const openTasks = tasks.filter((t) => t.status !== 'Completed');
  const urgentCount = openTasks.filter((t) => t.priority === 'Urgent').length;
  const highCount = openTasks.filter((t) => t.priority === 'High').length;
  const dueTodayCount = openTasks.filter((t) => t.dueLabel === 'Due Today').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* 51. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Personal operational work queue across assigned requests, quote reviews, and exceptions.
          </p>
        </div>
      </div>

      {/* 51. KPI Badges */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] uppercase font-black text-red-700 block mb-1">Urgent / High Priority</span>
          <p className="text-2xl font-black text-red-700">{urgentCount + highCount}</p>
          <span className="text-[10px] text-red-600 font-semibold">Immediate attention</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] uppercase font-black text-amber-800 block mb-1">Due Today</span>
          <p className="text-2xl font-black text-amber-900">{dueTodayCount}</p>
          <span className="text-[10px] text-amber-700">Before 5:00 PM</span>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] uppercase font-black text-[#2B4499] block mb-1">Total Open Tasks</span>
          <p className="text-2xl font-black text-[#2B4499]">{openTasks.length}</p>
          <span className="text-[10px] text-blue-700">Assigned to your desk</span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {openTasks.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
            <p className="font-bold text-slate-800 text-sm">You&apos;re all caught up!</p>
            <p>Great job — there are currently no pending tasks in your operational queue.</p>
          </div>
        ) : (
          openTasks.map((task) => {
            const isUrgent = task.priority === 'Urgent';
            const isHigh = task.priority === 'High';

            return (
              <div
                key={task.id}
                className={cn(
                  'p-4 sm:p-5 rounded-2xl border bg-white shadow-xs hover:border-[#ed2025] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group',
                  isUrgent ? 'border-red-300 bg-red-50/20' : isHigh ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                )}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'text-[10px] font-black uppercase px-2 py-0.5 rounded border',
                        isUrgent
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {task.dueLabel}
                    </span>
                    <span className="text-xs font-black text-[#2B4499]">{task.requestNumber}</span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">{task.title}</h3>
                  <p className="text-xs text-slate-600">
                    {task.customerName} · {task.vehicleSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 transition-colors"
                    title="Mark Done"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <Link
                    href={task.targetUrl}
                    className="px-4 py-2 rounded-xl bg-[#ed2025] hover:bg-[#d3181d] text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5"
                  >
                    <span>Open Action →</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
