'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Smartphone,
  Check,
  RotateCcw,
  KeyRound,
  Radio,
  ArrowLeft,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import { UserRole, WorkspaceUser } from '@/types';
import { requestsService } from '@/services/requestsService';
import { operationsService } from '@/services/operations/operationsService';
import { procurementService } from '@/services/procurement/procurementService';
import { financeService } from '@/services/finance/financeService';

interface RoleConfig {
  role: UserRole;
  deskName: string;
  name: string;
  email: string;
  password: string;
  organization: string;
  icon: React.ElementType;
  badge: string;
  roleTitle: string;
  phoneMasked: string;
  defaultRoute: string;
  portalName: string;
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
    roleTitle: 'Trade Dealership Manager',
    phoneMasked: '+64 21 ••• •821',
    defaultRoute: '/dashboard',
    portalName: 'Customer Trade Portal',
    description: 'Submit parts requests, review landed NZD quotes, approve orders & live tracking.',
    mfaRequired: true,
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
    roleTitle: 'Logistics & MPI Compliance Lead',
    phoneMasked: '+64 27 ••• •492',
    defaultRoute: '/operations/dashboard',
    portalName: 'Logistics & MPI Clearance Hub',
    description: 'Manage NZ customs clearance, MPI biosecurity releases, air/sea freight & courier dispatch.',
    mfaRequired: true,
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
    roleTitle: 'Senior Parts Sourcing Specialist',
    phoneMasked: '+64 21 ••• •114',
    defaultRoute: '/procurement/dashboard',
    portalName: 'Global Sourcing & Bidding Desk',
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
    roleTitle: 'Trade Accounts & Credit Officer',
    phoneMasked: '+64 22 ••• •905',
    defaultRoute: '/finance/dashboard',
    portalName: 'Trade Accounts & Billing Portal',
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
    roleTitle: 'Enterprise System Administrator',
    phoneMasked: '+64 21 ••• •001',
    defaultRoute: '/company',
    portalName: 'System Control & Security Console',
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
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Full Screen Modal State for Two-Factor Auth (MFA Ready)
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);

  // MFA 6-Digit OTP State
  const DEMO_OTP = '482910';
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Security Suite & Lockout State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [mfaModalError, setMfaModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Input references for 6 OTP boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentRoleConfig = WORKSPACE_ROLES.find((r) => r.role === selectedRole) || WORKSPACE_ROLES[0];

  // Handle Role Switch
  const handleSelectRole = (config: RoleConfig) => {
    setSelectedRole(config.role);
    setEmail(config.email);
    setPassword(config.password);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage('');
    setMfaModalError('');
    setIsMfaModalOpen(false);
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

  // Resend OTP Countdown Timer Effect (inside modal)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMfaModalOpen && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMfaModalOpen, resendCountdown]);

  // Auto-focus first OTP input when opening MFA modal
  useEffect(() => {
    if (isMfaModalOpen) {
      const timer = setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isMfaModalOpen]);

  // Handle Initial "SIGN IN" Form Submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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

    setIsSigningIn(true);

    // Simulate enterprise validation and open Full Screen Two-Factor Auth Modal
    setTimeout(() => {
      setIsSigningIn(false);
      setIsMfaModalOpen(true);
      setOtpDigits(['', '', '', '', '', '']);
      setMfaSuccess(false);
      setResendCountdown(30);
      setMfaModalError('');
    }, 450);
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...otpDigits];

    if (cleanVal.length === 1) {
      newDigits[index] = cleanVal;
      setOtpDigits(newDigits);
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const targetFocus = Math.min(5, pasted.length);
      otpInputRefs.current[targetFocus]?.focus();
    } else {
      newDigits[index] = '';
      setOtpDigits(newDigits);
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      triggerMfaVerification(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Escape') {
      setIsMfaModalOpen(false);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);

    const focusIdx = Math.min(5, pastedData.length);
    otpInputRefs.current[focusIdx]?.focus();

    if (pastedData.length === 6) {
      triggerMfaVerification(pastedData);
    }
  };

  // Auto-Fill OTP Demo Function with Sequential Typing Animation
  const handleAutoFillOtp = () => {
    if (isAutoFilling || isVerifyingMfa || mfaSuccess) return;

    setIsAutoFilling(true);
    setMfaModalError('');
    const digits = DEMO_OTP.split('');
    const current = ['', '', '', '', '', ''];
    setOtpDigits(current);

    digits.forEach((digit, index) => {
      setTimeout(() => {
        current[index] = digit;
        setOtpDigits([...current]);
        otpInputRefs.current[index]?.focus();

        if (index === 5) {
          setIsAutoFilling(false);
          setTimeout(() => {
            triggerMfaVerification(DEMO_OTP);
          }, 150);
        }
      }, index * 75);
    });
  };

  // Trigger MFA Verification and Redirect to Respective Portal
  const triggerMfaVerification = async (code: string) => {
    if (isVerifyingMfa || mfaSuccess) return;

    setIsVerifyingMfa(true);
    setMfaModalError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      setMfaSuccess(true);

      const effectiveEmail = email.trim() || currentRoleConfig.email;

      const userSession: WorkspaceUser = {
        id: `usr_${currentRoleConfig.role.toLowerCase()}_1`,
        name: currentRoleConfig.name,
        email: effectiveEmail,
        role: currentRoleConfig.role,
        roleTitle: currentRoleConfig.roleTitle,
        deskName: currentRoleConfig.deskName,
        organization: currentRoleConfig.organization,
        avatar: currentRoleConfig.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        badge: currentRoleConfig.badge,
        permissions: currentRoleConfig.permissions,
        mfaEnabled: true,
        defaultRoute: currentRoleConfig.defaultRoute,
      };

      await requestsService.setCurrentUser(userSession);

      if (selectedRole === 'Operations') {
        operationsService.switchUser(currentRoleConfig.name);
      } else if (selectedRole === 'Procurement') {
        procurementService.switchUser('usr_proc_lead_1');
      } else if (selectedRole === 'Finance') {
        financeService.switchUser('usr_fin_lead_1');
      }

      if (selectedRole !== 'Customer') {
        await requestsService.updateCompanyProfile({
          legalBusinessName: `${currentRoleConfig.organization}`,
          tradingName: `${currentRoleConfig.name} (${currentRoleConfig.role})`,
          businessType: currentRoleConfig.badge,
          nzbn: '9429048291034',
        });
      }

      setTimeout(() => {
        router.push(currentRoleConfig.defaultRoute);
      }, 700);
    } catch (err) {
      console.error(err);
      setIsVerifyingMfa(false);
      setMfaModalError('MFA verification failed. Please try again.');
    }
  };

  // Resend MFA Code
  const handleResendCode = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(30);
    setOtpDigits(['', '', '', '', '', '']);
    setSuccessNotice(`New MFA code dispatched to ${currentRoleConfig.phoneMasked}`);
    setTimeout(() => setSuccessNotice(''), 3500);
    otpInputRefs.current[0]?.focus();
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans text-slate-900 overflow-x-hidden relative">
      {/* ========================================================================= */}
      {/* LEFT SECTION (~60% Desktop): Role Switcher & Enterprise Showcase Hero     */}
      {/* ========================================================================= */}
      <div className="lg:w-[60%] relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-gradient-to-br from-slate-950 via-[#131d3f] to-[#0d1633] text-white min-h-[580px] lg:min-h-screen">
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
              Auto-fills credentials & portal destinations
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
                  className={`relative p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-start gap-2.5 border backdrop-blur-md ${isLastOnMobileTwoCol ? 'col-span-2 sm:col-span-1' : 'col-span-1'
                    } ${isSelected
                      ? 'bg-white/15 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
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
      {/* RIGHT SECTION (~40% Desktop): Clean Authentication Card                   */}
      {/* ========================================================================= */}
      <div className="lg:w-[40%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 shadow-2xl relative z-20 min-h-screen">
        <div className="space-y-3 flex-col justify-between h-full">
          {/* Brand Logo & Version Tag */}
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

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                MFA Ready
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                v2.4
              </span>
            </div>
          </div>
          <div className='space-y-6 flex flex-col h-full align-center justify-center'>
            {/* Heading */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Sign In <span className="inline-block animate-bounce">👋</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select a workspace role above or enter credentials. Two-Factor Authentication (MFA) will verify next.
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

            {/* Form Error Banner */}
            {errorMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${isLockedOut
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

            {/* Credentials Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isLockedOut || isSigningIn}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dealership.co.nz"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
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
                    disabled={isLockedOut || isSigningIn}
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

                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full transition-all duration-300 ${getComplexityLabel().bar}`} />
                </div>


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

              {/* Primary SIGN IN Button */}
              <button
                type="submit"
                disabled={isLockedOut || isSigningIn}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#ed2025] to-[#d3181d] hover:from-[#d3181d] hover:to-[#b31317] hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSigningIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
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

            {/* Register Prompt */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center justify-center mb-6">
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
        </div>
        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Copyright © 2026 PROCURly by Autohub NZ LLC. All rights reserved.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL SCREEN MODAL: TWO-FACTOR AUTH (MFA READY)                            */}
      {/* ========================================================================= */}
      {isMfaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
          {/* Modal Overlay Click Backdrop */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-blue-950/60 opacity-90"
            onClick={() => !isVerifyingMfa && !mfaSuccess && setIsMfaModalOpen(false)}
          />

          {/* Glowing Ambient Light Orbs */}
          <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#ed2025]/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Modal Dialog Card */}
          <div
            className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)] text-white animate-slide-up space-y-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button & Security Level */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-black tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>MFA Ready · Two-Factor Verification</span>
              </div>

              <button
                type="button"
                onClick={() => setIsMfaModalOpen(false)}
                disabled={isVerifyingMfa || mfaSuccess}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                aria-label="Close MFA verification modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Heading */}
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Enter Verification Code</span>
                <span className="text-cyan-400 text-lg font-mono">🔐</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A 6-digit security token has been dispatched to your authenticator app & mobile ending in{' '}
                <strong className="text-white font-mono">{currentRoleConfig.phoneMasked}</strong>.
              </p>
            </div>

            {/* Role Context & Destination Portal Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                    {currentRoleConfig.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentRoleConfig.name}</span>
                      <span className="text-[10px] font-semibold text-cyan-300">({currentRoleConfig.role})</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
                      {currentRoleConfig.email}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700">
                  {currentRoleConfig.badge}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Destination Portal:</span>
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <span>{currentRoleConfig.portalName}</span>
                  <span className="text-[10px] font-mono text-slate-400">({currentRoleConfig.defaultRoute})</span>
                </span>
              </div>
            </div>

            {/* Error Banner inside Modal */}
            {mfaModalError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{mfaModalError}</span>
              </div>
            )}

            {/* Simulated Live Authenticator/SMS Toast with 1-Click Action */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-brand-blue/20 to-emerald-500/15 border border-blue-400/30 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <span>Simulated Authenticator Token:</span>
                    <span className="font-mono text-cyan-300 font-black tracking-wider text-xs">482 910</span>
                  </p>
                  <p className="text-[10px] text-slate-300">Auto-fill ready for instant test verification</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoFillOtp}
                disabled={isAutoFilling || isVerifyingMfa || mfaSuccess}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] shrink-0 flex items-center gap-1 shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-slate-950 animate-pulse" />
                <span>Fill Code</span>
              </button>
            </div>

            {/* 6-Digit OTP Box Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Enter 6-Digit Security PIN</span>
                <span className="text-[10px] text-cyan-400 font-mono">Auto-advance active</span>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={isAutoFilling || isVerifyingMfa || mfaSuccess}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border transition-all focus:outline-none ${digit
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'border-slate-700 bg-slate-950/90 text-white focus:bg-slate-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                      } ${mfaSuccess ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Primary Action Buttons: Auto-Fill + Verify */}
            <div className="space-y-3 pt-1">
              {/* Auto Fill Demo Button */}
              <button
                type="button"
                onClick={handleAutoFillOtp}
                disabled={isAutoFilling || isVerifyingMfa || mfaSuccess}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 border border-cyan-300/40 shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>
                  {isAutoFilling ? 'Auto-typing token (482910)...' : '⚡ Auto-Fill Demo OTP & Enter Portal (482910)'}
                </span>
              </button>

              {/* Verify & Access Button */}
              <button
                type="button"
                onClick={() => triggerMfaVerification(otpDigits.join(''))}
                disabled={isAutoFilling || isVerifyingMfa || mfaSuccess || otpDigits.join('').length < 6}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#ed2025] to-[#d3181d] hover:from-[#d3181d] hover:to-[#b31317] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {mfaSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span>MFA Verified! Redirecting to {currentRoleConfig.portalName}...</span>
                  </>
                ) : isVerifyingMfa ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Security Token...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Enter {currentRoleConfig.role} Portal</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

            {/* Resend Code & Helper Options */}
            <div className="flex items-center justify-between text-xs pt-2 text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Didn&apos;t receive token?</span>
              </div>

              {resendCountdown > 0 ? (
                <span className="font-mono text-slate-400 text-[11px]">
                  Resend in <strong className="text-cyan-300">{resendCountdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend New Code</span>
                </button>
              )}
            </div>

            {/* Back to Sign In / Cancel */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsMfaModalOpen(false)}
                disabled={isVerifyingMfa || mfaSuccess}
                className="text-xs text-slate-400 hover:text-white transition-colors underline disabled:opacity-50"
              >
                ← Back to credentials / switch account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
