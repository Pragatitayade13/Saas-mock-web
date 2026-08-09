import React, { useState, useRef, useEffect } from 'react';
import { Bell, CreditCard, UserPlus, AlertCircle, FileText, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  NotificationItem,
  getStoredNotifications,
  markAllNotificationsAsRead,
} from '../../services/api/notifications';

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications());
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const sync = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('nexora-notifications-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('nexora-notifications-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case 'user':
        return <UserPlus className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-[#8B5CF6]" />;
    }
  };

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-[#A5ACB8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171A20] border border-slate-200 dark:border-[#272C36] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus:outline-none"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B5CF6] ring-2 ring-white dark:ring-[#0B0D12]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#181C25] border border-slate-200 dark:border-[#272C36] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#272C36] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] font-extrabold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-slate-500 dark:text-[#A1A1AA] hover:text-[#8B5CF6] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200/80 dark:divide-[#272C36] max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-[#12151C] transition-colors ${
                  !item.read ? 'bg-purple-50/60 dark:bg-[#8B5CF6]/5' : ''
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#12151C] border border-slate-200 dark:border-[#272C36] shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-[#71717A] shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-[#A1A1AA] line-clamp-2 leading-normal">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 border-t border-slate-200 dark:border-[#272C36] bg-slate-50 dark:bg-[#0B0D12]/40 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
