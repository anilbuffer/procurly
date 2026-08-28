'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { requestsService } from '@/services/requestsService';
import { PartQualityPreference, PartConditionPreference, UrgencyLevel } from '@/types';
import {
  Car,
  FileCheck,
  Camera,
  UploadCloud,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  FileText,
  Info,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PRESET_VEHICLES = [
  {
    label: 'Toyota Hiace 2019',
    make: 'Toyota',
    model: 'Hiace',
    year: 2019,
    vin: 'JTEBR32P10029384',
    rego: 'KMR892',
    engine: '1KD-FTV 3.0L Diesel',
    variant: 'ZX Grand Cabin',
    transmission: 'Automatic',
    partName: 'Left Front Lower Control Arm',
    partOEM: '48069-26150',
    notes: 'Must include bushings and lower ball joint intact.',
  },
  {
    label: 'Nissan Leaf 2021',
    make: 'Nissan',
    model: 'Leaf',
    year: 2021,
    vin: 'ZE1-0428910000000',
    rego: 'NPL419',
    engine: 'EM57 Electric Motor',
    variant: 'e+ G 62kWh',
    transmission: 'EV / Direct Drive',
    partName: 'Headlight Assembly (RHS)',
    partOEM: '26010-5SK0A',
    notes: 'Auto-leveling LED type with integrated DRL.',
  },
  {
    label: 'Subaru Outback 2018',
    make: 'Subaru',
    model: 'Outback',
    year: 2018,
    vin: 'JF1BS99C8K0182741',
    rego: 'LQE384',
    engine: 'FB25 2.5L Boxer',
    variant: '2.5i Premium AWD',
    transmission: 'CVT (Continuously Variable)',
    partName: 'Rear Axle Assembly',
    partOEM: '28411-AL010',
    notes: 'Zero backlash required on differential.',
  },
  {
    label: 'Ford Ranger 2022',
    make: 'Ford',
    model: 'Ranger',
    year: 2022,
    vin: 'MNAEY0FF8NW601934',
    rego: 'PRG902',
    engine: 'YN2X 2.0L Bi-Turbo',
    variant: 'Wildtrak Bi-Turbo 4x4',
    transmission: 'Automatic',
    partName: 'Bi-Turbo Intercooler Assembly',
    partOEM: 'JB3G-9L440-BD',
    notes: 'Include cold side outlet hose if available.',
  },
];

const SUGGESTED_PARTS = [
  'Left Front Lower Control Arm',
  'Headlight Assembly (RHS)',
  'Rear Axle Assembly',
  'Intercooler Core Assembly',
  'High-Voltage On-Board Charger (OBC)',
  'Power Steering Rack',
  'Electronic Damping Control Strut',
  'Brake Caliper Assembly',
];

export function NewPartRequestWizard() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Section A: Vehicle Details
  const [vehicle, setVehicle] = useState({
    make: 'Toyota',
    model: 'Hiace',
    year: 2019,
    vin: 'JTEBR32P10029384',
    regoNumber: 'KMR892',
    engineCode: '1KD-FTV',
    subModel: 'ZX Grand Cabin',
    transmission: 'Automatic',
  });

  // Section B: Part Specifications
  const [part, setPart] = useState({
    name: 'Left Front Lower Control Arm',
    partNumber: '48069-26150',
    quantity: 1,
    qualityPreference: 'Genuine OEM' as PartQualityPreference,
    conditionPreference: 'New Only' as PartConditionPreference,
  });

  // Section C: Media & Attachments
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: string; type: string; url: string }[]
  >([
    {
      id: 'att_1',
      name: 'suspension_damage_lh.jpg',
      size: '2.4 MB',
      type: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'att_2',
      name: 'vin_compliance_plate.png',
      size: '1.1 MB',
      type: 'image/png',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    },
  ]);
  const [customerNotes, setCustomerNotes] = useState('Must include bushings and lower ball joint intact.');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApplyPreset = (preset: (typeof PRESET_VEHICLES)[0]) => {
    setVehicle({
      make: preset.make,
      model: preset.model,
      year: preset.year,
      vin: preset.vin,
      regoNumber: preset.rego,
      engineCode: preset.engine,
      subModel: preset.variant,
      transmission: preset.transmission,
    });
    setPart((prev) => ({
      ...prev,
      name: preset.partName,
      partNumber: preset.partOEM,
    }));
    setCustomerNotes(preset.notes);
    setErrors({});
  };

  const handleVinChange = (val: string) => {
    // Sanitize to uppercase alphanumeric
    const clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setVehicle((prev) => ({ ...prev, vin: clean }));
    if (errors.vin) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.vin;
        return next;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newItems = files.map((file, idx) => ({
      id: `att_${Date.now()}_${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...newItems]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!vehicle.make.trim()) errs.make = 'Make is required';
    if (!vehicle.model.trim()) errs.model = 'Model is required';
    if (!vehicle.year) errs.year = 'Year is required';
    if (!vehicle.vin.trim()) {
      errs.vin = 'Full 17-character VIN or Chassis number is required';
    } else if (vehicle.vin.length < 9) {
      errs.vin = 'VIN or Chassis number must be valid';
    }

    if (!part.name.trim()) errs.partName = 'Part Name / Title is required';
    if (part.quantity < 1) errs.quantity = 'Quantity must be at least 1';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const account = await requestsService.getTradeAccount();

      const created = await requestsService.createRequest({
        title: `${part.name} (${part.qualityPreference})`,
        urgency: 'Urgent',
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          year: Number(vehicle.year),
          vin: vehicle.vin,
          regoNumber: vehicle.regoNumber || undefined,
          engineCode: vehicle.engineCode || undefined,
          subModel: vehicle.subModel || undefined,
          transmission: vehicle.transmission || undefined,
          originMarket: 'Japan',
        },
        parts: [
          {
            id: `p_${Date.now()}`,
            name: part.name,
            partNumber: part.partNumber || undefined,
            quantity: part.quantity,
            qualityPreference: part.qualityPreference,
            conditionPreference: part.conditionPreference,
            conditionRequired: part.conditionPreference === 'New Only' ? 'New OEM' : 'Grade A Used',
            description: customerNotes,
            damagePhotos: attachments.map((a) => a.url),
          },
        ],
        deliveryAddress: {
          businessName: account.legalBusinessName || 'Premier Motors NZ',
          street: account.deliverySetup?.street || '45 Great South Rd',
          suburb: account.deliverySetup?.suburb || 'Penrose',
          city: account.deliverySetup?.city || 'Auckland',
          postcode: account.deliverySetup?.postcode || '1061',
          hasForklift: account.deliverySetup?.hasForklift ?? true,
          hasLoadingDock: account.deliverySetup?.hasLoadingDock ?? true,
          deliveryNotes: 'Direct courier delivery to workshop.',
        },
      });

      router.push(`/requests/${created.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Header & Fast Preset Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-red-100 text-[#ed2025] px-2.5 py-0.5 rounded-full border border-red-200">
                Fitment Verified Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Autohub Direct Procurement</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Submit Part Request
            </h1>
            <p className="text-xs text-slate-600">
              Structured 3-step engine designed to eliminate fitment mismatch and calculate instant landed NZD quotes.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 sm:justify-end">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Autofill Sample Fleet Vehicle:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {PRESET_VEHICLES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-blue hover:text-white transition-all border border-slate-200"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: VEHICLE DETAILS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-xs shadow-sm">
              A
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Section A: Vehicle Details
              </h2>
              <p className="text-xs text-slate-500">
                Mandatory fitment specifications and chassis identifiers
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            * Mandatory Fields Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Make */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Make <span className="text-[#ed2025]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Toyota, Nissan, Subaru"
              value={vehicle.make}
              onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.make
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
              }`}
            />
            {errors.make && <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.make}</p>}
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Model <span className="text-[#ed2025]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Hiace, Leaf, Outback"
              value={vehicle.model}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.model
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
              }`}
            />
            {errors.model && <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.model}</p>}
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Year <span className="text-[#ed2025]">*</span>
            </label>
            <select
              value={vehicle.year}
              onChange={(e) => setVehicle({ ...vehicle, year: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100"
            >
              {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* VIN / Chassis Number with Character Count */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Full 17-Character VIN / Chassis <span className="text-[#ed2025]">*</span>
              </label>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  vehicle.vin.length === 17
                    ? 'bg-emerald-100 text-emerald-800'
                    : vehicle.vin.length > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {vehicle.vin.length}/17
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. JTEBR32P10029384"
              value={vehicle.vin}
              onChange={(e) => handleVinChange(e.target.value)}
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 uppercase tracking-wider ${
                errors.vin
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
              }`}
            />
            {errors.vin && <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.vin}</p>}
          </div>
        </div>

        {/* Optional Sub-fields */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Optional Fitment Accuracy Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Registration Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Number (NZ Plate)
              </label>
              <input
                type="text"
                placeholder="e.g. KMR892"
                value={vehicle.regoNumber}
                onChange={(e) => setVehicle({ ...vehicle, regoNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 text-xs uppercase font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Engine Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Engine Code
              </label>
              <input
                type="text"
                placeholder="e.g. 1KD-FTV, FB25, EM57"
                value={vehicle.engineCode}
                onChange={(e) => setVehicle({ ...vehicle, engineCode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Variant */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variant / SubModel
              </label>
              <input
                type="text"
                placeholder="e.g. ZX Grand Cabin, Wildtrak"
                value={vehicle.subModel}
                onChange={(e) => setVehicle({ ...vehicle, subModel: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            {/* Transmission type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transmission Type
              </label>
              <select
                value={vehicle.transmission}
                onChange={(e) => setVehicle({ ...vehicle, transmission: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
              >
                <option value="Automatic">Automatic (Torque Converter)</option>
                <option value="Manual">Manual</option>
                <option value="CVT (Continuously Variable)">CVT (Continuously Variable)</option>
                <option value="Dual-Clutch / DCT / DSG">Dual-Clutch / DCT / DSG</option>
                <option value="EV / Direct Drive">EV / Direct Drive Single-Speed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: PART SPECIFICATIONS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-xs shadow-sm">
            B
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section B: Part Specifications
            </h2>
            <p className="text-xs text-slate-500">
              Component naming, OEM factory codes, and quality grade preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Part Name / Title */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Part Name / Title <span className="text-[#ed2025]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Left Front Lower Control Arm"
              value={part.name}
              onChange={(e) => setPart({ ...part, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.partName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
              }`}
            />
            {errors.partName && (
              <p className="text-[11px] font-semibold text-red-600">{errors.partName}</p>
            )}

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold">Quick suggestions:</span>
              {SUGGESTED_PARTS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPart({ ...part, name: s })}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Required */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Quantity Required <span className="text-[#ed2025]">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPart({ ...part, quantity: Math.max(1, part.quantity - 1) })}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={part.quantity}
                onChange={(e) => setPart({ ...part, quantity: Math.max(1, Number(e.target.value)) })}
                className="w-16 text-center font-bold text-xs py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
              <button
                type="button"
                onClick={() => setPart({ ...part, quantity: part.quantity + 1 })}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Part OEM Number */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Part OEM Number (If known)
          </label>
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="e.g. 48069-26150, 26010-5SK0A"
              value={part.partNumber}
              onChange={(e) => setPart({ ...part, partNumber: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            If unknown, Autohub parts specialists will cross-reference with official factory EPC schematics using your VIN.
          </p>
        </div>

        {/* Preference Radio Selectors */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quality Preference:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Genuine OEM', 'Aftermarket', 'Reconditioned / Used'] as PartQualityPreference[]).map(
                (q) => {
                  const isChecked = part.qualityPreference === q;
                  return (
                    <label
                      key={q}
                      className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#ed2025] bg-red-50/30 text-red-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="qualityPreference"
                        checked={isChecked}
                        onChange={() => setPart({ ...part, qualityPreference: q })}
                        className="sr-only"
                      />
                      <span className="text-xs block">{q}</span>
                    </label>
                  );
                }
              )}
            </div>
          </div>

          {/* Condition Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Condition Preference:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['New Only', 'Used Acceptable'] as PartConditionPreference[]).map((c) => {
                const isChecked = part.conditionPreference === c;
                return (
                  <label
                    key={c}
                    className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                      isChecked
                        ? 'border-brand-blue bg-blue-50/30 text-blue-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="conditionPreference"
                      checked={isChecked}
                      onChange={() => setPart({ ...part, conditionPreference: c })}
                      className="sr-only"
                    />
                    <span className="text-xs block">{c}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: MEDIA & ATTACHMENTS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-xs shadow-sm">
            C
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section C: Media & Attachments
            </h2>
            <p className="text-xs text-slate-500">
              Drag-and-drop damage photos, VIN compliance plate, or schematics (.jpg, .png, .pdf)
            </p>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-[#ed2025] bg-red-50/50 scale-[1.01]'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
          }`}
        >
          <input
            type="file"
            id="fileUploader"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileInput}
            className="sr-only"
          />
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-brand-blue">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Drag and drop files here, or{' '}
                <label
                  htmlFor="fileUploader"
                  className="text-brand-blue hover:underline cursor-pointer font-bold"
                >
                  browse from device
                </label>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports damage photos, VIN plate scans, or wiring schematics (.jpg, .png, .pdf up to 25MB)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files Preview List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700">Uploaded Attachments ({attachments.length}):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-subtle"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Notes Box */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-800">
            Customer Notes & Fitment Instructions
          </label>
          <textarea
            rows={3}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="e.g. Must include bushings, mounting bolts, and lower ball joint intact. Sourcing for urgent customer on hoist."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
          />
          <p className="text-[11px] text-slate-500">
            Provide any specific requirements for your workshop foreman.
          </p>
        </div>
      </div>

      {/* SUBMISSION BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Fitment Certified & Guaranteed by Autohub</span>
          </div>
          <p className="text-xs text-slate-300">
            Submitting will initiate Japanese and European stock queries and calculate landed NZD quotes.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 shadow-glow"
        >
          Submit Part Request
        </Button>
      </div>
    </form>
  );
}
