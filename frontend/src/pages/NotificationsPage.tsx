import React, { useState, useEffect } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, CheckCheck } from 'lucide-react';
import {
  NotificationItem,
  getStoredNotifications,
  markAllNotificationsAsRead,
} from '../services/api/notifications';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications());

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

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">Notifications & Webhook Logs</h1>
            <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">Real-time system events, alerts, and audit notifications.</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              leftIcon={<CheckCheck className="w-4 h-4 text-[#8B5CF6]" />}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} variant="standard" className={`p-4 flex items-center justify-between ${!n.read ? 'border-l-4 border-l-[#8B5CF6] bg-purple-50/30 dark:bg-[#8B5CF6]/5' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#181C25] border border-slate-200 dark:border-[#272C36] text-[#8B5CF6]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-[#A1A1AA]">{n.description}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-[#71717A]">{n.time}</span>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};
