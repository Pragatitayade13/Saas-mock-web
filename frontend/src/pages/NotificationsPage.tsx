import React from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bell, CheckCheck, CreditCard, UserPlus, AlertCircle, FileText } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const allNotifications = [
    { id: '1', title: 'Payment received', description: 'Acme Corp completed $2,400 subscription payout.', time: '5 minutes ago', type: 'payment', read: false },
    { id: '2', title: 'New customer registered', description: 'Starlight Media upgraded to Enterprise Tier.', time: '24 minutes ago', type: 'user', read: false },
    { id: '3', title: 'Subscription expiring', description: 'Nexus Labs plan auto-renews in 3 days.', time: '1 hour ago', type: 'alert', read: false },
    { id: '4', title: 'Financial report ready', description: 'Monthly MRR audit statement compiled.', time: '2 hours ago', type: 'report', read: true },
    { id: '5', title: 'System update completed', description: 'Gin Backend microservice v2.1 successfully deployed.', time: '5 hours ago', type: 'alert', read: true },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#F8FAFC]">Notifications & Webhook Logs</h1>
            <p className="text-xs text-[#A1A1AA]">Real-time system events, alerts, and audit notifications.</p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        </div>

        <div className="space-y-3">
          {allNotifications.map((n) => (
            <Card key={n.id} variant="standard" className={`p-4 flex items-center justify-between ${!n.read ? 'border-l-4 border-l-[#8B5CF6]' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#181C25] border border-[#272C36] text-[#8B5CF6]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F8FAFC]">{n.title}</h4>
                  <p className="text-xs text-[#A1A1AA]">{n.description}</p>
                </div>
              </div>
              <span className="text-[11px] text-[#71717A]">{n.time}</span>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
};
