import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  LineChart,
  FileText,
  Activity,
  ShieldCheck,
  Bell,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DemoIndicator } from './DemoIndicator';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/api';

interface NavGroup {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Workspace',
    items: [
      { name: 'Customers', path: '/customers', icon: Users },
      { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
      { name: 'Transactions', path: '/transactions', icon: Receipt },
    ],
  },
  {
    title: 'Insights',
    items: [
      { name: 'Analytics', path: '/analytics', icon: LineChart },
      { name: 'Reports', path: '/reports', icon: FileText },
      { name: 'Activity', path: '/activity', icon: Activity },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Audit Log', path: '/audit', icon: ShieldCheck },
      { name: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const roleAllowedPaths: Record<UserRole, string[]> = {
  Administrator: ['/dashboard', '/customers', '/subscriptions', '/transactions', '/analytics', '/reports', '/activity', '/audit', '/notifications', '/settings'],
  Manager: ['/dashboard', '/customers', '/subscriptions', '/transactions', '/analytics', '/reports', '/activity', '/audit', '/notifications', '/settings'],
  Viewer: ['/dashboard', '/customers', '/subscriptions', '/transactions', '/analytics', '/reports', '/activity', '/notifications', '/settings'],
};

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || 'Administrator';
  const allowed = roleAllowedPaths[userRole] || roleAllowedPaths.Administrator;

  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowed.includes(item.path)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`
          fixed md:sticky top-0 z-50 h-screen shrink-0 bg-[#111419] border-r border-white/[0.08] flex flex-col transition-all duration-300 ease-out select-none
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
          <Link to="/" className="flex items-center gap-3 overflow-hidden" onClick={onMobileClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-[#8B5CF6]/30 shrink-0">
              N
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#F7F8FA]">Nexora</span>
                <span className="text-[10px] text-[#707784] uppercase tracking-wider font-semibold">2026 SaaS Suite</span>
              </div>
            )}
          </Link>
          <button
            onClick={onMobileClose}
            className="md:hidden p-2.5 text-[#A5ACB8] hover:text-white rounded-xl hover:bg-[#171A20] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
          {filteredNavGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#707784] mb-2">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/customers' && location.pathname.startsWith('/customers')) ||
                  (item.path === '/subscriptions' && location.pathname.startsWith('/subscriptions')) ||
                  (item.path === '/transactions' && location.pathname.startsWith('/transactions'));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    className={`
                      relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[44px]
                      ${
                        isActive
                          ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 shadow-glow-primary font-bold'
                          : 'text-[#A5ACB8] hover:text-[#F7F8FA] hover:bg-[#171A20] border border-transparent'
                      }
                      ${isCollapsed ? 'md:justify-center md:px-0' : ''}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#8B5CF6] shadow-glow-primary" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-[#707784]'}`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {item.badge && (!isCollapsed || isMobileOpen) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Collapse Controls */}
        <div className="p-3 border-t border-white/[0.08] flex flex-col gap-3">
          {!isCollapsed && (
            <div className="p-3 rounded-2xl bg-[#171A20] border border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 text-[#22D3EE] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nexora v2.6</span>
              </div>
              <p className="text-[11px] text-[#707784] mb-2">2026 SaaS Experience</p>
              <DemoIndicator />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center gap-2 p-2.5 rounded-xl text-[#A5ACB8] hover:text-white hover:bg-[#171A20] text-xs border border-white/[0.08] transition-colors min-h-[44px]"
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
