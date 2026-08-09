import React, { useState, useEffect } from 'react';
import { Menu, Search, ExternalLink, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ApiStatusBadge } from '../common/ApiStatusBadge';
import { NotificationPanel } from './NotificationPanel';
import { UserProfileMenu } from './UserProfileMenu';
import { CommandSearch } from './CommandSearch';
import { Breadcrumb } from '../ui/FeedbackComponents';

export interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nexora_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const location = useLocation();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('nexora_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('nexora_theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
      <header className="h-16 sticky top-0 z-30 glass-header flex items-center justify-between px-4 sm:px-6">
        {/* Left Side: Mobile Hamburger & Breadcrumb Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2.5 rounded-xl text-[#A5ACB8] hover:text-white hover:bg-[#171A20] border border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block min-w-0">
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <div className="sm:hidden font-bold text-xs text-[#F7F8FA] truncate">
            Nexora / {getBreadcrumbItems().pop()?.label}
          </div>
        </div>

        {/* Right Side: Command Search Trigger, Theme Toggle, API Badge, Notifications, User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Command Search Trigger Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#111419] hover:bg-[#171A20] border border-white/[0.08] hover:border-[#8B5CF6]/50 text-xs text-[#707784] hover:text-[#A5ACB8] transition-all cursor-pointer min-h-[38px] shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Search Nexora...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded-md bg-[#171A20] border border-white/[0.08] text-[10px] font-mono text-[#A5ACB8]">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="sm:hidden p-2.5 rounded-xl text-[#A5ACB8] hover:text-white hover:bg-[#171A20] border border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Search command palette"
          >
            <Search className="w-4 h-4 text-[#8B5CF6]" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-[#A5ACB8] hover:text-white hover:bg-[#171A20] border border-white/[0.08] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#8B5CF6]" />
            )}
          </button>

          {/* Live API Health Indicator Badge */}
          <div className="hidden lg:block">
            <ApiStatusBadge />
          </div>

          {/* Landing Showcase Link */}
          <Link
            to="/"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#A5ACB8] hover:text-white hover:bg-[#171A20] transition-colors"
          >
            <span>Landing</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Notifications Dropdown */}
          <NotificationPanel />

          {/* User Profile Menu Dropdown */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandSearch isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
