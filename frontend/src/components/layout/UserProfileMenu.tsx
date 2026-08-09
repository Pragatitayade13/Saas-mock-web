import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Settings, Sliders, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';

export const UserProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const userName = user?.name || 'Demo User';
  const userEmail = user?.email || 'demo@nexora.demo';
  const userRole = user?.role || 'Administrator';
  const avatarSrc = user?.avatar;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#181C25] transition-colors focus:outline-none cursor-pointer"
        aria-label="User menu"
      >
        <Avatar name={userName} src={avatarSrc} size="md" />
        <div className="hidden xl:flex flex-col text-left">
          <span className="text-xs font-bold text-[#F8FAFC]">{userName}</span>
          <span className="text-[10px] text-[#A1A1AA]">{userRole}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#181C25] border border-[#272C36] rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Profile Header */}
          <div className="px-4 py-3 border-b border-[#272C36] flex items-center gap-3">
            <Avatar name={userName} src={avatarSrc} size="lg" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#F8FAFC] truncate">{userName}</span>
              <span className="text-[11px] text-[#A1A1AA] truncate">{userEmail}</span>
              <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] bg-[#8B5CF6]/20 text-[#8B5CF6] font-extrabold w-fit uppercase tracking-wider">
                {userRole}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="py-1">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#F8FAFC] hover:bg-[#272C36] transition-colors"
            >
              <UserIcon className="w-4 h-4 text-[#A1A1AA]" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#F8FAFC] hover:bg-[#272C36] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#A1A1AA]" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#F8FAFC] hover:bg-[#272C36] transition-colors"
            >
              <Sliders className="w-4 h-4 text-[#A1A1AA]" />
              <span>Preferences</span>
            </button>
          </div>

          <div className="my-1 border-t border-[#272C36]" />

          {/* Theme Selector Submenu */}
          <div className="px-4 py-2">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">
              Appearance
            </span>
            <div className="grid grid-cols-3 gap-1 bg-[#12151C] p-1 rounded-lg border border-[#272C36]">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-colors ${
                  theme === 'light'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-colors ${
                  theme === 'system'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <div className="my-1 border-t border-[#272C36]" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
