'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { QuickQuoteEstimator } from '@/components/forms/QuickQuoteEstimator';
import {
  ArrowRight,
  ShieldCheck,
  Plane,
  Ship,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  FileCheck,
  Search,
  Building2,
  Award,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  Cpu,
  Radio,
  BadgeCheck,
  CreditCard,
  Zap,
  Headphones,
  Star,
  HelpCircle,
  Phone,
  MessageSquare,
  Wrench,
  Car,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);
  const [selectedHotspot, setSelectedHotspot] = useState<number>(1);
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [selectedSourcedCategory, setSelectedSourcedCategory] = useState<string>('All');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // 3D Schematic Interactive Hotspots
  const schematicParts = [
    {
      id: 1,
      name: 'OEM LED Matrix Headlamp (L/H)',
      partNumber: '81110-0KP80',
      x: '24%',
      y: '32%',
      category: 'Lighting & Body',
      status: 'In Air Transit (NRT ✈ AKL)',
      landedCost: '$1,840 NZD',
      leadTime: '3 Days',
      fitment: '100% Guaranteed',
      origin: 'Tokyo OEM Depot',
    },
    {
      id: 2,
      name: 'Twin-Scroll Turbocharger Assembly',
      partNumber: '17201-0L041',
      x: '52%',
      y: '48%',
      category: 'Powertrain',
      status: 'Pre-Cleared NZ Customs',
      landedCost: '$2,450 NZD',
      leadTime: '3-4 Days',
      fitment: '100% Guaranteed',
      origin: 'Nagoya Central Hub',
    },
    {
      id: 3,
      name: 'Monobloc 4-Piston Caliper Kit',
      partNumber: '47730-0K310',
      x: '76%',
      y: '68%',
      category: 'Braking & Chassis',
      status: 'Dispatched Export Hub',
      landedCost: '$890 NZD',
      leadTime: '4 Days',
      fitment: '100% Guaranteed',
      origin: 'Melbourne Logistics',
    },
  ];

  const activePart = schematicParts.find((p) => p.id === selectedHotspot) || schematicParts[0];

  const workflowSteps = [
    {
      id: 1,
      number: '01',
      title: 'Submit Request',
      subtitle: 'VIN, OEM Details & Photos',
      description:
        'Enter VIN or chassis code, specify required part condition (New OEM, Grade A Used, or Certified), and attach damage photos for 100% fitment verification.',
      icon: FileCheck,
      details: [
        'Integrated Japanese, European & Trans-Tasman VIN lookup',
        'Upload damage photos & component labels directly',
        'Hoist urgency flags (Standard, Urgent, Critical VOR)',
      ],
      stageTag: 'PROCURLY_REQ_VALIDATE',
      metrics: 'Under 15 Mins Verification',
      codePreview: {
        vin: 'JTFBA32G0P004921',
        fitmentCheck: 'MATCH_CONFIRMED',
        oemRef: '81110-0KP80',
        biosecurityPreclear: true,
      },
    },
    {
      id: 2,
      number: '02',
      title: 'Sourcing & Quotation',
      subtitle: 'Global Network & Landed Cost',
      description:
        'The Autohub procurement team connects directly to trusted OEM suppliers across Japan, Australia, and Europe to calculate transparent landed NZD pricing.',
      icon: Layers,
      details: [
        'Verified supplier inventory checks in Tokyo & Melbourne',
        'All-inclusive pricing (Part + Freight + Duties + GST + Delivery)',
        'Zero surprise hidden customs or biosecurity brokerage fees',
      ],
      stageTag: 'GLOBAL_SUPPLIER_MATCH',
      metrics: 'Immediate / Under 2 Hours',
      codePreview: {
        supplierId: 'TYO-OEM-8891',
        currency: 'NZD_ALL_INCLUSIVE',
        dutyRate: '0.00% (Free Trade)',
        gstIncluded: true,
      },
    },
    {
      id: 3,
      number: '03',
      title: 'Freight Choice & Approval',
      subtitle: 'Express Air vs Consolidated Sea',
      description:
        'Compare side-by-side Air vs. Sea freight delivery timeframes and landed costs. Approve with one click to trigger immediate dispatch from overseas export depots.',
      icon: Plane,
      details: [
        'Priority Air: 3-5 Business Days to Auckland / Christchurch',
        'Consolidated Sea: 18-24 Days for heavy & non-urgent parts',
        'Instant credit account billing (20th month following)',
      ],
      stageTag: 'ROUTING_AIR_DISPATCH',
      metrics: 'Instant One-Click Approval',
      codePreview: {
        carrier: 'Air New Zealand Cargo (NZ90)',
        route: 'NRT -> AKL Direct',
        customsStatus: 'PRE_LODGED',
        dispatchWindow: '< 12 Hours',
      },
    },
    {
      id: 4,
      number: '04',
      title: 'Track to Delivery',
      subtitle: 'Live Workshop Delivery (AH-P-000123)',
      description:
        'Monitor live milestone tracking from foreign airport/port departure through NZ Customs & MPI clearance straight to your workshop hoist.',
      icon: Compass,
      details: [
        'Real-time flight (Air NZ) and vessel tracking numbers',
        'MPI biosecurity green-lane automated release status',
        'Direct delivery signature with forklift / dock coordination',
      ],
      stageTag: 'LAST_MILE_DELIVERY',
      metrics: 'Door-to-Hoist ETA Live',
      codePreview: {
        consignmentId: 'AH-P-000123',
        mpiClearance: 'APPROVED_GREEN_LANE',
        localCourier: 'Post Haste Logistics NZ',
        etaWorkshop: 'Tomorrow 11:30 AM',
      },
    },
  ];

  // Recently Sourced Real-world Parts Showcase Data
  const recentlySourcedParts = [
    {
      id: 'REC-01',
      partName: 'LED Matrix Headlamp Unit (R/H)',
      vehicle: '2021 Toyota Hilux SR5 Cruiser',
      category: 'Lighting & Body',
      oemRef: '81110-0KP80',
      route: 'Tokyo (NRT) ✈ Auckland (AKL)',
      leadTime: '3 Days',
      landedCost: '$1,840 NZD',
      condition: 'New OEM Factory Sealed',
      hub: 'Penrose Depot',
      badge: 'Priority Air',
    },
    {
      id: 'REC-02',
      partName: 'Hybrid Inverter & Converter Assembly',
      vehicle: '2019 Lexus RX450h AWD',
      category: 'Hybrid & EV',
      oemRef: 'G9200-48190',
      route: 'Nagoya Hub ✈ Christchurch (CHC)',
      leadTime: '4 Days',
      landedCost: '$2,950 NZD',
      condition: 'Grade A Certified Used',
      hub: 'Middleton Hub',
      badge: 'VOR Express',
    },
    {
      id: 'REC-03',
      partName: 'Electronic Power Steering Rack',
      vehicle: '2022 BMW 330e (G20 Series)',
      category: 'Braking & Chassis',
      oemRef: '32106889422',
      route: 'Munich Depot ✈ Wellington (WLG)',
      leadTime: '5 Days',
      landedCost: '$2,480 NZD',
      condition: 'New OEM Certified',
      hub: 'Seaview Logistics',
      badge: 'European Express',
    },
    {
      id: 'REC-04',
      partName: '62kWh Main Traction Battery Module',
      vehicle: '2020 Nissan Leaf e+ (ZE1)',
      category: 'Hybrid & EV',
      oemRef: '295B0-5SH0A',
      route: 'Yokohama Port 🚢 Auckland Port',
      leadTime: '16 Days',
      landedCost: '$3,400 NZD',
      condition: 'Grade A Tested (SOH 94%)',
      hub: 'Penrose Depot',
      badge: 'Consolidated Sea',
    },
    {
      id: 'REC-05',
      partName: 'Twin-Turbocharger Kit with Actuator',
      vehicle: '2022 Ford Ranger Wildtrak Bi-Turbo',
      category: 'Powertrain',
      oemRef: 'JB3G-6K682-EB',
      route: 'Melbourne Logistics ✈ Penrose Workshop',
      leadTime: '3 Days',
      landedCost: '$2,150 NZD',
      condition: 'New OEM Factory',
      hub: 'Penrose Depot',
      badge: 'Trans-Tasman Air',
    },
    {
      id: 'REC-06',
      partName: 'Dynamic Front Air Suspension Strut',
      vehicle: '2018 Audi RS4 Avant Quattro',
      category: 'Braking & Chassis',
      oemRef: '4M0616039AD',
      route: 'Frankfurt Hub ✈ Auckland Air Hub',
      leadTime: '4 Days',
      landedCost: '$1,920 NZD',
      condition: 'New OEM Genuine',
      hub: 'Penrose Depot',
      badge: 'Priority Air',
    },
  ];

  const categories = ['All', 'Lighting & Body', 'Powertrain', 'Hybrid & EV', 'Braking & Chassis'];

  const filteredSourcedParts =
    selectedSourcedCategory === 'All'
      ? recentlySourcedParts
      : recentlySourcedParts.filter((p) => p.category === selectedSourcedCategory);

  // Comparison Matrix items
  const comparisonItems = [
    {
      feature: 'Supplier Sourcing & Quotes',
      oldWay: '4 to 7 separate emails, WhatsApp chats, overseas brokers, and currency conversion spreadsheets.',
      procurlyWay: 'Single unified portal querying 50+ vetted Japanese, European & Trans-Tasman OEM networks.',
    },
    {
      feature: 'Landed NZD Cost Structure',
      oldWay: 'Unpredictable costs. Surprise customs duty, biosecurity fees, and port demurrage invoices received weeks later.',
      procurlyWay: '100% Guaranteed Landed NZD quote upfront (Part + Freight + Duties + 15% GST + Workshop Delivery).',
    },
    {
      feature: 'Fitment Verification & Risk',
      oldWay: 'High risk of wrong parts. Returning incorrect parts to overseas depots is nearly impossible or cost-prohibitive.',
      procurlyWay: '100% Fitment Guarantee. Pre-verified against official VIN and chassis engineering diagrams prior to export.',
    },
    {
      feature: 'Shipping Speed & Telemetry',
      oldWay: 'Zero real-time visibility. Weeks of radio silence while parts sit in overseas freight holding bays.',
      procurlyWay: 'Real-time Air NZ Cargo flight tracking and door-to-hoist milestone telemetry with live ETAs.',
    },
    {
      feature: 'Billing & Accounting Terms',
      oldWay: 'Multiple international credit card fees, telegraphic transfer slips, and fragmented bookkeeping.',
      procurlyWay: 'Single consolidated New Zealand Tax Invoice on 20th of the month trade credit terms.',
    },
  ];

  // Testimonials Data
  const testimonials = [
    {
      id: 1,
      quote:
        'We specialize in European late-model collision repairs. Before Procurly, hunting down steering racks or hybrid components from Europe took 3-4 days of emails. With Procurly, we get an all-inclusive landed quote in under 90 minutes and parts are on our hoist in 4 days.',
      name: 'Dave Henderson',
      role: 'Owner & Head Technician',
      company: 'Henderson European Specialists',
      location: 'Christchurch',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      rating: 5,
      badge: 'MTA Certified Workshop',
    },
    {
      id: 2,
      quote:
        'The 100% Fitment Guarantee is the game-changer for our workshop. When a commercial van is stuck on the hoist (VOR), we cannot afford wrong parts. Autohub cross-references the chassis diagram before shipping, eliminating costly rework.',
      name: 'Mark Sutherland',
      role: 'Operations & Fleet Manager',
      company: 'Auckland Commercial Fleet Services',
      location: 'Penrose, Auckland',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
      rating: 5,
      badge: 'Fleet Repairer Network',
    },
    {
      id: 3,
      quote:
        'Having all customs brokerage, MPI biosecurity clearance, and Air New Zealand freight consolidated into one simple 20th-of-the-month NZ GST invoice made our accounts department fall in love with Procurly.',
      name: 'Liam O’Connor',
      role: 'Procurement Director',
      company: 'Waikato Prestige Panel & Paint',
      location: 'Hamilton',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      rating: 5,
      badge: 'Capricorn Trade Member',
    },
  ];

  // FAQs Data
  const faqs = [
    {
      question: 'How is the Landed Cost calculated, and are there any hidden fees?',
      answer:
        'Every Procurly quote is 100% all-inclusive. It covers the foreign supplier purchase price, international priority air or sea freight, NZ Customs tariff filing, MPI biosecurity quarantine inspection fees, 15% NZ GST, and final courier delivery directly to your workshop hoist. You will never receive a surprise supplementary bill.',
    },
    {
      question: 'What happens if a sourced part does not fit my customer’s vehicle?',
      answer:
        'We operate with a strict 100% Fitment Guarantee. Before any part is dispatched from Tokyo, Melbourne, or Munich, our procurement specialists cross-validate the part number against official factory chassis schematics and your submitted VIN. If a verified part fails to fit, we arrange immediate replacement or full credit.',
    },
    {
      question: 'Can my workshop pay on 20th of the month trade credit terms?',
      answer:
        'Yes! Approved New Zealand automotive trade businesses, licensed motor vehicle dealers (LMVD), and registered repair workshops can open a consolidated 20th of the month following trade credit account during registration.',
    },
    {
      question: 'How fast is Priority Air Freight compared to Sea Freight?',
      answer:
        'Priority Air Freight delivers to your Auckland or Christchurch workshop in 3 to 5 business days from overseas departure. Consolidated Sea Freight takes 16 to 24 days and is recommended for large, heavy items like complete engines, gearboxes, or non-urgent body shells to optimize freight costs.',
    },
    {
      question: 'Do I need a New Zealand Customs Client Code or Import License?',
      answer:
        'No. Autohub acts as the official importer of record and handles all customs declarations, MPI biosecurity clearances, and documentation under our established bonded logistics licenses.',
    },
    {
      question: 'Can you source rare, discontinued, or JDM Japanese-spec vehicle parts?',
      answer:
        'Yes. Through Autohub’s direct presence and bonded depots in Tokyo, Nagoya, and Osaka, we have proprietary access to Japanese domestic market (JDM) dismantlers, OEM surplus warehouses, and European heritage supplier networks.',
    },
  ];

  const dealershipLogos = [
    { name: 'Toyota Trade Network NZ', tag: 'TOYOTA TRADE NZ' },
    { name: 'European Specialist Workshops', tag: 'EURO SPECIALISTS' },
    { name: 'Giltrap Commercial Fleets', tag: 'GILTRAP FLEET' },
    { name: 'Armstrong Auto Group NZ', tag: "ARMSTRONG'S NETWORK" },
    { name: 'Commercial Fleets NZ', tag: 'COMMERCIAL FLEETS NZ' },
    { name: 'MTA Certified Repairers', tag: 'MTA NZ CERTIFIED' },
  ];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      router.push(`/requests/new?search=${encodeURIComponent(heroSearchInput.trim())}`);
    } else {
      router.push('/requests/new');
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-24 pb-16 sm:pb-20">
      {/* 1. HERO + 50% OVERLAPPING FLOATING SEARCH WIDGET */}
      <div className="relative">
        <section className="relative overflow-hidden bg-brand-blue-navy text-white pt-8 pb-20 sm:pt-12 sm:pb-28 lg:pt-20 lg:pb-36">
          {/* Background Glows, Gradients & Tech Grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#172554] to-brand-blue opacity-95" />
          <div className="absolute inset-0 bg-grid-tech opacity-30 pointer-events-none" />

          {/* Ambient Radial Lights */}
          <div className="absolute top-1/2 right-10 -z-10 h-[280px] sm:h-[380px] w-[280px] sm:w-[380px] rounded-full bg-[#2b4499]/30 blur-[100px] sm:blur-[130px] pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 -z-10 h-[220px] sm:h-[300px] w-[220px] sm:w-[300px] rounded-full bg-brand-red/15 blur-[90px] sm:blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 lg:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Col: Hero Copy */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
                {/* Top Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-red-300 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-red stroke-[2.2] shrink-0" />
                    <span>Autohub Global Supply Chain</span>
                    <span className="text-white/40 hidden xs:inline">•</span>
                    <span className="text-white font-bold">NZ Trade Only</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>24/7 VOR Emergency Hoist Support</span>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-[1.1] sm:leading-[1.08]">
                  Precision B2B <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-200 to-white drop-shadow-sm">
                    Automotive Parts Sourcing
                  </span>{' '}
                  <span className="text-slate-100">& Global Logistics.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl">
                  Eliminate fragmented supplier messaging. One digital platform to request, quote, customs-clear, and deliver verified vehicle parts door-to-door across New Zealand.
                </p>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  <Link href="/requests/new" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="w-full sm:w-auto font-heading font-bold tracking-wide py-3 sm:py-3.5 px-6 sm:px-7 text-sm"
                    >
                      Submit a Part Request
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      variant="outline-dark"
                      size="lg"
                      className="w-full sm:w-auto font-heading font-bold tracking-wide py-3 sm:py-3.5 px-6 sm:px-7 text-sm"
                    >
                      Register Trade Account
                    </Button>
                  </Link>
                </div>

                {/* Responsive 3 Metric Counters */}
                <div className="pt-5 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/15">
                  <div className="glass-pill p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                    <p className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-white tracking-tight">100%</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">Fitment Guarantee</p>
                  </div>
                  <div className="glass-pill p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                    <p className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-white tracking-tight">3-5 Days</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">Express Air Transit</p>
                  </div>
                  <div className="glass-pill p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left border border-white/10 hover:border-white/20 transition-colors shadow-sm">
                    <p className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-white tracking-tight">20th Month</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">Trade Credit Terms</p>
                  </div>
                </div>
              </div>

              {/* Right Col: High-Definition Realistic Autohub Logistics Showcase */}
              <div className="lg:col-span-6 relative w-full">
                <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-950/85 backdrop-blur-xl shadow-2xl overflow-hidden text-left relative group">
                  {/* Showcase Top Telemetry & Origin Bar */}
                  <div className="p-3.5 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-brand-red/20 text-brand-red border border-brand-red/30 shrink-0">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-bold text-white tracking-wide truncate">
                            AUTOHUB GLOBAL AIR LOGISTICS
                          </span>
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">
                          Tokyo Depot (NRT) ✈ Auckland Hub (AKL) • Flight NZ90
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      In Transit
                    </span>
                  </div>

                  {/* Realistic Logistics Photography with Live Floating Inspection Tags */}
                  <div className="relative h-80 sm:h-90 w-full overflow-hidden group/image">
                    <Image
                      src="/images/hero-logistics.jpg"
                      alt="Autohub Global Air Logistics & Genuine OEM Parts Inspection"
                      fill
                      priority
                      className="object-cover object-center group-hover/image:scale-105 transition-transform duration-700"
                    />
                    {/* Subtle Gradient Overlays for readable HUD elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/30" />

                    {/* Top Floating Glass Badge: Quality Assurance */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
                      <div className="glass-dark px-3 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-xl">
                        <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[10px] sm:text-[11px] font-bold tracking-wide">
                            Quality Assurance Passed
                          </p>
                          <p className="text-[9px] text-slate-300 font-mono">Lot #0324 • Certified OEM</p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Sourced Parts Pill Switcher Floating Inside Photo */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex flex-wrap gap-1.5 sm:gap-2">
                      {schematicParts.map((part) => {
                        const isSelected = selectedHotspot === part.id;
                        return (
                          <button
                            key={part.id}
                            type="button"
                            onClick={() => setSelectedHotspot(part.id)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all backdrop-blur-md border flex items-center gap-1.5 ${isSelected
                              ? 'bg-brand-red text-white border-red-400 shadow-lg scale-105'
                              : 'bg-slate-900/80 text-slate-200 border-white/20 hover:bg-slate-800'
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="truncate">{part.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Part Live Telemetry & Landed Cost HUD */}
                  <div className="p-3.5 sm:p-5 border-t border-white/10 bg-slate-900/95 text-white space-y-2.5 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono block truncate">
                          OEM #{activePart.partNumber} • {activePart.origin}
                        </span>
                        <h4 className="text-xs sm:text-sm font-heading font-bold text-white mt-0.5 truncate">
                          {activePart.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm sm:text-base font-heading font-extrabold text-white">
                          {activePart.landedCost}
                        </p>
                        <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                          {activePart.fitment}
                        </span>
                      </div>
                    </div>

                    {/* Flight & Clearance Status Milestone */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-[11px] space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-slate-300">
                        <span className="flex items-center gap-1.5 truncate">
                          <Plane className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          Air Cargo NZ90 (NRT ✈ AKL)
                        </span>
                        <span className="text-emerald-300 font-bold shrink-0">ETA Workshop: Tomorrow 11:30 AM</span>
                      </div>

                      {/* Milestone Progress Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 h-full w-[82%] rounded-full animate-pulse" />
                      </div>

                      <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400">
                        <span>Tokyo Export Depot</span>
                        <span className="text-emerald-400 font-semibold">NZ Customs & MPI Pre-Cleared</span>
                        <span>Penrose Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1.5. FLOATING VIN & PART SEARCH OVERLAY CARD (EXACTLY 50% OVERLAPPING HERO BANNER WITH DEEP ELEVATED SHADOW) */}
        <div className="relative -mt-16 sm:-mt-20 lg:-mt-24 z-30 max-w-7xl mx-auto px-4 lg:px-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] hover:shadow-[0_30px_70px_-12px_rgba(15,23,42,0.38)] transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-50 text-brand-red border border-red-200/80 shadow-sm">
                  <Search className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-heading font-extrabold text-slate-900 tracking-tight">
                    Instant Parts Sourcing & Landed Quote Lookup
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Query verified OEM supplier inventories across Japan, Australia & Europe with instant NZD landed estimates
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Fitment Pre-Checked
                </span>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-brand-blue px-3 py-1 rounded-full border border-blue-200 text-xs">
                  <Plane className="w-3.5 h-3.5 text-brand-blue" /> Priority Air 3-5 Days
                </span>
              </div>
            </div>

            <form onSubmit={handleHeroSearch} className="mt-4 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  placeholder="Enter VIN, Chassis Code (e.g. GUN126R, ZE1, G20) or Part Description..."
                  className="w-full bg-slate-50/90 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium rounded-xl pl-12 pr-4 py-3 sm:py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all shadow-inner"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full md:w-auto font-heading font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-8 whitespace-nowrap shadow-glow shrink-0"
              >
                Get Landed Quote
              </Button>
            </form>

            {/* Quick Search Suggestions Pills */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Popular Searches:
              </span>
              {[
                { label: 'Toyota Hilux (GUN126R) Headlamp', query: 'Toyota Hilux GUN126R Headlamp' },
                { label: 'Lexus RX450h Hybrid Inverter', query: 'Lexus RX450h Hybrid Inverter' },
                { label: 'BMW 3-Series (G20) Steering Rack', query: 'BMW G20 Steering Rack' },
                { label: 'Nissan Leaf (ZE1) Traction Battery', query: 'Nissan Leaf ZE1 Battery' },
                { label: 'Ford Ranger Wildtrak Turbo', query: 'Ford Ranger Wildtrak Turbo' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setHeroSearchInput(item.query);
                    router.push(`/requests/new?search=${encodeURIComponent(item.query)}`);
                  }}
                  className="text-[11px] font-medium text-slate-600 bg-slate-100/80 hover:bg-red-50 hover:text-brand-red hover:border-red-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. "THE OLD WAY VS PROCURLY" SIDE-BY-SIDE COMPARISON SECTION */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <TrendingUp className="w-3.5 h-3.5" /> Modern Procurement Advantage
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            The Old Fragmented Way vs. The Procurly Platform
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            See how New Zealand workshops save 4+ hours per job and eliminate costly parts guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Left: The Old Way */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-red-100/70 text-red-600">
                    <XCircle className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                      The Old Fragmented Process
                    </h3>
                    <p className="text-xs text-red-600 font-semibold">Emails, WeChat, Spreadsheets & Brokers</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                  High Friction
                </span>
              </div>

              <div className="space-y-4">
                {comparisonItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-red-50/40 border border-red-100/80 space-y-1">
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      {item.feature}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0">✕</span>
                      <span>{item.oldWay}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
              Result: Delayed workshop hoists, lost customer trust, and unexpected import charges.
            </div>
          </div>

          {/* Right: The Procurly Way */}
          <div className="bg-gradient-to-br from-[#131d3f] via-[#1a2959] to-brand-blue rounded-3xl p-6 sm:p-8 text-white border border-blue-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
                      The Procurly Digital Platform
                    </h3>
                    <p className="text-xs text-emerald-300 font-semibold">End-to-End Automated & Verified</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                  Recommended
                </span>
              </div>

              <div className="space-y-4">
                {comparisonItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-sm">
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider">
                      {item.feature}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0 mt-0.5" />
                      <span>{item.procurlyWay}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
              <span className="text-xs text-blue-200 font-medium">Result: Rapid hoist turnover & 100% predictable landed margin.</span>
              <Link href="/register">
                <Button variant="primary" size="sm" className="font-heading font-bold text-xs">
                  Switch to Procurly
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRADE ACCOUNT BENEFITS & COMMERCIAL INCENTIVES */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Award className="w-3.5 h-3.5" /> Built Exclusively For Trade
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Commercial Advantages for New Zealand Workshops
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Unlock trade-only pricing, dedicated parts concierges, and flexible consolidated credit billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Benefit 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                20th Month Credit
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Smooth your workshop cashflow with 20th of the month following invoicing on all sourced parts and freight.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-brand-blue">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Consolidated Tax Invoicing</span>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                Priority VOR Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Emergency priority flight allocations for vehicle-off-road jobs. Get critical parts to your hoists in 3 to 5 business days.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-brand-red">
              <CheckCircle2 className="w-4 h-4 text-brand-red" />
              <span>Fast-Track Customs Lanes</span>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                Dedicated Concierge
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Direct phone and digital support from NZ-based parts sourcing specialists who understand chassis codes and fitments.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-purple-700">
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
              <span>Local Auckland & CHC Staff</span>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                Zero Customs Surprise
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Autohub acts as the importer of record. All MPI biosecurity clearance, duties, and GST are pre-cleared seamlessly.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>100% Bonded Facility Handled</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENTLY SOURCED LIVE PARTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200 mb-2">
              <Clock className="w-3.5 h-3.5" /> Real-World Sourcing Activity
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Recently Sourced & Landed Parts Across NZ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Explore live examples of Japanese and European import parts delivered to Kiwi workshops.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSourcedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedSourcedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sourced Parts Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredSourcedParts.map((part) => (
            <div
              key={part.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    OEM #{part.oemRef}
                  </span>
                  <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-2.5 py-0.5 rounded-full border border-brand-red/20">
                    {part.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-heading font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                    {part.partName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{part.vehicle}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Route:</span>
                    <span className="font-semibold text-slate-800 truncate ml-2">{part.route}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lead Time:</span>
                    <span className="font-bold text-emerald-600">{part.leadTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Quality:</span>
                    <span className="font-medium text-slate-700">{part.condition}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Landed Total</span>
                  <span className="text-base sm:text-lg font-heading font-black text-slate-900">{part.landedCost}</span>
                </div>

                <Link href={`/requests/new?search=${encodeURIComponent(part.vehicle + ' ' + part.partName)}`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    Request Similar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE QUICK QUOTE ESTIMATOR */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Calculate Live Trade Sourcing Estimates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Select a common NZ vehicle to preview our landed cost structure with Air vs Sea freight choices.
          </p>
        </div>
        <QuickQuoteEstimator />
      </section>

      {/* 6. WORKFLOW EXPLAINER ("HOW PROCURLY WORKS" - 4-STEP STEPPER) */}
      <section className="bg-slate-900 text-white py-14 sm:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 lg:px-0 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950/80 px-3.5 py-1 rounded-full border border-red-800/80">
              End-to-End Procurement Flow
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-tight">
              How Procurly Works
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              A 4-step streamlined process engineered to keep your hoists moving and eliminate supplier chasing.
            </p>
          </div>

          {/* Step Selector Tabs with Connecting Progress Rail */}
          <div className="relative mb-8 sm:mb-10">
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-slate-700/80 -translate-y-1/2 -z-0">
              <div
                className="h-full bg-gradient-to-r from-brand-red via-red-500 to-rose-400 transition-all duration-500 shadow-[0_0_12px_rgba(237,32,37,0.8)]"
                style={{ width: `${((activeWorkflowStep - 1) / 3) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10">
              {workflowSteps.map((s) => {
                const isActive = activeWorkflowStep === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveWorkflowStep(s.id)}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl text-left border transition-all duration-200 relative ${isActive
                      ? 'bg-slate-800 border-t-4 border-t-brand-red border-red-500/40 text-white shadow-2xl ring-2 ring-red-500/20'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded ${isActive ? 'bg-brand-red text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                      >
                        {s.number}
                      </span>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider truncate">
                      {s.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{s.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Showcase */}
          {(() => {
            const current = workflowSteps.find((s) => s.id === activeWorkflowStep) || workflowSteps[0];
            const Icon = current.icon;
            return (
              <div className="bg-slate-800/90 rounded-2xl sm:rounded-3xl border border-slate-700/90 p-5 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-red text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                          STAGE {current.number} OF 04 • {current.stageTag}
                        </span>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-white">
                          {current.title}: {current.subtitle}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                      {current.description}
                    </p>

                    <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                      {current.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <Link href="/requests/new">
                        <Button variant="primary" size="md" className="font-heading font-bold text-xs">
                          Try Submitting a Request
                        </Button>
                      </Link>
                      <button
                        onClick={() =>
                          setActiveWorkflowStep((prev) => (prev % workflowSteps.length) + 1)
                        }
                        className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Col: Sleek macOS App Frame Window Mockup */}
                  <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden text-left font-mono w-full">
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                        <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                        <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                        <span className="ml-2 text-[11px] text-slate-400 font-sans font-medium truncate">
                          PROCURLY_PIPELINE.sh
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                        VERIFIED
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 text-xs">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                        <span>METRIC:</span>
                        <span className="text-emerald-400 font-bold">{current.metrics}</span>
                      </div>

                      <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] sm:text-[11px] space-y-1.5 text-slate-300 overflow-x-auto custom-scrollbar">
                        <p className="text-slate-500">// Real-time pipeline payload</p>
                        <p>
                          <span className="text-rose-400">stage:</span>{' '}
                          <span className="text-amber-300">&quot;{current.stageTag}&quot;</span>,
                        </p>
                        {Object.entries(current.codePreview).map(([key, val]) => (
                          <p key={key} className="whitespace-nowrap">
                            <span className="text-blue-400">{key}:</span>{' '}
                            <span className="text-emerald-300">{JSON.stringify(val)}</span>,
                          </p>
                        ))}
                        <p className="text-slate-400 whitespace-nowrap">
                          <span className="text-purple-400">nz_brokerage:</span> &quot;MPI_GREEN_LANE_READY&quot;
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1">
                        <span>Infrastructure:</span>
                        <span className="text-white font-semibold">Autohub Direct Bonded Hubs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS & CASE STUDIES */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Trade Satisfaction
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Trusted by Leading Kiwi Workshops & Dealerships
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Read how automotive trade leaders across New Zealand rely on Procurly for daily parts procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                {/* 5-star rating */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-400">5.0</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900 truncate">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{t.role} • {t.location}</p>
                  <span className="inline-block text-[10px] font-semibold text-brand-blue bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-100">
                    {t.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SOCIAL PROOF & TRUST SECTION (WORKSHOP SCENE & LOGO CLOUD) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Authentic NZ Workshop Scene Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
              <div className="aspect-[4/3] relative w-full">
                <Image
                  src="https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern automotive workshop bay with diagnostic equipment"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating Quality Badge */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl glass-dark border border-white/20 text-white">
                <div className="flex items-center gap-2 text-red-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <BadgeCheck className="w-4 h-4 shrink-0" />
                  <span>NZ Workshop Quality Standard</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold mt-1">
                  100% Fitment Certified prior to international air dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Building2 className="w-3.5 h-3.5" /> Autohub Group Heritage
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Trusted by Hundreds of New Zealand Dealerships & Repairers
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
              Autohub has pioneered vehicle logistics between Japan, the UK, Australia, and New Zealand for over two decades. Procurly extends this world-class infrastructure directly to parts procurement for trade workshops.
            </p>

            {/* Dealership Logo Cloud Grid */}
            <div className="pt-1 sm:pt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Supporting NZ Dealer & Trade Networks:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {dealershipLogos.map((logo, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-center hover:bg-white hover:shadow-subtle transition-all"
                  >
                    <span className="text-[10px] sm:text-[11px] font-heading font-bold text-slate-700 tracking-tight block truncate">
                      {logo.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Glowing Feature Cards */}
            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
              <div className="flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-subtle">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#2b4499]/10 text-brand-blue border border-[#2b4499]/20 shrink-0">
                  <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">Direct Customs Bonded Facilities</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Faster MPI biosecurity clearance and direct tariff filing with NZ Customs Service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-subtle">
                <div className="p-2 sm:p-2.5 rounded-xl bg-brand-red/10 text-brand-red border border-brand-red/20 shrink-0">
                  <Truck className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-slate-900">Regional Delivery Hubs</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Penrose (Auckland) and Middleton (Christchurch) cross-dock hubs for rapid local delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/register" className="inline-block w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-heading font-bold text-xs tracking-wide">
                  Open Your Trade Account Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (INTERACTIVE ACCORDION) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Know About Trade Sourcing
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Clear answers about customs pre-clearance, 100% fitment guarantees, and 20th of the month credit terms.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-heading font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-full border shrink-0 transition-transform duration-200 ${isOpen
                      ? 'bg-brand-red text-white border-brand-red rotate-180'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="gradient-cta-mesh rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left border border-white/15">
          {/* Ambient Glows & Grid */}
          <div className="absolute inset-0 bg-grid-tech opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-red/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -mb-20 w-60 h-60 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-2 sm:space-y-3">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">
                Ready to Streamline Your Workshop Parts Sourcing?
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">
                Get started in under 3 minutes. Experience transparent landed quotes, verified fitments, and door-to-door delivery across NZ.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center w-full">
              <Link href="/requests/new" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-heading font-bold text-xs tracking-wide shadow-glow"
                >
                  Submit a Part Request
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button
                  variant="outline-dark"
                  size="lg"
                  className="w-full font-heading font-bold text-xs tracking-wide"
                >
                  Register Verified Trade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FLOATING QUICK-CONTACT ASSIST WIDGET */}
      <aside aria-label="Urgent parts trade hotline" className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <Link
            href="/contact"
            className="flex items-center gap-2.5 bg-slate-950 text-white px-4 py-3 rounded-full shadow-2xl border border-white/20 hover:scale-105 transition-all duration-200 group-hover:ring-4 group-hover:ring-red-500/20"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <Phone className="w-4 h-4 text-red-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-mono">VOR Urgent Hotline</span>
              <span className="text-xs font-heading font-bold text-white">0800 288 6482</span>
            </div>
          </Link>
        </div>
      </aside>
    </div>
  );
}

