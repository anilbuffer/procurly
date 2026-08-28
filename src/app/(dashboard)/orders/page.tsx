'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestsService } from '@/services/requestsService';
import { ProcurementOrder } from '@/types';
import { formatNZD, formatDate } from '@/lib/utils';
import { ShoppingBag, Search, ArrowRight, Truck, Box, Calendar, Building2 } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await requestsService.getOrders(searchQuery);
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
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View procurement orders created from your approved requests.
          </p>
        </div>

        {/* Global search in orders */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order # or Request #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Orders Table / Cards Card */}
      <Card className="shadow-card border border-slate-200">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No Orders Found</p>
                <p className="text-xs text-slate-400">
                  Procurement orders will appear once you approve a quotation.
                </p>
              </div>
              <Link href="/requests">
                <Button variant="outline" size="sm">
                  View Part Requests →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 font-sans">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-bold border-b border-slate-200">
                <div className="col-span-2">Order / Ref #</div>
                <div className="col-span-3">Vehicle Details</div>
                <div className="col-span-3">Part Specification</div>
                <div className="col-span-2">Amount (NZD)</div>
                <div className="col-span-2 text-right">Status & Action</div>
              </div>

              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center"
                >
                  {/* Order Number & Related Request */}
                  <div className="md:col-span-2 space-y-0.5">
                    <Link
                      href={`/orders/${ord.id}`}
                      className="font-mono text-sm font-black text-slate-900 hover:text-brand-blue"
                    >
                      {ord.orderNumber}
                    </Link>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Ref: <span className="font-semibold text-slate-700">{ord.requestNumber}</span>
                    </p>
                  </div>

                  {/* Vehicle */}
                  <div className="md:col-span-3 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {ord.vehicle.make} {ord.vehicle.model} · {ord.vehicle.year}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">VIN: {ord.vehicle.vin}</p>
                  </div>

                  {/* Part */}
                  <div className="md:col-span-3 space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 truncate">{ord.part.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {ord.quantity} • {ord.freightMethod}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="md:col-span-2">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {formatNZD(ord.totalAmountNZD)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">Landed Total</span>
                  </div>

                  {/* Status & View CTA */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                    <Badge variant="status" status={ord.status} dot={true} />
                    <Link href={`/orders/${ord.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold">
                        View Order →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
