'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  ShieldCheck,
  Building2,
  Truck,
  Compass,
  CreditCard,
  Sliders,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Sparkles,
  Smartphone,
  Info,
  Check,
} from 'lucide-react';
import { UserRole } from '@/types';
import { requestsService } from '@/services/requestsService';

interface RoleConfig {
  role: UserRole;
  deskName: string;
  name: string;
  email: string;
  password: string;
  organization: string;
  icon: React.ElementType;
  badge: string;
  description: string;
  mfaRequired: boolean;
  permissions: string[];
}

const WORKSPACE_ROLES: RoleConfig[] = [
  {
    role: 'Customer',
    deskName: 'Trade Desk',
    name: 'James Wilson',
    email: 'james@autocareauckland.co.nz',
    password: 'AutoCareTrade@2026!',
    organization: 'AutoCare Auckland (Verified Dealership)',
    icon: Building2,
    badge: 'Dealership / Repairer',
    description: 'Submit parts requests, review landed NZD quotes, approve orders & live tracking.',
    mfaRequired: false,
    permissions: ['Submit Requests', 'Approve Quotes', 'Online & 20th Billing', 'Track Deliveries'],
  },
  {
    role: 'Operations',
    deskName: 'Logistics & MPI',
    name: 'Marcus Vance',
    email: 'marcus.ops@procurly.autohub.co.nz',
    password: 'OpsLogistics#2026',
    organization: 'Autohub Auckland Hub & Dispatch',
    icon: Truck,
    badge: 'Logistics Ops',
    description: 'Manage NZ customs clearance, MPI biosecurity releases, air/sea freight & courier dispatch.',
    mfaRequired: false,
    permissions: ['MPI Inspection', 'Customs Entry', 'Flight Manifests', 'Warehouse Dispatch'],
  },
  {
    role: 'Procurement',
    deskName: 'Sourcing Desk',
    name: 'Brendon Davies',
    email: 'brendon.sourcing@procurly.autohub.co.nz',
    password: 'SourcingPro$2026',
    organization: 'Autohub Global Parts Procurement',
    icon: Compass,
    badge: 'Sourcing Specialist',
    description: 'Coordinate supplier bidding across Japan, Europe & USA with fitment validation.',
    mfaRequired: true,
    permissions: ['Supplier Bidding', 'Landed Cost Engine', 'OEM Verification', 'Quote Issuance'],
  },
  {
    role: 'Finance',
    deskName: 'Billing & Credit',
    name: 'Sarah Jenkins',
    email: 'sarah.finance@procurly.autohub.co.nz',
    password: 'FinanceSecure&2026',
    organization: 'Autohub Trade Accounts & Credit',
    icon: CreditCard,
    badge: 'Trade Accounts',
    description: 'Review 20th month trade credit lines, NZBN validations, GST duty & merchant clearing.',
    mfaRequired: true,
    permissions: ['Trade Credit Approvals', '20th Month Billing', 'GST Clearance', 'Payment Reconciliation'],
  },
  {
    role: 'Administrator',
    deskName: 'System Control',
    name: 'David Morrison',
    email: 'admin@procurly.autohub.co.nz',
    password: 'AdminMaster!992',
    organization: 'Autohub Platform Administration',
    icon: Sliders,
    badge: 'Super Admin',
    description: 'Manage user access control, rate engine margins, security auditing and system configs.',
    mfaRequired: true,
    permissions: ['Global RBAC', 'Rate Engine Margins', 'Audit Logs', 'Security & MFA Rules'],
  },
];

