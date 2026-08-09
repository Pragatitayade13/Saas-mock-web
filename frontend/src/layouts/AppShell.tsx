import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-[#0B0D12] text-slate-900 dark:text-[#F8FAFC] flex flex-col md:flex-row overflow-hidden w-full selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE] transition-colors duration-300">
      {/* Stable Fixed Sidebar */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Independently Scrollable Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto w-full bg-[#F8FAFC] dark:bg-[#0B0D12]">
        {/* Sticky Top Header */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-[#272C36] bg-white dark:bg-[#0B0D12] text-xs text-slate-500 dark:text-[#71717A] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Nexora SaaS Analytics Engine</span>
            <span>&copy; 2026 Nexora Inc.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-[#A5ACB8]">
            <span>Vertical Slice 10 System</span>
            <span>•</span>
            <span>Go + Gin + React + Vite</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
