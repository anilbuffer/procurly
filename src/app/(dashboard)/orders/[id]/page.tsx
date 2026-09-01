'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { ProcurementOrder } from '@/types';
import { formatNZD, formatDate, getSynchronizedOrderTimeline } from '@/lib/utils';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Car,
  Box,
  Building2,
  Truck,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { EndToEndFlowNavigator } from '@/components/ui/EndToEndFlowNavigator';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [order, setOrder] = useState<ProcurementOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        const data = await requestsService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();

    const handleUpdate = () => {
      loadOrder();
    };

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
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 space-y-2">
        <div className="w-8 h-8 border-2 border-[#ed2025] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading order summary...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested procurement order reference could not be located.
        </p>
        <Link href="/orders">
          <Button variant="outline" size="sm">
            Back to Orders List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* End-to-End Order Flow Engine Bar */}
      <EndToEndFlowNavigator
        requestId={order.requestNumber || order.requestId}
        currentStatus={order.status}
        onStatusChanged={() => {
          if (orderId) {
            requestsService.getOrderById(orderId).then((data) => {
              if (data) setOrder(data);
            });
          }
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {order.orderNumber}
              </h1>
              <Badge variant="status" status={order.status} dot={true} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Related Request: <span className="font-bold text-slate-800">{order.requestNumber}</span> • Placed {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/requests/${order.requestId}`}>
            <Button variant="outline" size="sm" className="text-xs font-bold">
              View Original Request →
            </Button>
          </Link>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): Order Summary & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Summary Card */}
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-blue" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Part Name</span>
                  <p className="text-sm font-black text-slate-900">{order.part.name}</p>
                  {order.part.partNumber && (
                    <p className="text-xs font-mono text-brand-blue font-semibold">OEM: {order.part.partNumber}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Vehicle</span>
                  <p className="text-sm font-bold text-slate-900">
                    {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                  </p>
                  <p className="text-xs font-mono text-slate-400">VIN: {order.vehicle.vin}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Quantity</span>
                  <span className="font-bold text-slate-900">{order.quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Freight Method</span>
                  <span className="font-bold text-slate-900">{order.freightMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Est. Delivery</span>
                  <span className="font-bold text-emerald-700">{order.estimatedDeliveryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Total Landed</span>
                  <span className="font-mono text-base font-black text-[#ed2025]">
                    {formatNZD(order.totalAmountNZD)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ORDER TIMELINE (The exact 6-stage order timeline) */}
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-blue" />
                <span>Procurement Order Timeline</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Live milestones from trade approval through warehouse fulfillment and handover
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {getSynchronizedOrderTimeline(order.status, order.timeline).map((event, idx) => {
                  const isCompleted = event.status === 'completed';
                  const isInProgress = event.status === 'in-progress';

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Icon Bubble */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isInProgress
                            ? 'bg-[#ed2025] text-white ring-4 ring-red-100 animate-pulse'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : isInProgress ? '●' : '○'}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-bold ${
                              isInProgress ? 'text-[#ed2025]' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            {event.stage}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">{event.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right (4 cols): Consignee Delivery Address & Support */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/60 py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span>Consignee Delivery Hub</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-2">
              <p className="font-bold text-slate-900">{order.deliveryAddress?.businessName || 'AutoCare Auckland'}</p>
              <p className="text-slate-600">
                {order.deliveryAddress?.street || '12 Example Street'}, {order.deliveryAddress?.city || 'Auckland'}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-500">
                <span>Forklift: {order.deliveryAddress?.hasForklift ? '✓ Yes' : 'No'}</span>
                <span>Dock: {order.deliveryAddress?.hasLoadingDock ? '✓ Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Fitment Certified Box */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">100% Fitment Certified Guarantee</p>
              <p className="text-[11px] text-emerald-700">
                Your order is covered under Autohub&apos;s B2B trade fitment warranty. Full replacement or refund if physical part fails VIN specification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
