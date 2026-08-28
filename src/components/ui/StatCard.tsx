import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  changeText?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBg?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  changeText,
  isPositive,
  icon,
  iconBg = 'bg-brand-blue-light text-brand-blue',
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-5 border border-slate-200/80 shadow-subtle flex items-start justify-between transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-card hover:border-slate-300',
        className
      )}
    >
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {changeText && (
            <span
              className={cn(
                'text-xs font-medium',
                isPositive ? 'text-emerald-600' : 'text-slate-500'
              )}
            >
              {changeText}
            </span>
          )}
        </div>
      </div>
      <div className={cn('p-3 rounded-xl shrink-0', iconBg)}>
        {icon}
      </div>
    </div>
  );
}
