'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Menu, X, ShieldCheck, ArrowRight, Box } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-subtle">
      {/* Top micro banner for NZ trade credentials */}
      <div className="bg-brand-blue-navy text-white text-[10px] sm:text-[11px] font-medium py-1.5 px-3 sm:px-4 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-red-400 font-semibold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% NZ Trade
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300 truncate">
              Verified Fitment Guarantees & Landed NZD Quotes
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300 shrink-0">
            <span className="hidden lg:inline">Toll Free: 0800 288 6482</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-semibold text-[10px] sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Direct Freight Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="flex items-center justify-between h-16 sm:h-18 py-2.5 sm:py-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-black text-xl shadow-sm tracking-tighter group-hover:scale-105 transition-transform">
              <Box className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-heading font-extrabold tracking-tight text-slate-900">
                  Procurly
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-brand-blue uppercase tracking-widest -mt-0.5">
                by Autohub New Zealand Limited
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${active
                    ? 'text-brand-blue bg-brand-blue-light/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                size="md"
                className="font-semibold text-xs tracking-wide"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-semibold text-xs tracking-wide"
              >
                Trade Portal Access
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button & Portal Quick Link */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="text-xs font-bold px-2.5">
                Portal
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[105px] bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-slide-up shadow-2xl">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(link.href)
                    ? 'text-brand-blue bg-brand-blue-light font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="md" className="w-full text-xs font-bold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="md" className="w-full text-xs font-bold">
                  Register Trade
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

