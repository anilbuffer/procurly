'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Timeline } from '@/components/ui/Timeline';
import { requestsService } from '@/services/requestsService';
import { PartRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Plane,
  Ship,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Building2,
  ExternalLink,
  Package,
} from 'lucide-react';

export default function TrackingDetailsPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<PartRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await requestsService.getRequestById(requestId);
        setRequest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [requestId]);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 space-y-2">
        <p className="text-sm font-semibold">Loading live consignment tracking...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Consignment Not Found</h3>
        <p className="text-xs text-slate-500">Could not locate tracking records for this identifier.</p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const milestones = request.trackingMilestones || [];
  const isAir = request.selectedFreight?.includes('Air') || true;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/requests/${request.id}`}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Request
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Live Consignment: {request.referenceNumber}
              </h1>
              <Badge variant="status" status={request.status} dot={true} />
            </div>
            <p className="text-xs text-slate-500">
              {request.vehicle.year} {request.vehicle.make} {request.vehicle.model} • {request.parts[0]?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold">
            Airway Bill: AWB-086-94810291
          </span>
        </div>
      </div>

      {/* Hero Tracking Status Card */}
      <div className="bg-gradient-to-r from-brand-blue-navy to-brand-blue rounded-2xl p-6 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest">
              Live Transit Route
            </span>
            <h2 className="text-xl font-bold">
              Tokyo Narita (NRT) → Auckland International (AKL) → Penrose Depot → Onehunga Workshop
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-blue-200 block">Estimated Workshop Handover</span>
            <span className="text-xl font-black text-white">Tomorrow, 11:30 AM</span>
          </div>
        </div>

        {/* Progress Route Graphic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { stage: '1. Tokyo Export Depot', status: 'Completed', time: 'Aug 25, 14:20' },
            { stage: '2. Narita Airport Flight NZ90', status: 'Completed', time: 'Aug 26, 18:40' },
            { stage: '3. Auckland Customs & MPI', status: 'Cleared', time: 'Aug 28, 07:15' },
            { stage: '4. Final Mile Courier Delivery', status: 'In Transit', time: 'Est. Aug 29' },
          ].map((st, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border ${
                i === 3
                  ? 'bg-brand-red border-red-400 text-white font-bold'
                  : 'bg-white/10 border-white/15 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{st.stage}</span>
                {i < 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-[11px] opacity-80">{st.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Detailed Timeline & Logistics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Milestone Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Consignment History & Milestone Log</CardTitle>
                <CardDescription>
                  Verified timestamps from international departure to workshop doorstep
                </CardDescription>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Green-Lane Cleared
              </span>
            </CardHeader>
            <CardContent className="p-6">
              <Timeline milestones={milestones} />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Logistics Summary, Carrier, Delivery Access (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Freight Carrier Card */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                Freight Carrier Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 text-brand-red font-bold">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Air New Zealand Cargo</h4>
                  <p className="text-slate-500">Flight: NZ90 (B787-9 Dreamliner)</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Customs Clearance:</span>
                  <span className="font-bold text-emerald-700">MPI Approved</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Courier:</span>
                  <span className="font-bold text-slate-900">Mainstream Express</span>
                </div>
                <div className="flex justify-between">
                  <span>Pallet / Crate:</span>
                  <span className="font-medium">Heavy Duty Foam Pack</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Site Verification */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                Workshop Delivery Site
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-2">
              <p className="font-bold text-slate-900">{request.deliveryAddress.businessName}</p>
              <p className="text-slate-600">
                {request.deliveryAddress.street}, {request.deliveryAddress.suburb}, {request.deliveryAddress.city} {request.deliveryAddress.postcode}
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <span className="font-bold block text-slate-800 mb-0.5">Site Access Confirmed:</span>
                Forklift on site (✓), Loading dock (✓), Bay 2 Parts Entrance.
              </div>
            </CardContent>
          </Card>

          {/* Support Assistance */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3 text-xs">
            <h4 className="font-bold text-white">Logistics Support</h4>
            <p className="text-slate-400 leading-relaxed">
              Questions regarding this consignment? Contact your Autohub parts desk directly at{' '}
              <span className="text-white font-mono font-bold">09 525 6814</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
