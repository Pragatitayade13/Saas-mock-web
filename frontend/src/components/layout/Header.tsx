import React, { useState } from 'react';
import { Menu, Search, ExternalLink, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ApiStatusBadge } from '../common/ApiStatusBadge';
import { NotificationPanel } from './NotificationPanel';
import { UserProfileMenu } from './UserProfileMenu';
import { CommandSearch } from './CommandSearch';
import { Breadcrumb } from '../ui/FeedbackComponents';
import { useTheme } from '../../context/ThemeContext';

export interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return [{ label: 'Dashboard' }];
    }
    if (path === '/customers/new') {
      return [{ label: 'Workspace', path: '/dashboard' }, { label: 'Customers', path: '/customers' }, { label: 'New Customer' }];
    }
    if (path.startsWith('/customers/')) {
      return [{ label: 'Workspace', path: '/dashboard' }, { label: 'Customers', path: '/customers' }, { label: 'Customer Details' }];
    }
    const cleanPath = path.replace('/', '');
    const capitalized = cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
    return [{ label: 'Workspace', path: '/dashboard' }, { label: capitalized }];
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-30 bg-white/90 dark:bg-[#0B0D12]/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6 transition-colors duration-300">
        {/* Left Side: Mobile Hamburger & Breadcrumb Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-[#A5ACB8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171A20] border border-slate-200 dark:border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
        </div>

        {/* Right Side: Global Command Search Trigger, Theme Toggle, Api Status, Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Quick Command Search Trigger Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171A20] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-[#A5ACB8] hover:border-[#8B5CF6]/50 transition-all cursor-pointer min-h-[38px]"
          >
            <Search className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="hidden md:inline font-medium">Search Nexora...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#0B0D10] text-slate-600 dark:text-[#707784] border border-slate-200 dark:border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Clean Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-[#A5ACB8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171A20] border border-slate-200 dark:border-white/[0.08] transition-colors"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* API Health / Demo Status Indicator Badge */}
          <ApiStatusBadge />

          {/* Quick Landing Page Link */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#A5ACB8] hover:text-[#8B5CF6] hover:bg-slate-100 dark:hover:bg-[#171A20] transition-colors"
          >
            <span>Landing</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Interactive Notifications Panel */}
          <NotificationPanel />

          {/* Executive User Profile Dropdown Menu */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandSearch isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
