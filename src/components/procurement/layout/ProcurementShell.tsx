'use client';

import React, { useState } from 'react';
import { ProcurementSidebar } from './ProcurementSidebar';
import { ProcurementHeader } from './ProcurementHeader';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { AddQuoteModal } from '../modals/AddQuoteModal';
import { CreatePOModal } from '../modals/CreatePOModal';
import { ReportExceptionModal } from '../modals/ReportExceptionModal';
import { cn } from '@/lib/utils';

export function ProcurementShell({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [addQuoteOpen, setAddQuoteOpen] = useState(false);
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [reportExceptionOpen, setReportExceptionOpen] = useState(false);

  const handleQuickAction = (type: 'quote' | 'po' | 'exception' | 'rfq') => {
    if (type === 'quote') setAddQuoteOpen(true);
    if (type === 'po') setCreatePOOpen(true);
    if (type === 'exception') setReportExceptionOpen(true);
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
        <ProcurementSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
            <ProcurementSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
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
        <ProcurementHeader
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onOpenGlobalSearch={() => setSearchModalOpen(true)}
          onOpenQuickAction={handleQuickAction}
        />

        {/* Page Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6 pb-20">
          {children}
        </main>
      </div>

      {/* Shared Modals */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
      <AddQuoteModal
        isOpen={addQuoteOpen}
        onClose={() => setAddQuoteOpen(false)}
      />
      <CreatePOModal
        isOpen={createPOOpen}
        onClose={() => setCreatePOOpen(false)}
      />
      <ReportExceptionModal
        isOpen={reportExceptionOpen}
        onClose={() => setReportExceptionOpen(false)}
      />
    </div>
  );
}
