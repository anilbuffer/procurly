'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { ShipmentTracking } from '@/types';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Plane,
  Ship,
  MapPin,
  Clock,
  Building2,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function ShipmentDetailPage() {
  const params = useParams();
  const shipmentId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [shipment, setShipment] = useState<ShipmentTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!shipmentId) return;
      try {
        const data = await requestsService.getShipmentById(shipmentId);
        setShipment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [shipmentId]);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 space-y-2">
        <div className="w-8 h-8 border-2 border-[#ed2025] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading shipment telemetry...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-900">Shipment Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested consignment tracking code could not be found.
        </p>
        <Link href="/shipments">
          <Button variant="outline" size="sm">
            Back to Shipments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/shipments">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Shipment Tracking
              </h1>
              <span className="font-mono text-sm font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                {shipment.requestNumber}
              </span>
              <Badge variant="status" status={shipment.status} dot={true} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Carrier: <strong>{shipment.carrier}</strong> • Tracking Code: <span className="font-mono font-bold text-brand-blue">{shipment.carrierTrackingCode}</span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right bg-white p-3.5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Estimated Delivery:</span>
          <span className="text-base font-black text-emerald-700">{shipment.estimatedArrival}</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): The 9-Stage Tracking Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-blue" />
                <span>Tracking Timeline</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Real-time checkpoints from international supplier dispatch to workshop handover
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {shipment.milestones.map((step, idx) => {
                  const isCompleted = step.status === 'completed';
                  const isInProgress = step.status === 'in-progress';

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
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`font-bold ${
                              isInProgress
                                ? 'text-[#ed2025]'
                                : isCompleted
                                ? 'text-slate-900'
                                : 'text-slate-500'
                            }`}
                          >
                            {step.stage}
                          </h4>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-medium text-slate-600">{step.location}</span>
                          {step.timestamp !== 'Pending' && (
                            <span className="text-[10px] text-slate-400 font-mono">({step.timestamp})</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Cargo details & Origin/Destination */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/60 py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-blue" />
                <span>Cargo Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Consignment Item</span>
                <p className="font-bold text-slate-900">{shipment.partName}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Vehicle Specification</span>
                <p className="text-slate-700">
                  {shipment.vehicle.year} {shipment.vehicle.make} {shipment.vehicle.model}
                </p>
                <p className="font-mono text-[11px] text-slate-400">VIN: {shipment.vehicle.vin}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Origin Hub:</span>
                  <span className="font-semibold text-slate-800">{shipment.originHub}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination Hub:</span>
                  <span className="font-semibold text-slate-800">{shipment.destinationHub}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MPI Green-Lane Card */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">MPI Biosecurity Green-Lane</p>
              <p className="text-[11px] text-emerald-700">
                Pre-cleared through New Zealand Ministry for Primary Industries biosecurity protocol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
