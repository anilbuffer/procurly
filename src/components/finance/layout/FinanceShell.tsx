'use client';

import React, { useState } from 'react';
import { FinanceSidebar } from './FinanceSidebar';
import { FinanceHeader } from './FinanceHeader';
import { FinanceGlobalSearchModal } from '../modals/FinanceGlobalSearchModal';
import { RecordPaymentModal } from '../modals/RecordPaymentModal';
import { ProcessRefundModal } from '../modals/ProcessRefundModal';
import { AdjustCreditModal } from '../modals/AdjustCreditModal';
import { FinancialClearanceModal } from '../modals/FinancialClearanceModal';
import { cn } from '@/lib/utils';

export function FinanceShell({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [processRefundOpen, setProcessRefundOpen] = useState(false);
  const [adjustCreditOpen, setAdjustCreditOpen] = useState(false);
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);

  const handleQuickAction = (type: 'payment' | 'refund' | 'credit' | 'clearance') => {
    if (type === 'payment') setRecordPaymentOpen(true);
    if (type === 'refund') setProcessRefundOpen(true);
    if (type === 'credit') setAdjustCreditOpen(true);
    if (type === 'clearance') setClearanceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] antialiased text-slate-900 font-sans relative">
      {/* Desktop Fixed Sidebar */}
      <div
        className={cn(
          'hidden lg:block fixed inset-y-0 left-0 z-30 h-screen transition-all duration-250 bg-slate-900',
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <FinanceSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenRecordPayment={() => setRecordPaymentOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 h-screen max-h-screen bg-slate-900 shadow-2xl animate-slide-up flex flex-col">
            <FinanceSidebar
              onCloseMobile={() => setMobileDrawerOpen(false)}
              onOpenRecordPayment={() => {
                setMobileDrawerOpen(false);
                setRecordPaymentOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'min-h-screen flex flex-col transition-all duration-250',
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        )}
      >
        {/* Sticky Command Header */}
        <FinanceHeader
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onOpenGlobalSearch={() => setSearchModalOpen(true)}
          onOpenQuickAction={handleQuickAction}
        />

        {/* Page Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 pb-20">
          {children}
        </main>
      </div>

      {/* Shared Modals */}
      <FinanceGlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
      <RecordPaymentModal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
      />
      <ProcessRefundModal
        isOpen={processRefundOpen}
        onClose={() => setProcessRefundOpen(false)}
      />
      <AdjustCreditModal
        isOpen={adjustCreditOpen}
        onClose={() => setAdjustCreditOpen(false)}
      />
      <FinancialClearanceModal
        isOpen={clearanceModalOpen}
        onClose={() => setClearanceModalOpen(false)}
      />
    </div>
  );
}
