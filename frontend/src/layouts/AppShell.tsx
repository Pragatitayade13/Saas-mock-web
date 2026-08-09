import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useTheme } from '../context/ThemeContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [resolvedTheme]);

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
      </div>
    </div>
  );
};
