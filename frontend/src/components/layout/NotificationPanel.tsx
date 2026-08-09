import React, { useState, useRef, useEffect } from 'react';
import { Bell, CreditCard, UserPlus, AlertCircle, FileText, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'payment' | 'user' | 'alert' | 'report';
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Payment received',
    description: 'Acme Corp completed $2,400 subscription payout.',
    time: '5 min ago',
    type: 'payment',
    read: false,
  },
  {
    id: '2',
    title: 'New customer registered',
    description: 'Starlight Media upgraded to Enterprise Tier.',
    time: '24 min ago',
    type: 'user',
    read: false,
  },
  {
    id: '3',
    title: 'Subscription expiring',
    description: 'Nexus Labs plan auto-renews in 3 days.',
    time: '1 hour ago',
    type: 'alert',
    read: false,
  },
  {
    id: '4',
    title: 'Financial report ready',
    description: 'Monthly MRR audit statement compiled.',
    time: '2 hours ago',
    type: 'report',
    read: true,
  },
];

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'user':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-[#8B5CF6]" />;
    }
  };

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#181C25] border border-[#272C36] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus:outline-none"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B5CF6] ring-2 ring-[#0B0D12]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181C25] border border-[#272C36] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-[#272C36] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#F8FAFC]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] font-extrabold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-[#A1A1AA] hover:text-[#8B5CF6] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-[#272C36] max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 flex items-start gap-3 hover:bg-[#12151C] transition-colors ${
                  !item.read ? 'bg-[#8B5CF6]/5' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-[#12151C] border border-[#272C36] flex-shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs font-semibold text-[#F8FAFC] truncate">{item.title}</h4>
                    <span className="text-[10px] text-[#71717A] flex-shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] line-clamp-2 leading-normal">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 border-t border-[#272C36] bg-[#0B0D12]/40 text-center">
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
