'use client';

import React from 'react';
import Link from 'next/link';
import { MultiStepRegisterForm } from '@/components/forms/MultiStepRegisterForm';
import { Box, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-brand-red/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-brand-blue/25 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        {/* Brand Top Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-black text-xl shadow-lg">
              <Box className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white tracking-tight block">Procurly</span>
              <span className="text-[10px] font-bold text-brand-blue-subtle uppercase tracking-widest block -mt-1">
                by Autohub New Zealand
              </span>
            </div>
          </Link>
        </div>

        {/* 4-Step Registration Form */}
        <MultiStepRegisterForm />

        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-white hover:underline">
            Sign In to Trade Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
