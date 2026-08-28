import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Quote Ready':
      return {
        bg: 'bg-blue-50 text-blue-700',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-600 animate-pulse',
      };
    case 'Quote Approved':
      return {
        bg: 'bg-indigo-50 text-indigo-700',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-600',
      };
    case 'In Transit - Air':
      return {
        bg: 'bg-amber-50 text-amber-800',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'In Transit - Sea':
      return {
        bg: 'bg-cyan-50 text-cyan-800',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        dot: 'bg-cyan-600 animate-pulse',
      };
    case 'Customs Clearance':
      return {
        bg: 'bg-purple-50 text-purple-800',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-600 animate-pulse',
      };
    case 'Delivered':
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Sourcing':
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-500 animate-pulse',
      };
    case 'Cancelled':
      return {
        bg: 'bg-red-50 text-red-700',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}
