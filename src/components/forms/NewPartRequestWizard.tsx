'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SAMPLE_VEHICLES, PART_CATEGORIES } from '@/lib/constants';
import { requestsService } from '@/services/requestsService';
import { PartCondition, UrgencyLevel } from '@/types';
import {
  Car,
  FileCheck,
  Camera,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UploadCloud,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function NewPartRequestWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [vehicle, setVehicle] = useState({
    vin: SAMPLE_VEHICLES[0].vin,
    year: SAMPLE_VEHICLES[0].year,
    make: SAMPLE_VEHICLES[0].make,
    model: SAMPLE_VEHICLES[0].model,
    subModel: SAMPLE_VEHICLES[0].subModel,
    engineCode: SAMPLE_VEHICLES[0].engineCode,
    chassisCode: SAMPLE_VEHICLES[0].chassisCode,
    originMarket: SAMPLE_VEHICLES[0].originMarket,
  });

  const [part, setPart] = useState({
    name: 'Front Bumper Cover & Radiator Support Panel',
    partNumber: '52119-0K980',
    category: 'Body Panels & Structural Panels',
    quantity: 1,
    conditionRequired: 'New OEM' as PartCondition,
    vehicleSide: 'Front' as const,
    description: 'Requires factory primed bumper cover and upper radiator support bracket for 2021 facelift model.',
  });

  const [damagePhotos, setDamagePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
  ]);

  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApplyPreset = (presetVin: string) => {
    const found = SAMPLE_VEHICLES.find((v) => v.vin === presetVin);
    if (found) {
      setVehicle({
        vin: found.vin,
        year: found.year,
        make: found.make,
        model: found.model,
        subModel: found.subModel || '',
        engineCode: found.engineCode || '',
        chassisCode: found.chassisCode || '',
        originMarket: found.originMarket,
      });
    }
  };

  const validateStep = (current: number) => {
    const newErrors: Record<string, string> = {};
    if (current === 1) {
      if (!vehicle.make.trim()) newErrors.make = 'Make is required';
      if (!vehicle.model.trim()) newErrors.model = 'Model is required';
      if (!vehicle.vin.trim()) newErrors.vin = 'VIN or Chassis number is required';
    } else if (current === 2) {
      if (!part.name.trim()) newErrors.partName = 'Part name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const account = await requestsService.getTradeAccount();

      const created = await requestsService.createRequest({
        title: `${part.name} - ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        urgency,
        vehicle,
        parts: [
          {
            id: `p_${Date.now()}`,
            name: part.name,
            partNumber: part.partNumber || undefined,
            category: part.category,
            quantity: part.quantity,
            conditionRequired: part.conditionRequired,
            vehicleSide: part.vehicleSide,
            description: part.description,
            damagePhotos: damagePhotos.length > 0 ? damagePhotos : undefined,
          },
        ],
        deliveryAddress: {
          businessName: account.legalBusinessName,
          street: account.deliverySetup.street,
          suburb: account.deliverySetup.suburb,
          city: account.deliverySetup.city,
          postcode: account.deliverySetup.postcode,
          hasForklift: account.deliverySetup.hasForklift,
          hasLoadingDock: account.deliverySetup.hasLoadingDock,
        },
      });

      router.push(`/requests/${created.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Vehicle & VIN', icon: Car },
    { num: 2, title: 'Part Details', icon: FileCheck },
    { num: 3, title: 'Damage Photos', icon: Camera },
    { num: 4, title: 'Urgency & Dispatch', icon: Truck },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Stepper Header */}
      <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Submit New Part Procurement Request</h2>
            <p className="text-xs text-slate-400">
              Direct connection to global OEM & certified parts networks
            </p>
          </div>
          <span className="text-xs font-bold text-red-400 bg-red-950 px-3 py-1 rounded-full border border-red-800">
            Step {step} of 4
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  isCurrent
                    ? 'bg-brand-red border-red-400 text-white shadow-md'
                    : isDone
                    ? 'bg-emerald-950/40 border-emerald-700 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-white text-brand-red'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate">{s.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Vehicle & VIN */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Fast Preset Autofill Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" /> Quick Sample Autofill (Common NZ Trade Models):
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_VEHICLES.map((sv) => (
                  <button
                    key={sv.vin}
                    type="button"
                    onClick={() => handleApplyPreset(sv.vin)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      vehicle.vin === sv.vin
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sv.year} {sv.make} {sv.model} ({sv.originMarket})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vehicle Identification Number (VIN) / Chassis No."
                placeholder="e.g. JTEBX3EJ9K1208941"
                value={vehicle.vin}
                onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })}
                error={errors.vin}
                helperText="Used for 100% verified factory part fitment"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Year"
                  type="number"
                  placeholder="2021"
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: parseInt(e.target.value, 10) || 2021 })}
                />
                <Input
                  label="Origin Market"
                  value={vehicle.originMarket}
                  onChange={(e) => setVehicle({ ...vehicle, originMarket: e.target.value as any })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Make"
                placeholder="e.g. Toyota"
                value={vehicle.make}
                onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                error={errors.make}
              />
              <Input
                label="Model"
                placeholder="e.g. Hilux"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                error={errors.model}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Sub-Model / Badge / Trim"
                placeholder="e.g. SR5 Cruiser 4WD Double Cab"
                value={vehicle.subModel}
                onChange={(e) => setVehicle({ ...vehicle, subModel: e.target.value })}
              />
              <Input
                label="Engine Code / Chassis Code"
                placeholder="e.g. 1GD-FTV / GUN126R"
                value={vehicle.engineCode}
                onChange={(e) => setVehicle({ ...vehicle, engineCode: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Part Specifications */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Part Name & Component Title"
                placeholder="e.g. Right Hand LED Headlight Assembly"
                value={part.name}
                onChange={(e) => setPart({ ...part, name: e.target.value })}
                error={errors.partName}
              />
              <Input
                label="OEM Part Number (if known)"
                placeholder="e.g. 81110-0KP70"
                value={part.partNumber}
                onChange={(e) => setPart({ ...part, partNumber: e.target.value })}
                helperText="Leave blank if unknown; our specialists will match via VIN"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Select
                  label="Category"
                  value={part.category}
                  onChange={(e) => setPart({ ...part, category: e.target.value })}
                >
                  {PART_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="sm:col-span-1">
                <Select
                  label="Vehicle Side / Location"
                  value={part.vehicleSide}
                  onChange={(e) => setPart({ ...part, vehicleSide: e.target.value as any })}
                >
                  <option value="Front">Front</option>
                  <option value="Rear">Rear</option>
                  <option value="Left (Passenger)">Left (Passenger Side)</option>
                  <option value="Right (Driver)">Right (Driver Side)</option>
                  <option value="Engine Bay">Engine Bay</option>
                  <option value="Underbody">Underbody / Chassis</option>
                </Select>
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Quantity Needed"
                  type="number"
                  min="1"
                  value={part.quantity}
                  onChange={(e) => setPart({ ...part, quantity: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Acceptable Part Condition
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'New OEM',
                  'Grade A Used',
                  'Reconditioned',
                  'Certified Aftermarket',
                ].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setPart({ ...part, conditionRequired: cond as PartCondition })}
                    className={`py-2.5 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                      part.conditionRequired === cond
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Specific Fitment Notes or Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Include details such as plug pin count, sensor brackets, color code, or diagnostic codes..."
                value={part.description}
                onChange={(e) => setPart({ ...part, description: e.target.value })}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Damage & Fitment Photos */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">
                Damage & Fitment Photo Upload (Recommended)
              </p>
              <p>
                Attaching photos of the existing damaged component, manufacturer stamp, or donor label ensures 100% fitment accuracy before overseas shipment.
              </p>
            </div>

            {/* Photo Uploader Dropzone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-brand-blue transition-colors bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Drag and drop photos here, or click to browse
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, HEIC up to 15MB each
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 text-xs font-semibold"
                onClick={() => {
                  setDamagePhotos((prev) => [
                    ...prev,
                    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
                  ]);
                }}
              >
                + Add Sample Photo
              </Button>
            </div>

            {/* Uploaded Photos Grid */}
            {damagePhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Attached Photos ({damagePhotos.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {damagePhotos.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Attached damage photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDamagePhotos(damagePhotos.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Urgency & Dispatch */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Urgency & Hoist Priority
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    level: 'Standard' as UrgencyLevel,
                    title: 'Standard Sourcing',
                    desc: 'Scheduled stock replenishment or non-critical repair.',
                    color: 'border-slate-300 bg-white',
                  },
                  {
                    level: 'Urgent' as UrgencyLevel,
                    title: 'Urgent (Priority Air)',
                    desc: 'Vehicle on hoist awaiting parts for immediate assembly.',
                    color: 'border-brand-red bg-red-50/20 text-brand-red',
                  },
                  {
                    level: 'Critical (Vehicle Off Road)' as UrgencyLevel,
                    title: 'Critical VOR (24h Action)',
                    desc: 'Fleet or customer vehicle completely immobilized.',
                    color: 'border-red-600 bg-red-100 text-red-900',
                  },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setUrgency(item.level)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      urgency === item.level
                        ? 'border-brand-red bg-red-50/30 ring-2 ring-red-100 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      {urgency === item.level && <CheckCircle2 className="w-4 h-4 text-brand-red" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Destination Confirmation */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Default Workshop Delivery Address
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Forklift & Dock Verified
                </span>
              </div>
              <p className="text-slate-600">
                Apex Precision Automotive Group Ltd • 18 Church Street, Onehunga, Auckland 1061
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {step > 1 ? (
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

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
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
              Submit Request & Generate Landed Quotes
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
