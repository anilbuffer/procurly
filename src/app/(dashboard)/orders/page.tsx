'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { DocumentPreviewModal } from '@/components/ui/DocumentPreviewModal';
import { requestsService } from '@/services/requestsService';
import { ProcurementOrder, PortalDocument } from '@/types';
import { formatNZD, formatDate, cn, getSynchronizedOrderTimeline } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  ArrowRight,
  Truck,
  Box,
  Calendar,
  Building2,
  Download,
  Copy,
  Check,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Plane,
  Ship,
  ShieldCheck,
  FileText,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Printer,
  ChevronRight,
  AlertCircle,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  PlusCircle,
  X,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Controls
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreightFilter, setSelectedFreightFilter] = useState('All Freight');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All Vehicles');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'delivery'>('date-desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Interactive Row Expand state (stores set of expanded order IDs)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Row Selection state for bulk actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Copy notification state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Document modal preview
  const [previewDocument, setPreviewDocument] = useState<PortalDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await requestsService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener('procurly_data_updated', handleUpdate);
    window.addEventListener('procurly_requests_updated', handleUpdate);
    window.addEventListener('procurly_ops_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('procurly_data_updated', handleUpdate);
      window.removeEventListener('procurly_requests_updated', handleUpdate);
      window.removeEventListener('procurly_ops_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Status Filter Tabs
  const tabs = [
    { id: 'All', label: 'All Orders' },
    { id: 'Processing', label: 'In Processing' },
    { id: 'In Transit', label: 'In Transit' },
    { id: 'Delivered', label: 'Delivered' },
  ];

  // Vehicles list for filtering
  const vehicles = useMemo(() => {
    return ['All Vehicles', ...Array.from(new Set(orders.map((o) => `${o.vehicle.make} ${o.vehicle.model}`)))];
  }, [orders]);

  // Dynamic Freight types
  const freightTypes = ['All Freight', 'Air Freight (Express)', 'Air Freight', 'Sea Freight'];

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        // Tab Filter
        if (activeTab === 'Processing') {
          const isProc =
            ord.status === 'Ordered From Supplier' ||
            ord.status === 'Received At Shipping Facility' ||
            ord.status === 'Customer Approved' ||
            ord.status === 'Payment Received';
          if (!isProc) return false;
        } else if (activeTab === 'In Transit') {
          const isInTransit =
            ord.status === 'In Transit' ||
            ord.status === 'Dispatched' ||
            (ord.status as string).includes('Transit');
          if (!isInTransit) return false;
        } else if (activeTab === 'Delivered') {
          if (ord.status !== 'Delivered' && ord.status !== 'Completed') return false;
        }

        // Freight Filter
        if (selectedFreightFilter !== 'All Freight') {
          if (!ord.freightMethod.toLowerCase().includes(selectedFreightFilter.toLowerCase().replace(' (express)', ''))) {
            return false;
          }
        }

        // Vehicle Filter
        if (selectedVehicleFilter !== 'All Vehicles') {
          const vName = `${ord.vehicle.make} ${ord.vehicle.model}`;
          if (vName !== selectedVehicleFilter) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            ord.orderNumber.toLowerCase().includes(q) ||
            ord.requestNumber.toLowerCase().includes(q) ||
            ord.vehicle.make.toLowerCase().includes(q) ||
            ord.vehicle.model.toLowerCase().includes(q) ||
            ord.vehicle.vin.toLowerCase().includes(q) ||
            (ord.vehicle.regoNumber && ord.vehicle.regoNumber.toLowerCase().includes(q)) ||
            ord.part.name.toLowerCase().includes(q) ||
            (ord.part.partNumber && ord.part.partNumber.toLowerCase().includes(q)) ||
            ord.freightMethod.toLowerCase().includes(q) ||
            ord.status.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.totalAmountNZD - a.totalAmountNZD;
        }
        if (sortBy === 'amount-asc') {
          return a.totalAmountNZD - b.totalAmountNZD;
        }
        if (sortBy === 'delivery') {
          return a.estimatedDeliveryDate.localeCompare(b.estimatedDeliveryDate);
        }
        return 0;
      });
  }, [orders, activeTab, selectedFreightFilter, selectedVehicleFilter, searchQuery, sortBy]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalSpend = orders.reduce((sum, o) => sum + (o.totalAmountNZD || 0), 0);
    const inTransitCount = orders.filter(
      (o) => o.status === 'In Transit' || o.status === 'Dispatched' || (o.status as string).includes('Transit')
    ).length;
    const processingCount = orders.filter(
      (o) => o.status === 'Ordered From Supplier' || o.status === 'Received At Shipping Facility'
    ).length;
    const deliveredCount = orders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;

    return { totalCount, totalSpend, inTransitCount, processingCount, deliveredCount };
  }, [orders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: orders.length,
      Processing: orders.filter(
        (o) =>
          o.status === 'Ordered From Supplier' ||
          o.status === 'Received At Shipping Facility' ||
          o.status === 'Customer Approved' ||
          o.status === 'Payment Received'
      ).length,
      'In Transit': orders.filter(
        (o) => o.status === 'In Transit' || o.status === 'Dispatched' || (o.status as string).includes('Transit')
      ).length,
      Delivered: orders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length,
    };
  }, [orders]);

  // CSV Export
  const handleExportCSV = () => {
    const targetOrders =
      selectedOrderIds.length > 0
        ? orders.filter((o) => selectedOrderIds.includes(o.id))
        : filteredOrders;

    if (targetOrders.length === 0) return;

    const headers = [
      'Order Number',
      'Request Number',
      'Order Date',
      'Vehicle Make',
      'Vehicle Model',
      'Vehicle Year',
      'VIN',
      'Rego',
      'Part Name',
      'OEM Part Number',
      'Quantity',
      'Freight Method',
      'Estimated Delivery',
      'Total Amount NZD',
      'Status',
    ];

    const rows = targetOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.requestNumber}"`,
      `"${formatDate(o.createdAt)}"`,
      `"${o.vehicle.make}"`,
      `"${o.vehicle.model}"`,
      `"${o.vehicle.year}"`,
      `"${o.vehicle.vin}"`,
      `"${o.vehicle.regoNumber || ''}"`,
      `"${o.part.name.replace(/"/g, '""')}"`,
      `"${o.part.partNumber || ''}"`,
      o.quantity,
      `"${o.freightMethod}"`,
      `"${o.estimatedDeliveryDate}"`,
      o.totalAmountNZD,
      `"${o.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PROCURly_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Document / Invoice Preview
  const handleOpenInvoice = (ord: ProcurementOrder) => {
    const doc: PortalDocument = {
      id: `inv_${ord.id}`,
      title: `Tax Invoice - ${ord.orderNumber}`,
      category: 'Invoices',
      requestId: ord.requestId,
      requestNumber: ord.requestNumber,
      date: formatDate(ord.createdAt),
      fileFormat: 'PDF',
      fileSizeBytes: 245000,
      fileSizeFormatted: '245 KB',
      documentType: 'Tax Invoice',
      previewData: {
        invoiceNumber: `INV-${ord.orderNumber.replace('ORD-', '')}`,
        customerName: ord.deliveryAddress?.businessName || 'AutoCare Auckland',
        vehicleDetails: `${ord.vehicle.year} ${ord.vehicle.make} ${ord.vehicle.model} (VIN: ${ord.vehicle.vin})`,
        partDetails: `${ord.part.name}${ord.part.partNumber ? ` (OEM: ${ord.part.partNumber})` : ''}`,
        items: [
          {
            desc: `${ord.part.name} [${ord.part.conditionRequired || 'New OEM'}]`,
            qty: ord.quantity,
            unitPrice: ord.totalAmountNZD * 0.72,
            total: ord.totalAmountNZD * 0.72,
          },
          {
            desc: `International Freight & Border Logistics (${ord.freightMethod})`,
            qty: 1,
            unitPrice: ord.totalAmountNZD * 0.18,
            total: ord.totalAmountNZD * 0.18,
          },
          {
            desc: 'Autohub Trade Fitment & Verification Fee',
            qty: 1,
            unitPrice: ord.totalAmountNZD * 0.1,
            total: ord.totalAmountNZD * 0.1,
          },
        ],
        subtotal: ord.totalAmountNZD,
        gst: ord.totalAmountNZD * 0.15,
        total: ord.totalAmountNZD,
      },
    };
    setPreviewDocument(doc);
    setIsDocModalOpen(true);
  };

  // Helper to get progress index (0 to 3) for mini progress bar
  const getOrderProgressIndex = (status: string): number => {
    switch (status) {
      case 'Customer Approved':
      case 'Payment Received':
        return 0; // Stage 1
      case 'Ordered From Supplier':
      case 'Received At Shipping Facility':
        return 1; // Stage 2
      case 'Dispatched':
      case 'In Transit':
        return 2; // Stage 3
      case 'Delivered':
      case 'Completed':
        return 3; // Stage 4
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ed2025] to-[#b31317] flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Orders</h1>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  {orders.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Track and manage supplier fulfillments, international freight dispatches, and workshop deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
            className="text-xs font-bold border-slate-300 hover:bg-slate-50 shadow-sm"
          >
            Export CSV
          </Button>

          <Link href="/requests/new">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-glow transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>New Request</span>
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.totalCount}
          changeText={`Landed: ${formatNZD(stats.totalSpend)}`}
          isPositive={true}
          icon={<ShoppingBag className="w-5 h-5 text-brand-blue" />}
          iconBg="bg-blue-50 text-brand-blue"
          onClick={() => setActiveTab('All')}
          className={cn(activeTab === 'All' && 'ring-2 ring-brand-blue/30 border-brand-blue')}
        />

        <StatCard
          title="In Fulfillment"
          value={stats.processingCount}
          changeText="Supplier PO & Hub QA"
          isPositive={false}
          icon={<Box className="w-5 h-5 text-sky-600" />}
          iconBg="bg-sky-50 text-sky-600"
          onClick={() => setActiveTab('Processing')}
          className={cn(activeTab === 'Processing' && 'ring-2 ring-sky-500/30 border-sky-500')}
        />

        <StatCard
          title="In Transit (Air/Sea)"
          value={stats.inTransitCount}
          changeText="Airborne & Sea Cargo"
          isPositive={true}
          icon={<Truck className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          onClick={() => setActiveTab('In Transit')}
          className={cn(activeTab === 'In Transit' && 'ring-2 ring-indigo-500/30 border-indigo-500')}
        />

        <StatCard
          title="Delivered Orders"
          value={stats.deliveredCount}
          changeText="100% Fitment Signed"
          isPositive={true}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          onClick={() => setActiveTab('Delivered')}
          className={cn(activeTab === 'Delivered' && 'ring-2 ring-emerald-500/30 border-emerald-500')}
        />
      </div>

      {/* Main Filter & Navigation Card */}
      <Card className="shadow-card border border-slate-200 overflow-hidden">
        {/* Status Tabs Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              const count = tabCounts[t.id as keyof typeof tabCounts] || 0;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    setSelectedOrderIds([]);
                  }}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all shrink-0 flex items-center gap-2 ${isActive
                      ? 'border-[#ed2025] text-[#ed2025]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-[#ed2025] text-white' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Table / Grid) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Ref #, VIN, Rego, Part Name, OEM #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vehicle Filter */}
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue font-medium"
            >
              {vehicles.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            {/* Freight Method Filter */}
            <select
              value={selectedFreightFilter}
              onChange={(e) => setSelectedFreightFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand-blue font-medium"
            >
              {freightTypes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="date-desc">Newest Placed</option>
                <option value="date-asc">Oldest Placed</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="delivery">Est. Delivery (Soonest)</option>
              </select>
            </div>

            {/* Reset Filters button if any active */}
            {(searchQuery || selectedVehicleFilter !== 'All Vehicles' || selectedFreightFilter !== 'All Freight') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVehicleFilter('All Vehicles');
                  setSelectedFreightFilter('All Freight');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedOrderIds.length > 0 && (
          <div className="bg-blue-50/90 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between gap-4 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-brand-blue font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {selectedOrderIds.length} of {filteredOrders.length} order{selectedOrderIds.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-3 h-3" />}
                className="text-xs font-bold bg-white text-slate-700 border-slate-300"
              >
                Export Selected CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderIds([])}
                className="text-xs font-semibold text-slate-600 bg-white"
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}

        {/* Orders Content View */}
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <p className="text-base font-bold text-slate-800">No Matching Orders Found</p>
                <p className="text-xs text-slate-400">
                  {searchQuery || selectedVehicleFilter !== 'All Vehicles' || selectedFreightFilter !== 'All Freight'
                    ? 'No orders match your filter criteria. Try resetting the filters.'
                    : 'Procurement orders will appear once you approve a parts quotation.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                {(searchQuery || selectedVehicleFilter !== 'All Vehicles' || selectedFreightFilter !== 'All Freight') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedVehicleFilter('All Vehicles');
                      setSelectedFreightFilter('All Freight');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Link href="/requests">
                  <Button variant="primary" size="sm">
                    View Part Requests →
                  </Button>
                </Link>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* =================== TABLE VIEW =================== */
            <div className="divide-y divide-slate-100 font-sans overflow-x-auto">
              {/* Desktop Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-3 bg-slate-100/70 text-slate-600 uppercase tracking-wider text-[11px] font-black border-b border-slate-200 select-none">
                <div className="col-span-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#ed2025] focus:ring-[#ed2025] cursor-pointer"
                  />
                  <span>Order & Ref #</span>
                </div>
                <div className="col-span-3">Vehicle Details</div>
                <div className="col-span-2">Part Specification</div>
                <div className="col-span-2">Logistics & Amount</div>
                <div className="col-span-2 text-right">Status & Action</div>
              </div>

              {/* Rows */}
              {filteredOrders.map((ord) => {
                const isExpanded = !!expandedOrders[ord.id];
                const isSelected = selectedOrderIds.includes(ord.id);
                const isAir = ord.freightMethod.toLowerCase().includes('air');
                const progressIdx = getOrderProgressIndex(ord.status);

                return (
                  <div key={ord.id} className="transition-colors">
                    {/* Main Row */}
                    <div
                      className={cn(
                        'p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start lg:items-center',
                        isSelected && 'bg-blue-50/40',
                        isExpanded && 'bg-slate-50/60'
                      )}
                    >
                      {/* Column 1 (3 cols): Checkbox + Expand + Order & Ref + Placed Date */}
                      <div className="lg:col-span-3 flex items-start gap-3 w-full lg:w-auto">
                        <div className="pt-0.5 flex items-center gap-2 shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(ord.id)}
                            className="rounded border-slate-300 text-[#ed2025] focus:ring-[#ed2025] cursor-pointer"
                          />
                          <button
                            onClick={() => toggleExpand(ord.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                            title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/orders/${ord.id}`}
                              className="font-mono text-sm font-black text-slate-900 hover:text-brand-blue tracking-tight hover:underline flex items-center gap-1"
                            >
                              {ord.orderNumber}
                            </Link>
                            <button
                              onClick={() => handleCopy(ord.orderNumber, `ord_${ord.id}`)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title="Copy Order #"
                            >
                              {copiedId === `ord_${ord.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>Ref:</span>
                            <Link
                              href={`/requests/${ord.requestId}`}
                              className="font-semibold text-slate-700 hover:text-brand-blue bg-slate-100 hover:bg-slate-200 px-1.5 py-0.2 rounded border border-slate-200 transition-colors"
                            >
                              {ord.requestNumber}
                            </Link>
                          </div>

                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Placed {formatDate(ord.createdAt)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Column 2 (3 cols): Vehicle Details + NZ Rego + VIN */}
                      <div className="lg:col-span-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">
                            {ord.vehicle.make} {ord.vehicle.model} · {ord.vehicle.year}
                          </p>
                          {ord.vehicle.regoNumber && (
                            <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 bg-white text-slate-800 border border-slate-300 rounded shadow-2xs tracking-wider">
                              {ord.vehicle.regoNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                          <span>VIN:</span>
                          <span className="text-slate-700 truncate max-w-[140px] sm:max-w-none">{ord.vehicle.vin}</span>
                          <button
                            onClick={() => handleCopy(ord.vehicle.vin, `vin_${ord.id}`)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy VIN"
                          >
                            {copiedId === `vin_${ord.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {ord.vehicle.originMarket && (
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Origin: {ord.vehicle.originMarket} Market
                          </span>
                        )}
                      </div>

                      {/* Column 3 (2 cols): Part Specification & OEM Part # */}
                      <div className="lg:col-span-2 space-y-1">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1" title={ord.part.name}>
                          {ord.part.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {ord.part.partNumber && (
                            <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              OEM: {ord.part.partNumber}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                            Qty: {ord.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Column 4 (2 cols): Logistics Freight & Total Amount */}
                      <div className="lg:col-span-2 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                          {isAir ? (
                            <Plane className="w-3 h-3 text-sky-600" />
                          ) : (
                            <Ship className="w-3 h-3 text-cyan-600" />
                          )}
                          <span className="truncate">{ord.freightMethod}</span>
                        </div>

                        <div>
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {formatNZD(ord.totalAmountNZD)}
                          </span>
                          <span className="text-[10px] text-emerald-700 block font-bold">
                            Landed Total · GST Inc.
                          </span>
                        </div>
                      </div>

                      {/* Column 5 (2 cols): Status Badge, Mini Progress & Actions */}
                      <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-between gap-2.5 w-full lg:w-auto">
                        <Badge variant="status" status={ord.status} dot={true} className="whitespace-nowrap" />

                        {/* Mini 4-step progress indicator */}
                        <div className="w-full max-w-[130px] flex items-center gap-1" title={`Stage: ${ord.status}`}>
                          {[0, 1, 2, 3].map((step) => {
                            const isDone = step <= progressIdx;
                            const isCurrent = step === progressIdx;
                            return (
                              <div
                                key={step}
                                className={cn(
                                  'h-1.5 flex-1 rounded-full transition-all',
                                  isDone
                                    ? isCurrent
                                      ? 'bg-[#ed2025] animate-pulse'
                                      : 'bg-emerald-500'
                                    : 'bg-slate-200'
                                )}
                              />
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end pt-1">
                          <button
                            onClick={() => handleOpenInvoice(ord)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Preview Tax Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <Link href={`/orders/${ord.id}`}>
                            <Button variant="outline" size="sm" className="text-xs font-bold whitespace-nowrap py-1.5 h-8">
                              View Order →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="bg-slate-50/90 border-t border-b border-slate-200/80 p-5 sm:p-6 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Left (7 cols): Live Milestone Timeline */}
                          <div className="lg:col-span-7 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-brand-blue" />
                                <span>Procurement Order Milestones</span>
                              </h4>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                Est. Delivery: {ord.estimatedDeliveryDate}
                              </span>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                              <div className="relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-4">
                                {getSynchronizedOrderTimeline(ord.status, ord.timeline).map((event, idx) => {
                                  const isDone = event.status === 'completed';
                                  const isInProg = event.status === 'in-progress';
                                  return (
                                    <div key={idx} className="relative flex items-start gap-3 text-xs">
                                      <div
                                        className={cn(
                                          'absolute -left-5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold',
                                          isDone
                                            ? 'bg-emerald-600 text-white'
                                            : isInProg
                                              ? 'bg-[#ed2025] text-white ring-2 ring-red-100 animate-pulse'
                                              : 'bg-white border-2 border-slate-300 text-slate-400'
                                        )}
                                      >
                                        {isDone ? '✓' : isInProg ? '●' : '○'}
                                      </div>
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={cn(
                                              'font-bold',
                                              isInProg ? 'text-[#ed2025]' : isDone ? 'text-slate-900' : 'text-slate-400'
                                            )}
                                          >
                                            {event.stage}
                                          </span>
                                          <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                                        </div>
                                        <p className="text-slate-600 text-[11px]">{event.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Right (5 cols): Consignee Address & Fitment Guarantee & Quick Actions */}
                          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2 text-xs">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                                  <span>Consignee Delivery Hub</span>
                                </h4>
                                <p className="font-bold text-slate-900">
                                  {ord.deliveryAddress?.businessName || 'AutoCare Auckland Ltd'}
                                </p>
                                <p className="text-slate-600 text-[11px]">
                                  {ord.deliveryAddress?.street || '12 Example Street'}, {ord.deliveryAddress?.city || 'Auckland'}
                                </p>
                                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                                  <span>Forklift: {ord.deliveryAddress?.hasForklift ? '✓ Verified' : 'No'}</span>
                                  <span>Loading Dock: {ord.deliveryAddress?.hasLoadingDock ? '✓ Available' : 'No'}</span>
                                </div>
                              </div>

                              {/* Guarantee Note */}
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <p className="font-bold text-[11px]">100% Fitment Certified Guarantee</p>
                                  <p className="text-[10px] text-emerald-700 leading-tight">
                                    Factory EPC verified against chassis VIN {ord.vehicle.vin}. Full replacement warranty.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenInvoice(ord)}
                                leftIcon={<FileText className="w-3.5 h-3.5" />}
                                className="text-xs font-bold bg-white"
                              >
                                Tax Invoice
                              </Button>

                              <Link href={`/requests/${ord.requestId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                                  className="text-xs font-bold bg-white"
                                >
                                  Original Request
                                </Button>
                              </Link>

                              <Link href={`/orders/${ord.id}`} className="flex-1">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-full bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs"
                                >
                                  Full Order Details →
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* =================== GRID CARDS VIEW =================== */
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 bg-slate-50/50">
              {filteredOrders.map((ord) => {
                const isAir = ord.freightMethod.toLowerCase().includes('air');
                const progressIdx = getOrderProgressIndex(ord.status);

                return (
                  <Card
                    key={ord.id}
                    className="shadow-card border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between bg-white"
                  >
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/orders/${ord.id}`}
                            className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 hover:text-brand-blue"
                          >
                            {ord.orderNumber}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">Ref: {ord.requestNumber}</span>
                        </div>
                        <Badge variant="status" status={ord.status} dot={true} />
                      </div>

                      <CardTitle className="text-sm font-black text-slate-900 mt-2 line-clamp-1">
                        {ord.part.name}
                      </CardTitle>

                      <CardDescription className="text-xs text-slate-600 font-medium flex items-center justify-between">
                        <span>
                          {ord.vehicle.make} {ord.vehicle.model} · {ord.vehicle.year}
                        </span>
                        {ord.vehicle.regoNumber && (
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 bg-white text-slate-700 border border-slate-200 rounded">
                            {ord.vehicle.regoNumber}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5 text-xs">
                        {ord.part.partNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">OEM Part Number:</span>
                            <span className="font-mono font-bold text-brand-blue">{ord.part.partNumber}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Freight Method:</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            {isAir ? <Plane className="w-3 h-3 text-sky-600" /> : <Ship className="w-3 h-3 text-cyan-600" />}
                            {ord.freightMethod}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Est. Delivery:</span>
                          <span className="font-bold text-emerald-700">{ord.estimatedDeliveryDate}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Landed Amount:</span>
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {formatNZD(ord.totalAmountNZD)}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>Fulfillment Progress</span>
                            <span className="font-semibold text-slate-600">{ord.status}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[0, 1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={cn(
                                  'h-1.5 flex-1 rounded-full',
                                  step <= progressIdx
                                    ? step === progressIdx
                                      ? 'bg-[#ed2025] animate-pulse'
                                      : 'bg-emerald-500'
                                    : 'bg-slate-200'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInvoice(ord)}
                          className="text-xs font-bold"
                          title="Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>

                        <Link href={`/orders/${ord.id}`} className="flex-1">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider"
                          >
                            View Order →
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Invoice / Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          isOpen={isDocModalOpen}
          onClose={() => {
            setIsDocModalOpen(false);
            setPreviewDocument(null);
          }}
          document={previewDocument}
        />
      )}
    </div>
  );
}