export default function LoginPage() {
  const router = useRouter();

  // Selected Role & Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>('Customer');
  const [email, setEmail] = useState(WORKSPACE_ROLES[0].email);
  const [password, setPassword] = useState(WORKSPACE_ROLES[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Security Suite State
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaCode, setMfaCode] = useState('482910');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const currentRoleConfig = WORKSPACE_ROLES.find((r) => r.role === selectedRole) || WORKSPACE_ROLES[0];

  // Handle Role Switch
  const handleSelectRole = (config: RoleConfig) => {
    setSelectedRole(config.role);
    setEmail(config.email);
    setPassword(config.password);
    setMfaEnabled(config.mfaRequired);
    setErrorMessage('');
    setSuccessNotice(`Auto-filled credentials for ${config.role} (${config.name})`);
    setTimeout(() => setSuccessNotice(''), 3500);
  };

  // Password Complexity Evaluation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexityScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const getComplexityLabel = () => {
    if (password.length === 0) return { label: 'Empty', color: 'bg-slate-200 text-slate-500', bar: 'w-0' };
    if (complexityScore <= 1) return { label: 'Weak', color: 'bg-red-500 text-red-600', bar: 'w-1/4 bg-red-500' };
    if (complexityScore === 2) return { label: 'Fair', color: 'bg-amber-500 text-amber-600', bar: 'w-2/4 bg-amber-500' };
    if (complexityScore === 3) return { label: 'Good', color: 'bg-blue-500 text-blue-600', bar: 'w-3/4 bg-blue-500' };
    return { label: 'Strong', color: 'bg-emerald-500 text-emerald-600', bar: 'w-full bg-emerald-500' };
  };

  // Lockout Countdown Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLockedOut && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutTimer]);

  // Login Submit Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isLockedOut) {
      setErrorMessage(`Account is locked due to security policy. Please wait ${lockoutTimer}s.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both your registered work email and password.');
      return;
    }

    if (mfaEnabled && mfaCode.length < 6) {
      setErrorMessage('Please enter the 6-digit MFA verification code.');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole === 'Customer') {
        await requestsService.resetToDefaults();
      } else {
        await requestsService.updateCompanyProfile({
          legalBusinessName: `${currentRoleConfig.organization}`,
          tradingName: `${currentRoleConfig.name} (${currentRoleConfig.role})`,
          businessType: currentRoleConfig.badge,
          nzbn: '9429048291034',
        });
      }

      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 600);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLockedOut(true);
        setLockoutTimer(30);
        setErrorMessage('Account locked: 5 consecutive failed attempts. Security cooldown active for 30s.');
      } else {
        setErrorMessage(`Invalid credentials. Attempt ${newAttempts} of 5 before account lockout.`);
      }
    }
  };

  // Quick Simulation Helper for Account Lockout Demo
  const handleSimulateFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    if (newAttempts >= 5) {
      setIsLockedOut(true);
      setLockoutTimer(30);
      setErrorMessage('Account Locked! 5 failed attempts triggered lockout protection policy.');
    } else {
      setErrorMessage(`Failed login simulated (${newAttempts}/5 attempts). Account lockout at 5.`);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans text-slate-900 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* LEFT SECTION (~62% Desktop): Role Switcher & Enterprise Showcase Hero     */}
      {/* ========================================================================= */}
      <div className="lg:w-[62%] relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-gradient-to-br from-slate-950 via-[#131d3f] to-[#0d1633] text-white min-h-[580px] lg:min-h-screen">
        {/* Background Accent Gradients & Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#2b4499_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-blue/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[350px] bg-[#ed2025]/15 rounded-full blur-[140px] pointer-events-none" />

        {/* TOP: Role Selector Header & Grid */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>SELECT WORKSPACE ROLE:</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
              Auto-fills demo credentials
            </span>
          </div>

          {/* Role Cards Horizontal Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {WORKSPACE_ROLES.map((roleItem, idx) => {
              const Icon = roleItem.icon;
              const isSelected = selectedRole === roleItem.role;
              const isLastOnMobileTwoCol = idx === 4;

              return (
                <button
                  key={roleItem.role}
                  type="button"
                  onClick={() => handleSelectRole(roleItem)}
                  className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-start gap-2.5 border backdrop-blur-md ${
                    isLastOnMobileTwoCol ? 'col-span-2 sm:col-span-1' : 'col-span-1'
                  } ${
                    isSelected
                      ? 'bg-white/15 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate leading-tight">
                      {roleItem.role}
                    </p>
                    <p className="text-[10px] text-slate-300 truncate font-medium mt-0.5">
                      {roleItem.deskName}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Success Toast Notice on Auto-Fill */}
          {successNotice && (
            <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 animate-fade-in shadow-lg">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {/* MIDDLE: Bold Hero Showcase */}
        <div className="relative z-10 my-8 lg:my-auto max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#ed2025]" />
            <span>Autohub Enterprise Logistics Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            INTELLIGENT PARTS <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              SOURCING & FREIGHT.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Automate vehicle parts procurement across Japan, Europe & USA. Generate instant landed NZD quotations with MPI biosecurity compliance and track door-to-door delivery with enterprise precision.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MPI & Customs Compliant</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 backdrop-blur-sm">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rapid Air & Sea Freight</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200 backdrop-blur-sm">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>20th Month Trade Credit</span>
            </div>
          </div>
        </div>

        {/* BOTTOM: Trust Badge & Social Proof */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white font-bold text-xs flex items-center justify-center border-2 border-slate-950">
                NZ
              </div>
              <div className="w-8 h-8 rounded-full bg-[#ed2025] text-white font-bold text-xs flex items-center justify-center border-2 border-slate-950">
                AH
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-950">
                50+
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Trusted by 500+ NZ Dealerships & Repairers</p>
              <p className="text-[11px] text-slate-400">Backed by Autohub Global Logistics</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Systems Normal · MPI API v2.4</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SECTION (~38% Desktop): Clean Authentication Card & Security Form   */}
      {/* ========================================================================= */}
      <div className="lg:w-[38%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 shadow-2xl relative z-20 min-h-screen">
        {/* Top Header / Brand Logo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ed2025] to-[#b31317] flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                <Box className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">
                  PROCUR<span className="text-[#ed2025]">ly</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                  by Autohub
                </span>
              </div>
            </Link>

            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              Enterprise v2.4
            </span>
          </div>

          {/* Welcome Heading */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Welcome <span className="inline-block animate-bounce">👋</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please sign in to your trade portal account to continue.
            </p>
          </div>

          {/* Active Workspace Role Pill */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                {React.createElement(currentRoleConfig.icon, { className: 'w-4 h-4 text-cyan-400' })}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Role: <span className="text-[#ed2025]">{currentRoleConfig.role}</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate font-mono">
                  {currentRoleConfig.deskName} · {currentRoleConfig.name}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
              {currentRoleConfig.badge}
            </span>
          </div>

          {/* Form Error / Lockout Banner */}
          {errorMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                isLockedOut
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">
                <p className="font-bold">{isLockedOut ? 'Security Lockout Active' : 'Authentication Notice'}</p>
                <p className="text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isLockedOut || isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dealership.co.nz"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide & Complexity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  Complexity:{' '}
                  <span className={`font-bold ${getComplexityLabel().color}`}>
                    {getComplexityLabel().label}
                  </span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLockedOut || isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all disabled:opacity-50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Progress Bar */}
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                <div className={`h-full transition-all duration-300 ${getComplexityLabel().bar}`} />
              </div>

              {/* Requirements Chips */}
              <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-slate-500 font-medium">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-bold' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300'}`} />
                  8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-bold' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasUppercase ? 'text-emerald-500' : 'text-slate-300'}`} />
                  Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasNumber ? 'text-emerald-500' : 'text-slate-300'}`} />
                  Contains number
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-600 font-bold' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasSpecial ? 'text-emerald-500' : 'text-slate-300'}`} />
                  Special symbol
                </span>
              </div>
            </div>

            {/* MFA Ready Verification Step */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-brand-blue" />
                  <span className="text-xs font-bold text-slate-800">
                    Two-Factor Auth (MFA Ready)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue" />
                </label>
              </div>

              {mfaEnabled && (
                <div className="space-y-1.5 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Enter 6-digit Authenticator / SMS Code:</span>
                    <span className="text-brand-blue font-mono font-bold">Auto-ready</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="482910"
                    className="w-full text-center tracking-[0.35em] font-mono text-base font-black py-2 bg-white border border-blue-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#ed2025] rounded border-slate-300 focus:ring-[#ed2025]"
                />
                <span className="text-slate-600 font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset instructions have been dispatched to your verified email address.')}
                className="font-bold text-brand-blue hover:text-blue-800 hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLockedOut || isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#ed2025] to-[#d3181d] hover:from-[#d3181d] hover:to-[#b31317] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Workspace...</span>
                </>
              ) : isLockedOut ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Locked ({lockoutTimer}s remaining)</span>
                </>
              ) : (
                <>
                  <span>Sign in to workspace</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Account Lockout Demo & Security Footer */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Attempts: <strong className="text-slate-800 font-mono">{failedAttempts}/5</strong> (Lockout Protected)
              </span>
            </div>
            <button
              type="button"
              onClick={handleSimulateFailedAttempt}
              className="text-[10px] font-bold text-slate-500 hover:text-red-600 underline"
            >
              Test Fail Policy
            </button>
          </div>

          {/* Register / Sign Up Prompt */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                New to PROCURly?
              </span>
            </div>

            <Link
              href="/register"
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-emerald-300"
            >
              <span>+ Create an account (Register Trade Portal)</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Copyright © 2026 PROCURly by Autohub NZ LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
