'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, ShieldCheck } from 'lucide-react';

interface SmoothLogoutModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function SmoothLogoutModal({ isOpen, onClose }: SmoothLogoutModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        router.push('/login');
        if (onClose) onClose();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow ambient background effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon badge */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
            <LogOut className="w-8 h-8 animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">Signing Out...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
          Securing your workspace session and returning to login page.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full w-full animate-pulse rounded-full" />
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-4">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Session tokens cleared cleanly</span>
        </div>
      </div>
    </div>
  );
}
