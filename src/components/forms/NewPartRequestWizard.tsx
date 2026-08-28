'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import {
  PartQualityPreference,
  PartConditionPreference,
  PartCondition,
  DeliveryAddress,
  PartRequest,
} from '@/types';
import {
  Car,
  FileCheck,
  UploadCloud,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  FileText,
  ArrowRight,
  ArrowLeft,
  Building2,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
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
    notes: 'Must include factory rubber bushings and lower ball joint intact.',
  },
  {
    label: 'Mazda CX-5 2021',
    make: 'Mazda',
    model: 'CX-5',
    year: 2021,
    vin: 'JM7KF2W7A00192837',
    rego: 'MZD521',
    engine: 'PY-VPS 2.5L AWD',
    variant: 'GSX',
    transmission: 'Automatic',
    partName: 'Front Headlamp (LED Projector RHS)',
    partOEM: 'KB8A-51-031',
    notes: 'Auto-leveling LED type with integrated DRL.',
  },
  {
    label: 'Ford Ranger 2022',
    make: 'Ford',
    model: 'Ranger',
    year: 2022,
    vin: 'MNAEY0FF8NW601934',
    rego: 'PRG902',
    engine: 'YN2X 2.0L Bi-Turbo',
    variant: 'Wildtrak 4x4',
    transmission: 'Automatic',
    partName: 'Bi-Turbo Intercooler Assembly',
    partOEM: 'JB3G-9L440-BD',
    notes: 'Include cold side outlet hose.',
  },
];

