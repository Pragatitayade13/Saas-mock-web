export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'payment' | 'user' | 'alert' | 'report';
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Payment received',
    description: 'Acme Corp completed ₹12,499 subscription payout.',
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
  {
    id: '5',
    title: 'System update completed',
    description: 'Gin Backend microservice v2.1 successfully deployed.',
    time: '5 hours ago',
    type: 'alert',
    read: true,
  },
];

export function getStoredNotifications(): NotificationItem[] {
  const saved = localStorage.getItem('nexora_notifications');
  if (!saved) return DEFAULT_NOTIFICATIONS;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotifications(items: NotificationItem[]): void {
  localStorage.setItem('nexora_notifications', JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('nexora-notifications-updated'));
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
}

export function getUnreadNotificationCount(): number {
  return getStoredNotifications().filter((n) => !n.read).length;
}
