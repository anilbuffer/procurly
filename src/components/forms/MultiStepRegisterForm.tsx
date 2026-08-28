'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NZ_BUSINESS_TYPES } from '@/lib/constants';
import { requestsService } from '@/services/requestsService';
import {
  Building2,
  Users,
  Truck,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Forklift,
  Info,
} from 'lucide-react';

export function MultiStepRegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Identification
    legalBusinessName: 'Highland Collision & Mechanical Ltd',
    tradingName: 'Highland Auto Body Repairers',
    businessType: 'Collision Repairer',
    nzbn: '9429049102837',
    gstNumber: '119-842-109',

    // Step 2: Contact & Branch Info
    primaryContactName: 'David MacLeod',
    directEmail: 'david@highlandautobody.co.nz',
    phoneNumber: '021 773 9104',
    accountsPayableEmail: 'accounts@highlandautobody.co.nz',
    branchCount: '2',

    // Step 3: Logistics & Delivery Setup
    street: '42 Birmingham Drive',
    suburb: 'Middleton',
    city: 'Christchurch',
    postcode: '8024',
    hasForklift: true,
    hasLoadingDock: false,
    gateCode: '4491',
    deliveryNotes: 'Parts entrance at side roller door.',

    // Step 4: Security & Terms
    password: '',
    confirmPassword: '',
    agreedToTerms: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.legalBusinessName.trim()) newErrors.legalBusinessName = 'Legal business name is required';
      if (!formData.nzbn.trim()) newErrors.nzbn = '13-digit NZBN is required';
      if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
    } else if (step === 2) {
      if (!formData.primaryContactName.trim()) newErrors.primaryContactName = 'Primary contact is required';
      if (!formData.directEmail.trim() || !formData.directEmail.includes('@')) newErrors.directEmail = 'Valid business email is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    } else if (step === 3) {
      if (!formData.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required';
    } else if (step === 4) {
      if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must accept the Autohub Terms of Trade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      await requestsService.updateTradeAccount({
        legalBusinessName: formData.legalBusinessName,
        tradingName: formData.tradingName || formData.legalBusinessName,
        businessType: formData.businessType as any,
        nzbn: formData.nzbn,
        gstNumber: formData.gstNumber,
        primaryContact: {
          name: formData.primaryContactName,
          email: formData.directEmail,
          phone: formData.phoneNumber,
          role: 'Registered Trade Account Admin',
        },
        accountsPayableEmail: formData.accountsPayableEmail,
        branchCount: parseInt(formData.branchCount, 10) || 1,
        deliverySetup: {
          street: formData.street,
          suburb: formData.suburb,
          city: formData.city,
          postcode: formData.postcode,
          hasForklift: formData.hasForklift,
          hasLoadingDock: formData.hasLoadingDock,
          gateCode: formData.gateCode,
          openingHours: 'Mon-Fri 7:30 AM - 5:00 PM',
        },
      });

      // Redirect to dashboard
      router.push('/dashboard?welcome=true');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business Identification', icon: Building2 },
    { number: 2, title: 'Contact & Branches', icon: Users },
    { number: 3, title: 'Logistics Setup', icon: Truck },
    { number: 4, title: 'Security & Terms', icon: Lock },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">NZ Trade Account Registration</h2>
            <p className="text-xs text-slate-400">
              Direct trade access with landed cost guarantees & verified fitment
            </p>
          </div>
          <span className="text-xs font-bold text-red-400 bg-red-950 px-3 py-1 rounded-full border border-red-800">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step) => {
            const isDone = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-brand-blue border-blue-400 text-white shadow-md'
                    : isDone
                    ? 'bg-emerald-950/40 border-emerald-700 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-white text-brand-blue'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-[11px] font-bold truncate">{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Business Identification */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-brand-blue">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Please provide your official NZ registered entity details for automated trade credit verification.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Legal Business Name"
                placeholder="e.g. Precision Motors NZ Ltd"
                value={formData.legalBusinessName}
                onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
                error={errors.legalBusinessName}
              />
              <Input
                label="Trading Name (if different)"
                placeholder="e.g. Precision Auto Panel & Paint"
                value={formData.tradingName}
                onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Select
                  label="Business Type"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                >
                  {NZ_BUSINESS_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>

              <Input
                label="New Zealand Business Number (NZBN)"
                placeholder="9429000000000"
                value={formData.nzbn}
                onChange={(e) => setFormData({ ...formData, nzbn: e.target.value })}
                error={errors.nzbn}
                helperText="13-digit NZBN for instant lookup"
              />

              <Input
                label="GST Number"
                placeholder="123-456-789"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                error={errors.gstNumber}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Contact & Branch Information */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Trade Contact Name"
                placeholder="e.g. Marcus Henderson"
                value={formData.primaryContactName}
                onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                error={errors.primaryContactName}
              />
              <Input
                label="Direct Work Email"
                type="email"
                placeholder="marcus@yourcompany.co.nz"
                value={formData.directEmail}
                onChange={(e) => setFormData({ ...formData, directEmail: e.target.value })}
                error={errors.directEmail}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Phone / Mobile Number"
                placeholder="021 123 4567 or 09 555 1234"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                error={errors.phoneNumber}
              />
              <Input
                label="Accounts Payable Email"
                type="email"
                placeholder="accounts@yourcompany.co.nz"
                value={formData.accountsPayableEmail}
                onChange={(e) => setFormData({ ...formData, accountsPayableEmail: e.target.value })}
                helperText="Invoices and monthly statements will be sent here"
              />
            </div>

            <div className="sm:w-1/2">
              <Select
                label="Number of Operating Branches / Workshops"
                value={formData.branchCount}
                onChange={(e) => setFormData({ ...formData, branchCount: e.target.value })}
              >
                <option value="1">1 Workshop / Branch</option>
                <option value="2">2 - 3 Branches</option>
                <option value="5">4 - 9 Branches</option>
                <option value="10">10+ Nationwide Group</option>
              </Select>
            </div>
          </div>
        )}

        {/* STEP 3: Logistics & Delivery Setup */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Default Workshop Delivery Street Address"
                  placeholder="e.g. 18 Church Street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  error={errors.street}
                />
              </div>
              <Input
                label="Suburb"
                placeholder="e.g. Onehunga"
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="City"
                  placeholder="e.g. Auckland"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  error={errors.city}
                />
                <Input
                  label="Postcode"
                  placeholder="1061"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  error={errors.postcode}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Forklift className="w-4 h-4 text-brand-blue" />
                Delivery Site Access Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.hasForklift}
                    onChange={(e) => setFormData({ ...formData, hasForklift: e.target.checked })}
                    className="w-4 h-4 text-brand-red rounded border-slate-300 focus:ring-brand-red"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Forklift on Site</span>
                    <span className="text-slate-500 text-[11px]">Can unload heavy pallets / engines</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.hasLoadingDock}
                    onChange={(e) => setFormData({ ...formData, hasLoadingDock: e.target.checked })}
                    className="w-4 h-4 text-brand-red rounded border-slate-300 focus:ring-brand-red"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Loading Dock Available</span>
                    <span className="text-slate-500 text-[11px]">Direct truck dock bay</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="Gate / Security Code (Optional)"
                  placeholder="e.g. 4491"
                  value={formData.gateCode}
                  onChange={(e) => setFormData({ ...formData, gateCode: e.target.value })}
                />
                <Input
                  label="Delivery Instructions"
                  placeholder="e.g. Leave at parts counter Bay 2"
                  value={formData.deliveryNotes}
                  onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Account Security & Terms */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Trade Verification Fast-Track</p>
                <p className="text-emerald-700 leading-relaxed">
                  Your NZBN and GST credentials qualify for instant demo portal access and 20th-month-following trade terms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Set Portal Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold">Accept Autohub Group Terms of Trade:</span> I confirm that I am an authorized representative of {formData.legalBusinessName}. I agree to the Procurly B2B procurement terms, verified fitment protocols, and landed customs clearance conditions.
                </div>
              </label>
              {errors.agreedToTerms && (
                <p className="text-xs font-semibold text-red-600">{errors.agreedToTerms}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handlePrev}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="shadow-lg font-bold"
            >
              Complete Registration & Access Portal
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
