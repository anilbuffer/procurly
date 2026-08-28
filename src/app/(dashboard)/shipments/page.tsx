'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { ShipmentTracking } from '@/types';
import { Truck, Search, Plane, Ship, ArrowRight, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentTracking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadShipments = async () => {
    try {
      const data = await requestsService.getShipments(searchQuery);
      setShipments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
    const handleUpdate = () => loadShipments();
    window.addEventListener('procurly_data_updated', handleUpdate);
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shipments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your procurement shipments from dispatch through delivery.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Shipment #, Ref, or Carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Shipment Cards Grid */}
      {shipments.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">No Shipments</p>
            <p className="text-xs text-slate-400">
              Your shipment tracking will appear here once your procurement is dispatched.
            </p>
          </div>
          <Link href="/requests">
            <Button variant="outline" size="sm">
              View Part Requests →
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shipments.map((shp) => {
            const isAir = shp.freightType.includes('Air');

            return (
              <Card key={shp.id} className="shadow-card border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {shp.requestNumber}
                      </span>
                    </div>
                    <Badge variant="status" status={shp.status} dot={true} />
                  </div>
                  <CardTitle className="text-sm font-black text-slate-900 mt-2">
                    {shp.partName}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 font-medium">
                    {shp.vehicle.make} {shp.vehicle.model} · {shp.vehicle.year}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Carrier:</span>
                      <span className="font-semibold text-slate-900">{shp.carrier}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tracking Code:</span>
                      <span className="font-mono font-bold text-brand-blue">{shp.carrierTrackingCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Current Location:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]">{shp.currentLocation}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Estimated Arrival:</span>
                      <span className="font-bold text-emerald-700">{shp.estimatedArrival}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/shipments/${shp.id}`} className="block">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full bg-[#ed2025] hover:bg-[#d3181d] text-white font-black text-xs uppercase tracking-wider"
                      >
                        Track Shipment →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
