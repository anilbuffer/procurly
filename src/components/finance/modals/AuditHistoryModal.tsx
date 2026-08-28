'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FinanceAuditEntry } from '@/types/finance';
import { ShieldCheck, History, Clock } from 'lucide-react';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  auditTrail: FinanceAuditEntry[];
}

export function AuditHistoryModal({
  isOpen,
  onClose,
  title,
  auditTrail = [],
}: AuditHistoryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Audit Trail — ${title}`}>
      <div className="space-y-4 pt-1">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Immutable financial audit logging with actor attribution and timestamps.</span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-3 p-1">
          {auditTrail.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">No historical log entries recorded.</p>
          ) : (
            auditTrail.map((entry, idx) => (
              <div key={entry.id || idx} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{entry.action}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{entry.details}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700">{entry.actor}</span>
                  <span>•</span>
                  <span>{entry.actorRole}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
