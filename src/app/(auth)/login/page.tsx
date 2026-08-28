'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Box, ShieldCheck, ArrowRight, Building2, Wrench, Truck } from 'lucide-react';
import { requestsService } from '@/services/requestsService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('marcus.h@apexautocraft.co.nz');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  const handleQuickDemo = async (type: 'apex' | 'southern' | 'fleet') => {
    setIsLoading(true);
    if (type === 'apex') {
      await requestsService.updateTradeAccount({
        legalBusinessName: 'Apex Precision Automotive Group Ltd',
        tradingName: 'Apex Euro & Japanese Specialists',
        businessType: 'Collision Repairer',
        nzbn: '9429048291034',
      });
    } else if (type === 'southern') {
      await requestsService.updateTradeAccount({
        legalBusinessName: 'Southern Prestige European Ltd',
        tradingName: 'Southern Prestige Motors Christchurch',
        businessType: 'Specialist Importer',
        nzbn: '9429041829102',
      });
    } else {
      await requestsService.updateTradeAccount({
        legalBusinessName: 'NZ Fleet Maintenance Operations Ltd',
        tradingName: 'National Fleet Care',
        businessType: 'Fleet Operator',
        nzbn: '9429049918231',
      });
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetic glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-blue/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/10 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-4">
        {/* Brand Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform">
            <Box className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-tight block">Procurly</span>
            <span className="text-xs font-bold text-brand-blue-subtle uppercase tracking-widest block -mt-1">
              Trade Portal by Autohub
            </span>
          </div>
        </Link>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Sign In to Your Trade Portal
        </h2>
        <p className="text-xs text-slate-400">
          Access active parts requests, landed quotations, and live freight tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-200 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 text-brand-red rounded border-slate-300 focus:ring-brand-red"
                />
                <span className="text-slate-600">Remember this device</span>
              </label>
              <a href="#" className="font-semibold text-brand-blue hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold text-xs tracking-wide shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Trade Account
            </Button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              ⚡ Instant 1-Click Demo Access
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('apex')}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-red-50/50 hover:border-red-200 flex items-center justify-between text-left transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-brand-red" />
                  <div>
                    <span className="font-bold text-slate-800 block">Apex Collision & Japanese</span>
                    <span className="text-[10px] text-slate-500">Auckland • Active Consignments</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('southern')}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 flex items-center justify-between text-left transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-brand-blue" />
                  <div>
                    <span className="font-bold text-slate-800 block">Southern Prestige European</span>
                    <span className="text-[10px] text-slate-500">Christchurch • OEM Importer</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don&apos;t have an Autohub trade account?{' '}
            <Link href="/register" className="font-bold text-brand-red hover:underline">
              Register Trade Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
