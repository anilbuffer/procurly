'use client';

import React, { useState } from 'react';
import { OperationsSidebar } from './OperationsSidebar';
import { OperationsHeader } from './OperationsHeader';
import { cn } from '@/lib/utils';

export interface OperationsShellProps {
  children: React.ReactNode;
}

export function OperationsShell({ children }: OperationsShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] antialiased text-[#111827] font-sans relative">
      {/* Desktop Sidebar — Fixed left, full height, dark slate-900 (matches Customer Portal) */}
      <div
        className={cn(
          'hidden lg:block fixed inset-y-0 left-0 z-30 h-screen transition-all duration-250 bg-slate-900 border-r border-slate-800',
          isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <OperationsSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Drawer Overlay — matches Customer Portal mobile drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 h-screen max-h-screen bg-slate-900 shadow-2xl animate-slide-up flex flex-col">
            <OperationsSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area offset by sidebar width on desktop */}
      <div
        className={cn(
          'min-h-screen flex flex-col transition-all duration-250',
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        {/* Sticky Top Header */}
        <OperationsHeader onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
