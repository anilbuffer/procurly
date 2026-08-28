import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-dark' | 'ghost' | 'danger' | 'navy';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

    const variants = {
      primary:
        'bg-gradient-to-b from-[#f03237] via-[#ed2025] to-[#d3181d] text-white hover:brightness-105 active:brightness-95 focus-visible:ring-brand-red shadow-[0_4px_14px_0_rgba(237,32,37,0.39),inset_0_1px_0_0_rgba(255,255,255,0.25)] border-t border-white/20 hover:shadow-[0_6px_20px_0_rgba(237,32,37,0.5),inset_0_1px_0_0_rgba(255,255,255,0.35)]',
      secondary:
        'bg-gradient-to-b from-[#3451b2] via-[#2b4499] to-[#22377d] text-white hover:brightness-105 active:brightness-95 focus-visible:ring-brand-blue shadow-[0_4px_14px_0_rgba(43,68,153,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] border-t border-white/20',
      outline:
        'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-brand-blue shadow-subtle',
      'outline-dark':
        'border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white active:bg-white/15 focus-visible:ring-white/40 backdrop-blur-sm shadow-subtle',
      navy:
        'bg-brand-blue-navy text-white hover:bg-brand-blue-dark focus-visible:ring-brand-blue shadow-md border-t border-white/10',
      ghost:
        'text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 bg-transparent',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 font-semibold',
      md: 'h-10 px-4 text-sm gap-2 font-semibold',
      lg: 'h-12 px-6 text-base gap-2.5 font-bold',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

