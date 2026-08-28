'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { requestsService } from '@/services/requestsService';
import { TradeAccount } from '@/types';
import {
  Building2,
  Users,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Save,
  Forklift,
  PhoneCall,
  Mail,
} from 'lucide-react';

export default function SettingsPage() {
  const [account, setAccount] = useState<TradeAccount | null>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const acc = await requestsService.getTradeAccount();
        setAccount(acc);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      await requestsService.updateTradeAccount(account);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !account) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Trade Account & Delivery Setup
          </h1>
          <p className="text-xs text-slate-500">
            Manage your registered NZ trade business entities, delivery dock logistics, and contact profiles.
          </p>
        </div>

        {saved && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Credentials Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-blue" />
              Verified Business Identification
            </CardTitle>
            <CardDescription>Official NZ entity registration and trade credit status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Legal Business Name"
                value={account.legalBusinessName}
                onChange={(e) => setAccount({ ...account, legalBusinessName: e.target.value })}
              />
              <Input
                label="Trading Name"
                value={account.tradingName}
                onChange={(e) => setAccount({ ...account, tradingName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="NZBN"
                value={account.nzbn}
                onChange={(e) => setAccount({ ...account, nzbn: e.target.value })}
              />
              <Input
                label="GST Number"
                value={account.gstNumber}
                onChange={(e) => setAccount({ ...account, gstNumber: e.target.value })}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                  Trade Credit Status
                </label>
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {account.creditStatus}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Contact & Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-blue" />
              Workshop Contacts & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Contact Name"
                value={account.primaryContact.name}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    primaryContact: { ...account.primaryContact, name: e.target.value },
                  })
                }
              />
              <Input
                label="Direct Work Email"
                type="email"
                value={account.primaryContact.email}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    primaryContact: { ...account.primaryContact, email: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Phone / Mobile"
                value={account.primaryContact.phone}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    primaryContact: { ...account.primaryContact, phone: e.target.value },
                  })
                }
              />
              <Input
                label="Accounts Payable Email"
                type="email"
                value={account.accountsPayableEmail}
                onChange={(e) => setAccount({ ...account, accountsPayableEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workshop Delivery Setup & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-blue" />
              Default Workshop Delivery Site
            </CardTitle>
            <CardDescription>
              Ensure our courier and tailgate freight carriers have correct site access specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  value={account.deliverySetup.street}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      deliverySetup: { ...account.deliverySetup, street: e.target.value },
                    })
                  }
                />
              </div>
              <Input
                label="Suburb"
                value={account.deliverySetup.suburb}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    deliverySetup: { ...account.deliverySetup, suburb: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                value={account.deliverySetup.city}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    deliverySetup: { ...account.deliverySetup, city: e.target.value },
                  })
                }
              />
              <Input
                label="Postcode"
                value={account.deliverySetup.postcode}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    deliverySetup: { ...account.deliverySetup, postcode: e.target.value },
                  })
                }
              />
              <Input
                label="Gate / Security Code"
                value={account.deliverySetup.gateCode || ''}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    deliverySetup: { ...account.deliverySetup, gateCode: e.target.value },
                  })
                }
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Forklift className="w-4 h-4 text-brand-blue" /> Site Unloading Equipment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={account.deliverySetup.hasForklift}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        deliverySetup: { ...account.deliverySetup, hasForklift: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-brand-red rounded border-slate-300 focus:ring-brand-red"
                  />
                  <span className="text-xs font-bold text-slate-800">Forklift on site</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={account.deliverySetup.hasLoadingDock}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        deliverySetup: { ...account.deliverySetup, hasLoadingDock: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-brand-red rounded border-slate-300 focus:ring-brand-red"
                  />
                  <span className="text-xs font-bold text-slate-800">Loading dock available</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={<Save className="w-4 h-4" />}
            className="font-bold text-xs shadow-md tracking-wide"
          >
            Save Trade Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