export function NewPartRequestWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<PartRequest | null>(null);

  // Step 01 — Vehicle Details
  const [vehicle, setVehicle] = useState({
    make: 'Toyota',
    model: 'Hiace',
    year: 2019,
    vin: 'JTEBR32P10029384',
    regoNumber: 'KMR892',
    engineCode: '1KD-FTV',
    subModel: 'ZX Grand Cabin',
    transmission: 'Automatic',
    driveConfiguration: 'RWD',
  });

  // Step 02 — Part Specification
  const [part, setPart] = useState({
    name: 'Left Front Lower Control Arm',
    partNumber: '48069-26150',
    quantity: 1,
    qualityPreference: 'Genuine' as PartQualityPreference,
    aftermarketPreference: 'No Preference',
    conditionRequirement: 'New' as PartCondition,
  });

  // Step 03 — Supporting Information
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: string; type: string; url: string }[]
  >([
    {
      id: 'att_1',
      name: 'control_arm_schematic.jpg',
      size: '1.8 MB',
      type: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'att_2',
      name: 'chassis_vin_plate.png',
      size: '1.2 MB',
      type: 'image/png',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState(
    'Must include factory rubber bushings and lower ball joint intact.'
  );

  // Step 04 — Delivery Address
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr_1',
      businessName: 'Auckland Branch',
      street: '12 Example Street',
      suburb: 'Penrose',
      city: 'Auckland',
      postcode: '1061',
      country: 'New Zealand',
      isDefault: true,
      hasForklift: true,
      hasLoadingDock: true,
    },
    {
      id: 'addr_2',
      businessName: 'North Shore Service Hub',
      street: '88 Bush Road',
      suburb: 'Rosedale',
      city: 'Auckland',
      postcode: '0632',
      country: 'New Zealand',
      isDefault: false,
      hasForklift: true,
      hasLoadingDock: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr_1');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    businessName: '',
    street: '',
    suburb: '',
    city: 'Auckland',
    postcode: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { num: 1, label: '01 Vehicle' },
    { num: 2, label: '02 Part' },
    { num: 3, label: '03 Supporting Info' },
    { num: 4, label: '04 Delivery' },
    { num: 5, label: '05 Review' },
  ];

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
      driveConfiguration: 'RWD',
    });
    setPart((prev) => ({
      ...prev,
      name: preset.partName,
      partNumber: preset.partOEM,
    }));
    setAdditionalNotes(preset.notes);
    setErrors({});
  };

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!vehicle.make.trim()) errs.make = 'Vehicle Make is required';
      if (!vehicle.model.trim()) errs.model = 'Vehicle Model is required';
      if (!vehicle.year) errs.year = 'Vehicle Year is required';
      if (!vehicle.vin.trim()) {
        errs.vin = 'VIN / Chassis number is required for accurate EPC fitment';
      } else if (vehicle.vin.length < 8) {
        errs.vin = 'Please enter a valid VIN or chassis number';
      }
    } else if (step === 2) {
      if (!part.name.trim()) errs.partName = 'Part Name is required';
      if (part.quantity < 1) errs.quantity = 'Quantity must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newItems = files.map((file, idx) => ({
        id: `att_${Date.now()}_${idx}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      setAttachments((prev) => [...prev, ...newItems]);
    }
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.businessName || !newAddressForm.street || !newAddressForm.city) return;

    const newAddr: DeliveryAddress = {
      id: `addr_${Date.now()}`,
      businessName: newAddressForm.businessName,
      street: newAddressForm.street,
      suburb: newAddressForm.suburb,
      city: newAddressForm.city,
      postcode: newAddressForm.postcode,
      country: 'New Zealand',
      isDefault: false,
    };

    setSavedAddresses((prev) => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id!);
    setIsAddingNewAddress(false);
    setNewAddressForm({ businessName: '', street: '', suburb: '', city: 'Auckland', postcode: '' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const chosenAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

      const created = await requestsService.createRequest({
        title: part.name,
        urgency: 'Urgent',
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          year: Number(vehicle.year),
          vin: vehicle.vin.toUpperCase(),
          regoNumber: vehicle.regoNumber ? vehicle.regoNumber.toUpperCase() : undefined,
          engineCode: vehicle.engineCode || undefined,
          subModel: vehicle.subModel || undefined,
          transmission: vehicle.transmission || undefined,
          driveConfiguration: vehicle.driveConfiguration || undefined,
          originMarket: 'Japan',
        },
        parts: [
          {
            id: `p_${Date.now()}`,
            name: part.name,
            partNumber: part.partNumber ? part.partNumber.toUpperCase() : undefined,
            quantity: part.quantity,
            qualityPreference: part.qualityPreference,
            conditionPreference: part.conditionRequirement === 'New' ? 'New Only' : 'Used Acceptable',
            conditionRequired: part.conditionRequirement,
            description: additionalNotes,
            damagePhotos: attachments.map((a) => a.url),
          },
        ],
        deliveryAddress: {
          businessName: chosenAddress.businessName,
          street: chosenAddress.street,
          suburb: chosenAddress.suburb,
          city: chosenAddress.city,
          postcode: chosenAddress.postcode,
          hasForklift: chosenAddress.hasForklift ?? true,
          hasLoadingDock: chosenAddress.hasLoadingDock ?? true,
          deliveryNotes: 'AutoCare Auckland Workshop Inwards',
        },
      });

      setSubmittedRequest(created);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE VIEW
  if (submittedRequest) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-card text-center space-y-6 max-w-2xl mx-auto animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Request Submitted
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Your parts request has been successfully submitted to Autohub.
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our procurement team will begin reviewing your request and coordinate sourcing through our supplier network.
          </p>
        </div>

        {/* Request Card Badge */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Request Number:</span>
            <span className="font-mono font-black text-slate-900">{submittedRequest.referenceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle:</span>
            <span className="font-bold text-slate-900">
              {submittedRequest.vehicle.year} {submittedRequest.vehicle.make} {submittedRequest.vehicle.model}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Part:</span>
            <span className="font-semibold text-slate-800">{submittedRequest.parts[0]?.name}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="text-slate-500">Status:</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Sourcing & Quote Ready
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`/requests/${submittedRequest.id}`} className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md"
            >
              View Request →
            </button>
          </Link>
          <Link href="/requests" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto text-xs font-bold">
              Return to Requests List
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-[#ed2025] px-2 py-0.5 rounded-full border border-red-200">
              Guided Sourcing Wizard
            </span>
            <span className="text-xs text-slate-500 font-medium">Autohub Customer Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            New Part Request
          </h1>
          <p className="text-xs text-slate-500">
            Precision 5-step procurement wizard for trade customers.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="space-y-1 sm:text-right">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 sm:justify-end">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Autofill Trade Example:
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

      {/* Progress Indicator: 01 Vehicle -> 02 Part -> 03 Supporting Info -> 04 Delivery -> 05 Review */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card overflow-x-auto">
        <div className="flex items-center justify-between min-w-[550px]">
          {steps.map((s, idx) => {
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <React.Fragment key={s.num}>
                <div
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    isCurrent
                      ? 'text-[#ed2025] font-black'
                      : isCompleted
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#ed2025] text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-xs whitespace-nowrap">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      currentStep > s.num ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        {/* ================= STEP 01: VEHICLE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Step 01 — Tell us about the vehicle
                </h2>
                <p className="text-xs text-slate-500">
                  Required vehicle identification details for factory EPC parts cataloguing
                </p>
              </div>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                * Required Fields
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
                  placeholder="e.g. Toyota, Mazda, Ford"
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
                  placeholder="e.g. Hiace, CX-5, Ranger"
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
                >
                  {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* VIN / Chassis Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    VIN / Chassis Number <span className="text-[#ed2025]">*</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {vehicle.vin.length} chars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. JTEBR32P10029384"
                  value={vehicle.vin}
                  onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
                  className={`w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.vin
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-blue focus:ring-blue-100'
                  }`}
                />
                {errors.vin && <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.vin}</p>}
              </div>
            </div>

            {/* Optional Sub-fields */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Optional Fitment Accuracy Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Registration (Plate)</label>
                  <input
                    type="text"
                    placeholder="e.g. KMR892"
                    value={vehicle.regoNumber}
                    onChange={(e) => setVehicle({ ...vehicle, regoNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Engine Type / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1KD-FTV 3.0L"
                    value={vehicle.engineCode}
                    onChange={(e) => setVehicle({ ...vehicle, engineCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Variant / SubModel</label>
                  <input
                    type="text"
                    placeholder="e.g. ZX Grand Cabin"
                    value={vehicle.subModel}
                    onChange={(e) => setVehicle({ ...vehicle, subModel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Transmission</label>
                  <select
                    value={vehicle.transmission}
                    onChange={(e) => setVehicle({ ...vehicle, transmission: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                    <option value="Dual-Clutch / DSG">Dual-Clutch / DSG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Drive Configuration</label>
                  <select
                    value={vehicle.driveConfiguration}
                    onChange={(e) => setVehicle({ ...vehicle, driveConfiguration: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="RWD">RWD</option>
                    <option value="FWD">FWD</option>
                    <option value="4WD">4WD</option>
                    <option value="AWD">AWD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 02: PART ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Step 02 — What part do you need?
              </h2>
              <p className="text-xs text-slate-500">
                Specify component names, OEM numbers, quality grade, and required condition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Part Name */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Part Name <span className="text-[#ed2025]">*</span>
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
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Quantity <span className="text-[#ed2025]">*</span>
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
                    value={part.quantity}
                    onChange={(e) => setPart({ ...part, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-16 text-center font-bold text-xs py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
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
                Part Number (If known)
              </label>
              <input
                type="text"
                placeholder="e.g. 48069-26150"
                value={part.partNumber}
                onChange={(e) => setPart({ ...part, partNumber: e.target.value.toUpperCase() })}
                className="w-full max-w-md px-3.5 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If unknown, Autohub will cross-reference the exact OEM part code from vehicle chassis.
              </p>
            </div>

            {/* Preferences: Quality & Condition Requirement */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Genuine vs Aftermarket Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quality Preference:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Genuine', 'Aftermarket', 'No Preference'] as PartQualityPreference[]).map((q) => {
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
                  })}
                </div>
              </div>

              {/* Condition Requirement: New, Used, Reconditioned, No Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Condition Requirement:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['New', 'Used', 'Reconditioned', 'No Preference'] as PartCondition[]).map((c) => {
                    const isChecked = part.conditionRequirement === c;
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
                          name="conditionRequirement"
                          checked={isChecked}
                          onChange={() => setPart({ ...part, conditionRequirement: c })}
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
        )}

        {/* ================= STEP 03: SUPPORTING INFO ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Step 03 — Supporting Information
              </h2>
              <p className="text-xs text-slate-500">
                Help us identify the right part by uploading photos, documents, or notes
              </p>
            </div>

            {/* Drag and Drop Component */}
            <div className="border-2 border-dashed border-slate-300 hover:border-[#ed2025] bg-slate-50 hover:bg-red-50/20 rounded-2xl p-8 text-center transition-all">
              <input
                type="file"
                id="wizardFileUpload"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-brand-blue">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    <label
                      htmlFor="wizardFileUpload"
                      className="text-brand-blue hover:underline cursor-pointer font-bold"
                    >
                      Drop files here or browse
                    </label>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Supported: JPG · PNG · PDF (Maximum 10MB per file)
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Files Chips */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Uploaded Attachments ({attachments.length}):</span>
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
                        onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== file.id))}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes Textarea */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                Additional Notes
              </label>
              <textarea
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Tell us anything else that may help our procurement team..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 04: DELIVERY ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Step 04 — Where should we deliver it?
                </h2>
                <p className="text-xs text-slate-500">
                  Select a saved workshop address or add a new delivery destination
                </p>
              </div>

              {!isAddingNewAddress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNewAddress(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  + Add Delivery Address
                </Button>
              )}
            </div>

            {/* Saved Addresses Radio Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;

                return (
                  <label
                    key={addr.id}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 block ${
                      isSelected
                        ? 'border-[#ed2025] bg-red-50/20 ring-2 ring-red-100 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryAddressSelection"
                      checked={isSelected}
                      onChange={() => setSelectedAddressId(addr.id!)}
                      className="mt-1"
                    />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{addr.businessName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{addr.street}</p>
                      <p className="text-slate-600">{addr.suburb ? `${addr.suburb}, ` : ''}{addr.city}, {addr.postcode || 'New Zealand'}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Inline Add Address Form */}
            {isAddingNewAddress && (
              <form onSubmit={handleSaveNewAddress} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Add New Workshop Delivery Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Branch / Location Name</label>
                    <input
                      type="text"
                      placeholder="e.g. West Auckland Depot"
                      value={newAddressForm.businessName}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, businessName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 50 Lincoln Road"
                      value={newAddressForm.street}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Suburb</label>
                    <input
                      type="text"
                      placeholder="e.g. Henderson"
                      value={newAddressForm.suburb}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, suburb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Postcode</label>
                    <input
                      type="text"
                      placeholder="e.g. 0612"
                      value={newAddressForm.postcode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, postcode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setIsAddingNewAddress(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Address
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= STEP 05: REVIEW ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-slide-up">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Step 05 — Review & Submit
              </h2>
              <p className="text-xs text-slate-500">
                Please review your request specifications before transmitting to Autohub procurement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Vehicle Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue block">
                  Vehicle Summary
                </span>
                <p className="text-sm font-black text-slate-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <div className="space-y-1 text-slate-600">
                  <p>VIN: <span className="font-mono font-bold text-slate-900">{vehicle.vin}</span></p>
                  {vehicle.regoNumber && <p>Plate: <span className="font-mono font-bold">{vehicle.regoNumber}</span></p>}
                  {vehicle.engineCode && <p>Engine: {vehicle.engineCode}</p>}
                  {vehicle.subModel && <p>Variant: {vehicle.subModel}</p>}
                </div>
              </div>

              {/* Requested Part Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue block">
                  Requested Part
                </span>
                <p className="text-sm font-black text-slate-900">{part.name}</p>
                <div className="space-y-1 text-slate-600">
                  <p>Quantity: <span className="font-bold text-slate-900">{part.quantity}</span></p>
                  <p>Preference: <span className="font-bold text-slate-900">{part.qualityPreference}</span></p>
                  <p>Condition: <span className="font-bold text-slate-900">{part.conditionRequirement}</span></p>
                  {part.partNumber && <p>Part OEM #: <span className="font-mono">{part.partNumber}</span></p>}
                </div>
              </div>

              {/* Attachments Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue block">
                  Attachments & Notes
                </span>
                <p className="font-bold text-slate-900">
                  {attachments.length} files attached
                </p>
                {additionalNotes ? (
                  <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    &ldquo;{additionalNotes}&rdquo;
                  </p>
                ) : (
                  <p className="text-slate-400">No additional notes provided.</p>
                )}
              </div>

              {/* Delivery Destination Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue block">
                  Delivery Destination
                </span>
                {(() => {
                  const addr = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
                  return (
                    <div>
                      <p className="text-sm font-black text-slate-900">{addr.businessName}</p>
                      <p className="text-slate-600">{addr.street}</p>
                      <p className="text-slate-600">{addr.suburb ? `${addr.suburb}, ` : ''}{addr.city}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Fitment Guarantee Banner */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">100% Fitment Certified Guarantee by Autohub</p>
                <p className="text-[11px] text-emerald-700">
                  Upon submission, Autohub specialists will verify the part specifications against factory EPC schematics and generate landed quotations within hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEPPER NAVIGATION BUTTONS */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="text-xs font-bold"
              >
                Back
              </Button>
            )}
          </div>

          <div>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <span>Continue →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-glow transition-all active:scale-[0.98]"
              >
                <span>{isSubmitting ? 'Submitting Request...' : 'Submit Parts Request'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
