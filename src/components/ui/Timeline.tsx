import React from 'react';
import { TrackingMilestone } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

export interface TimelineProps {
  milestones: TrackingMilestone[];
  className?: string;
}

export function Timeline({ milestones, className }: TimelineProps) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      {/* Vertical line connecting milestones */}
      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />

      {milestones.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isInProgress = step.status === 'in-progress';

        return (
          <div key={step.id || idx} className="relative flex items-start gap-4 group">
            {/* Step Icon / Dot */}
            <div
              className={cn(
                'relative z-10 w-6 h-6 rounded-full flex items-center justify-center -ml-6 shrink-0 transition-transform duration-200 group-hover:scale-110',
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                  : isInProgress
                  ? 'bg-brand-red text-white shadow-md ring-4 ring-red-100 animate-pulse'
                  : 'bg-slate-200 text-slate-500 border border-white'
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isInProgress ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h4
                  className={cn(
                    'text-sm font-bold',
                    isCompleted
                      ? 'text-slate-900'
                      : isInProgress
                      ? 'text-brand-red'
                      : 'text-slate-500'
                  )}
                >
                  {step.title}
                </h4>
                <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {step.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-brand-blue font-medium mb-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{step.location}</span>
                {step.carrier && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">{step.carrier}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>

              {step.referenceNumber && (
                <div className="mt-2 text-xs font-mono bg-slate-50 text-slate-700 px-2.5 py-1 rounded inline-block border border-slate-200">
                  Ref: <span className="font-semibold">{step.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
