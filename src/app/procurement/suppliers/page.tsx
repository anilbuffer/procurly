'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  MessageSquare,
  Send,
  Shield,
} from 'lucide-react';
import { procurementService } from '@/services/procurement/procurementService';
import {
  SupplierSummary,
  SupplierConversation,
  ProcurementStaffUser,
} from '@/types/procurement';

export type SuppliersTab = 'directory' | 'performance' | 'communications';

function SupplierHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = (searchParams.get('tab') as SuppliersTab) || 'directory';
  const initialSupplierId = searchParams.get('supplierId') || '';

  const [activeTab, setActiveTab] = useState<SuppliersTab>(initialTab);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SuppliersTab;
    if (tabParam && ['directory', 'performance', 'communications'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SuppliersTab) => {
    setActiveTab(tab);
    const supplierParam = selectedSupplierId ? `&supplierId=${selectedSupplierId}` : '';
    router.push(`/procurement/suppliers?tab=${tab}${supplierParam}`);
  };

  // Shared Data State
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [conversations, setConversations] = useState<SupplierConversation[]>([]);
  const [currentUser, setCurrentUser] = useState<ProcurementStaffUser>(() => procurementService.getDefaultUser());

  // 1. Directory Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [addSupplierModalOpen, setAddSupplierModalOpen] = useState(false);

  // Add Supplier form state
  const [newSupName, setNewSupName] = useState('');
  const [newSupCode, setNewSupCode] = useState('');
  const [newSupLocation, setNewSupLocation] = useState('');
  const [newSupCountry, setNewSupCountry] = useState('Japan');
  const [newSupSpecialization, setNewSupSpecialization] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');

  // 2. Performance Tab State
  const [sortBy, setSortBy] = useState<'score' | 'response' | 'lead' | 'completion'>('score');

  // 3. Communications Tab State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const sups = procurementService.getSuppliers();
    const convs = procurementService.getConversations();
    setSuppliers(sups);
    setConversations(convs);
    setCurrentUser(procurementService.getCurrentUser());

    const targetSupId = initialSupplierId || (convs.length > 0 ? convs[0].supplierId : sups[0]?.id || '');
    if (!selectedSupplierId) {
      setSelectedSupplierId(targetSupId);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('procurly_procurement_updated', handleUpdate);
    return () => window.removeEventListener('procurly_procurement_updated', handleUpdate);
  }, [initialSupplierId]);

  useEffect(() => {
    if (activeTab === 'communications') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, selectedSupplierId, activeTab]);

  // Directory Filter
  const statuses = ['All', 'Preferred', 'Active', 'Under Review', 'Inactive'];
  const filteredSuppliers = suppliers.filter((s) => {
    if (selectedStatus !== 'All' && s.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.specialization.some((sp) => sp.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupCode) return;

    procurementService.addSupplier({
      name: newSupName,
      code: newSupCode,
      location: newSupLocation || 'Tokyo',
      country: newSupCountry,
      specialization: newSupSpecialization.split(',').map((s) => s.trim()).filter(Boolean),
      contactName: newSupContact || 'Representative',
      contactEmail: newSupEmail || 'info@supplier.com',
      contactPhone: newSupPhone || '+81 3 0000 0000',
      responseRatePct: 95,
      avgLeadTimeDays: 3,
      avgResponseTimeHours: 2,
      orderCompletionPct: 98,
      exceptionRatePct: 1,
      status: 'Active',
      operatingRegions: [newSupCountry],
      preferredCategories: ['Automotive Parts'],
    });

    setAddSupplierModalOpen(false);
    setNewSupName('');
    setNewSupCode('');
  };

  // Performance Sorting
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (sortBy === 'score') return b.reliabilityScore - a.reliabilityScore;
    if (sortBy === 'response') return b.responseRatePct - a.responseRatePct;
    if (sortBy === 'lead') return a.avgLeadTimeDays - b.avgLeadTimeDays;
    if (sortBy === 'completion') return b.orderCompletionPct - a.orderCompletionPct;
    return 0;
  });

  // Communications Message Sending
  const activeConv = conversations.find((c) => c.supplierId === selectedSupplierId);
  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSupplierId) return;

    procurementService.sendSupplierMessage(selectedSupplierId, inputText.trim(), isInternalNote);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Supplier Management Hub
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              {suppliers.length} Verified Vendors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Vendor directory, performance intelligence scorecards, and live B2B supplier communications
          </p>
        </div>

        {activeTab === 'directory' && (
          <button
            onClick={() => setAddSupplierModalOpen(true)}
            className="btn-red-polished text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-red/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Supplier
          </button>
        )}
      </div>

      {/* 2. Top Navigation Tabs Bar */}
      <div className="border-b border-slate-200 bg-white rounded-2xl shadow-xs px-2 pt-2 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => handleTabChange('directory')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'directory'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Supplier Directory</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {suppliers.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('performance')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'performance'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Performance & Intelligence</span>
        </button>

        <button
          onClick={() => handleTabChange('communications')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
            activeTab === 'communications'
              ? 'border-brand-red text-brand-red bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Supplier Communications</span>
        </button>
      </div>

      {/* TAB 1: SUPPLIER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {statuses.map((st) => {
              const count = st === 'All' ? suppliers.length : suppliers.filter((s) => s.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                    selectedStatus === st
                      ? 'bg-[#ed2025] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span>{st}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      selectedStatus === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplier name, code, country, make specialization..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Supplier List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-3 text-center">Active Orders</th>
                    <th className="py-3 px-3 text-center">Response Rate</th>
                    <th className="py-3 px-3 text-center">Avg Lead Time</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue font-bold flex items-center justify-center text-xs shrink-0">
                            {s.code}
                          </div>
                          <div>
                            <Link
                              href={`/procurement/suppliers/${s.id}`}
                              className="font-bold text-slate-900 group-hover:text-brand-blue text-xs block"
                            >
                              {s.name}
                            </Link>
                            <span className="text-[11px] text-slate-400">{s.contactName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{s.location}</p>
                        <p className="text-[11px] text-slate-500">{s.country}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {s.specialization.slice(0, 3).map((sp, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {s.activeOrdersCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                        {s.responseRatePct}%
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                        {s.avgLeadTimeDays} Days
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            s.status === 'Preferred'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : s.status === 'Under Review'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-brand-blue border-blue-200'
                          )}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedSupplierId(s.id);
                              handleTabChange('communications');
                            }}
                            className="text-xs font-semibold text-slate-600 hover:text-brand-blue flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Message
                          </button>
                          <Link
                            href={`/procurement/suppliers/${s.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-blue-dark"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERFORMANCE & INTELLIGENCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Intelligence Overview Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Avg Network Response Time
                </span>
                <Clock className="w-4 h-4 text-brand-blue" />
              </div>
              <p className="text-2xl font-black text-slate-900">2.8 Hours</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                -40 min improvement this quarter
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Network Fulfillment Rate
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700">97.6%</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Zero-defect fitment guarantee
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Avg Transit Lead Time
                </span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">3.2 Days</p>
              <p className="text-[11px] text-brand-blue font-semibold mt-1">
                Direct air corridor to AKL
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Dispute / RMA Rate
                </span>
                <AlertTriangle className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-800">1.8%</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Within strict 2% quality SLA
              </p>
            </div>
          </div>

          {/* Ranking Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Supplier Ranking & Operational Intelligence Matrix
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Sort Matrix By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-none"
                >
                  <option value="score">Reliability Score (High → Low)</option>
                  <option value="response">Response Rate (%)</option>
                  <option value="lead">Fastest Lead Time</option>
                  <option value="completion">Order Completion (%)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Supplier & Region</th>
                    <th className="py-3 px-4">Core Specialization</th>
                    <th className="py-3 px-3 text-center">Score</th>
                    <th className="py-3 px-3 text-center">Response Time</th>
                    <th className="py-3 px-3 text-center">Quote Conv %</th>
                    <th className="py-3 px-3 text-center">Delivery Reliability</th>
                    <th className="py-3 px-3 text-center">Exception Rate</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedSuppliers.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        <span
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                            idx === 0
                              ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400/50'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/procurement/suppliers/${s.id}`}
                          className="font-bold text-slate-900 hover:text-brand-blue block text-xs"
                        >
                          {s.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {s.location}, {s.country} • Code: {s.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {s.specialization.slice(0, 2).map((sp, i) => (
                            <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="text-sm font-black text-brand-blue">
                          {s.reliabilityScore}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ 100</span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                        {s.avgResponseTimeHours} hrs
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                        {s.responseRatePct}%
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {s.orderCompletionPct}%
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={cn(
                            'text-[11px] font-bold px-2 py-0.5 rounded-full',
                            s.exceptionRatePct < 2
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          )}
                        >
                          {s.exceptionRatePct}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/procurement/suppliers/${s.id}`}
                          className="text-xs font-bold text-brand-blue hover:underline"
                        >
                          Scorecard →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIER COMMUNICATIONS */}
      {activeTab === 'communications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] max-h-[750px] animate-fade-in">
          {/* Left Pane: Threads (4 Cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/60">
            <div className="p-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vendor conversation..."
                  className="w-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-slate-100">
              {suppliers.map((sup) => {
                const conv = conversations.find((c) => c.supplierId === sup.id);
                const isSelected = sup.id === selectedSupplierId;

                return (
                  <button
                    key={sup.id}
                    onClick={() => setSelectedSupplierId(sup.id)}
                    className={cn(
                      'w-full p-4 text-left transition-colors flex items-start gap-3 group',
                      isSelected ? 'bg-white shadow-xs border-l-4 border-l-brand-red' : 'hover:bg-slate-100/70'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-slate-200">
                      {sup.code.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {sup.name}
                        </span>
                        {conv && (
                          <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {conv ? conv.lastMessage : `Direct channel with ${sup.contactName}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>{sup.location}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{sup.responseRatePct}% reply rate</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Active Stream (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-white">
            {activeSupplier ? (
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{activeSupplier.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                      {activeSupplier.code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {activeSupplier.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Representative: <strong className="text-slate-700">{activeSupplier.contactName}</strong> ({activeSupplier.contactEmail}) • Phone: {activeSupplier.contactPhone}
                  </p>
                </div>

                <Link
                  href={`/procurement/suppliers/${activeSupplier.id}`}
                  className="text-xs font-bold text-brand-blue hover:underline"
                >
                  Supplier Profile →
                </Link>
              </div>
            ) : (
              <div className="p-4 border-b border-slate-200">Select a supplier to start messaging</div>
            )}

            {/* Messages */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-slate-50/30 max-h-[480px]">
              {!activeConv || activeConv.messages.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No messages in this supplier thread yet.</p>
                  <p className="mt-1">Send an RFQ inquiry or record an internal note below.</p>
                </div>
              ) : (
                activeConv.messages.map((m) => {
                  const isMe = m.senderRole === 'Procurement Specialist';
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex flex-col',
                        m.isInternalNote ? 'items-center my-3' : isMe ? 'items-end' : 'items-start'
                      )}
                    >
                      {m.isInternalNote ? (
                        <div className="w-full max-w-lg p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs shadow-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-amber-800">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5" /> Internal Procurement Note (Confidential)
                            </span>
                            <span className="text-[10px] text-amber-600 font-normal">
                              {m.timestamp.replace('T', ' ').slice(0, 16)}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed">{m.message}</p>
                          <span className="text-[10px] text-slate-500 block">Logged by {m.sender}</span>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs',
                            isMe
                              ? 'bg-brand-blue text-white rounded-br-none'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                          )}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                            <span className="font-bold">{m.sender}</span>
                            <span>{m.timestamp.replace('T', ' ').slice(11, 16)}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(false)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-bold transition-colors',
                      !isInternalNote
                        ? 'bg-brand-blue text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    Supplier Message (EDI/Email)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(true)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1',
                      isInternalNote
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <Shield className="w-3 h-3" />
                    Internal Note Only
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {isInternalNote
                    ? '🔒 Visible only to internal procurement staff'
                    : '✉️ Will transmit to supplier representative'}
                </span>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? 'Write internal confidential note for team records...'
                      : `Message ${activeSupplier?.name || 'supplier'}...`
                  }
                  className={cn(
                    'flex-1 text-xs border rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none',
                    isInternalNote
                      ? 'bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-brand-blue/20'
                  )}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={cn(
                    'text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md',
                    isInternalNote
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                      : 'btn-red-polished shadow-brand-red/30'
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {addSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slide-up my-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add New Supplier</h2>
              <button onClick={() => setAddSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Code *</label>
                  <input
                    type="text"
                    value={newSupCode}
                    onChange={(e) => setNewSupCode(e.target.value)}
                    placeholder="e.g. TAS-JP"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Country *</label>
                  <select
                    value={newSupCountry}
                    onChange={(e) => setNewSupCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="USA">USA</option>
                    <option value="New Zealand">New Zealand</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Location / Hub</label>
                <input
                  type="text"
                  value={newSupLocation}
                  onChange={(e) => setNewSupLocation(e.target.value)}
                  placeholder="e.g. Yokohama, Kanagawa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={newSupSpecialization}
                  onChange={(e) => setNewSupSpecialization(e.target.value)}
                  placeholder="e.g. Toyota OEM, Lexus, Transmissions"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupContact}
                    onChange={(e) => setNewSupContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddSupplierModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-red-polished text-white font-bold px-4 py-1.5 rounded-lg"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupplierManagementHubPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Supplier Management Hub...</div>}>
      <SupplierHubContent />
    </Suspense>
  );
}
