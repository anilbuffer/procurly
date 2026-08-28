'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { requestsService } from '@/services/requestsService';
import { TeamMember, TeamRole } from '@/types';
import { Users, Plus, Shield, Mail, CheckCircle2, UserCheck, Lock } from 'lucide-react';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: TeamRole;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'Technician',
  });

  const loadTeam = async () => {
    try {
      const data = await requestsService.getTeamMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTeam();
    const handleUpdate = () => loadTeam();
    window.addEventListener('procurly_data_updated', handleUpdate);
    return () => window.removeEventListener('procurly_data_updated', handleUpdate);
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      await requestsService.addTeamMember({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: 'Active',
        permissions:
          formData.role === 'Administrator'
            ? ['Full Access', 'Submit Requests', 'Approve Quotes', 'Authorize Payments']
            : formData.role === 'Workshop Manager'
            ? ['Submit Requests', 'Review Quotes', 'Track Shipments']
            : ['Submit Requests', 'View Parts'],
      });
      setAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role: 'Technician' });
      loadTeam();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team Members</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, workshop managers, and technicians authorized to submit parts requests.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-[#ed2025] hover:bg-[#d3181d] text-white font-bold text-xs uppercase tracking-wider px-5 shadow-sm"
        >
          Add Team Member
        </Button>
      </div>

      {/* Team Table Card */}
      <Card className="shadow-card border border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Name & Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Permissions</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue font-bold flex items-center justify-center text-xs shrink-0">
                          {member.avatarInitials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{member.role}</span>
                    </td>

                    {/* Permissions */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={member.status === 'Active' ? 'success' : 'neutral'}
                        dot={true}
                      >
                        {member.status}
                      </Badge>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4 text-right text-slate-500 font-medium whitespace-nowrap">
                      {member.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Team Member Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} size="md" title="Add Organization Member">
        <form onSubmit={handleAddMember} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Tom Henderson"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. tom@autocareauckland.co.nz"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Role & Permissions</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="Administrator">Administrator (Full Access & Approvals)</option>
              <option value="Workshop Manager">Workshop Manager (Submit Requests & Review)</option>
              <option value="Senior Technician">Senior Technician (Submit & Track)</option>
              <option value="Accounts Contact">Accounts Contact (Billing & Payments)</option>
              <option value="Technician">Technician (Submit Requests)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
