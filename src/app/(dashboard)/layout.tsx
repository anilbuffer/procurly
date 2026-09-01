'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] antialiased text-slate-900 font-sans relative">
      {/* Desktop Sidebar (Fixed Left, 100vh Full Height with 0 gap) */}
      <div
        className={cn(
          'hidden lg:block fixed inset-y-0 left-0 z-30 h-screen transition-all duration-250 bg-slate-900',
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 h-screen max-h-screen bg-slate-900 shadow-2xl animate-slide-up flex flex-col">
            <DashboardSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div
        className={cn(
          'min-h-screen flex flex-col transition-all duration-250',
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        )}
      >
        {/* Top Sticky Header */}
        <DashboardHeader onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Quick Navigation */}
      <MobileBottomNav onOpenDrawer={() => setMobileDrawerOpen(true)} />
    </div>
  );
}
