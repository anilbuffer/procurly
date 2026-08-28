'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { requestsService } from '@/services/requestsService';
import { CompanyProfile, DeliveryAddress } from '@/types';
import {
  Building2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit2,
  CheckCircle2,
  Globe,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function CompanyPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editCompanyModalOpen, setEditCompanyModalOpen] = useState(false);
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<CompanyProfile>>({});
  const [newAddressForm, setNewAddressForm] = useState<DeliveryAddress>({
    businessName: '',
    street: '',
    suburb: '',
    city: 'Auckland',
    postcode: '',
    country: 'New Zealand',
    hasForklift: true,
    hasLoadingDock: true,
  });

  const loadProfile = async () => {
    try {
      const data = await requestsService.getCompanyProfile();
      setProfile(data);
      setEditFormData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
    const handleUpdate = () => loadProfile();
    window.addEventListener('procurly_data_updated', handleUpdate);
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestsService.updateCompanyProfile(editFormData);
      setEditCompanyModalOpen(false);
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.businessName || !newAddressForm.street || !newAddressForm.city) return;
    try {
      await requestsService.addDeliveryAddress(newAddressForm);
      setAddAddressModalOpen(false);
      setNewAddressForm({
        businessName: '',
        street: '',
        suburb: '',
        city: 'Auckland',
        postcode: '',
        country: 'New Zealand',
        hasForklift: true,
        hasLoadingDock: true,
      });
      loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company</h1>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Trade Account
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your legal entity records, branch network, and delivery destinations.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setEditCompanyModalOpen(true)}
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-sm"
        >
          Edit Company Details
        </Button>
      </div>

      {/* 3 Main Sections: Business Details, Contacts, Billing & Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Business Details (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span>Business Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Legal Business Name</span>
                  <p className="font-bold text-slate-900">{profile.legalBusinessName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Trading Name</span>
                  <p className="font-bold text-slate-900">{profile.tradingName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">NZBN Number</span>
                  <p className="font-mono font-bold text-slate-900">{profile.nzbn}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Business Type</span>
                  <p className="font-semibold text-slate-800">{profile.businessType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Website</span>
                  <p className="font-semibold text-brand-blue flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{profile.website}</span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Number of Branches</span>
                  <p className="font-bold text-slate-900">{profile.branchCount} Active Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Key Organization Contacts */}
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" />
                <span>Organization Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Primary Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-brand-blue uppercase">Primary Contact (Admin)</span>
                <p className="font-bold text-slate-900">{profile.contacts.primary.name}</p>
                <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px] pt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {profile.contacts.primary.email}</span>
                  <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-slate-400" /> {profile.contacts.primary.phone}</span>
                </div>
              </div>

              {/* Accounts Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Accounts & Billing Contact</span>
                <p className="font-bold text-slate-900">{profile.contacts.accounts.name}</p>
                <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px] pt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {profile.contacts.accounts.email}</span>
                  <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-slate-400" /> {profile.contacts.accounts.phone}</span>
                </div>
              </div>

              {/* Delivery Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Goods Inwards / Delivery Contact</span>
                <p className="font-bold text-slate-900">{profile.contacts.delivery.name}</p>
                <p className="text-[11px] text-slate-600 font-mono pt-0.5">Phone: {profile.contacts.delivery.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Billing & Delivery Addresses (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Billing Card */}
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-blue" />
                <span>Billing & Tax Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">GST Number</span>
                  <p className="font-mono font-bold text-slate-900">{profile.gstNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Approved Trade Credit</span>
                  <p className="font-bold text-emerald-700">$50,000 (20th Mth Following)</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Billing Address</span>
                <p className="font-bold text-slate-900 mt-0.5">{profile.billingAddress.street}, {profile.billingAddress.suburb}, {profile.billingAddress.city} {profile.billingAddress.postcode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Addresses */}
          <Card className="shadow-card border border-slate-200">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-blue" />
                <span>Saved Delivery Addresses</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddAddressModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Add Address
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {profile.deliveryAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{addr.businessName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Primary Workshop
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600">{addr.street}, {addr.suburb ? `${addr.suburb}, ` : ''}{addr.city} {addr.postcode}</p>
                  {addr.deliveryNotes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      Note: {addr.deliveryNotes}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Company Details Modal */}
      <Modal isOpen={editCompanyModalOpen} onClose={() => setEditCompanyModalOpen(false)} size="lg" title="Edit Company Details">
        <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Legal Business Name</label>
              <input
                type="text"
                value={editFormData.legalBusinessName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, legalBusinessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Trading Name</label>
              <input
                type="text"
                value={editFormData.tradingName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, tradingName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">NZBN Number</label>
              <input
                type="text"
                value={editFormData.nzbn || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nzbn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">GST Number</label>
              <input
                type="text"
                value={editFormData.gstNumber || ''}
                onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={editFormData.website || ''}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Type</label>
              <input
                type="text"
                value={editFormData.businessType || ''}
                onChange={(e) => setEditFormData({ ...editFormData, businessType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setEditCompanyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Address Modal */}
      <Modal isOpen={addAddressModalOpen} onClose={() => setAddAddressModalOpen(false)} size="md" title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch / Location Name</label>
            <input
              type="text"
              placeholder="e.g. South Auckland Hub"
              value={newAddressForm.businessName}
              onChange={(e) => setNewAddressForm({ ...newAddressForm, businessName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              placeholder="e.g. 24 Harris Road"
              value={newAddressForm.street}
              onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Suburb</label>
              <input
                type="text"
                placeholder="e.g. East Tamaki"
                value={newAddressForm.suburb}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, suburb: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={newAddressForm.city}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setAddAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
