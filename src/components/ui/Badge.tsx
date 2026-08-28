import React from 'react';
import { cn, getStatusBadgeVariant } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'status' | 'red' | 'blue' | 'neutral' | 'outline' | 'success' | 'warning' | 'urgent';
  status?: string;
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  status,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  if (variant === 'status' && status) {
    const statusStyle = getStatusBadgeVariant(status);
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          statusStyle.bg,
          statusStyle.border,
          className
        )}
        {...props}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusStyle.dot)} />
        {children || status}
      </span>
    );
  }

  const variants = {
    red: 'bg-red-50 text-brand-red border border-red-200 font-semibold',
    blue: 'bg-brand-blue-light text-brand-blue border border-brand-blue-subtle font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    outline: 'border border-slate-300 text-slate-700 bg-white',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    urgent: 'bg-red-100 text-red-800 border border-red-300 font-bold animate-pulse',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant as keyof typeof variants] || variants.neutral,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'red' || variant === 'urgent'
              ? 'bg-brand-red'
              : variant === 'blue'
              ? 'bg-brand-blue'
              : variant === 'success'
              ? 'bg-emerald-600'
              : variant === 'warning'
              ? 'bg-amber-600'
              : 'bg-slate-500'
          )}
        />
      )}
      {children}
    </span>
  );
}
