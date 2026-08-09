import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { UserPlus, ArrowUpRight, CreditCard, FileCheck2, Bell } from 'lucide-react';
import { DashboardActivity } from '../../services/api/dashboard';

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

const defaultActivities: ActivityItem[] = [
  { id: '1', title: 'New customer registered', time: '5 minutes ago', icon: UserPlus, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: '2', title: 'Subscription upgraded', time: '24 minutes ago', icon: ArrowUpRight, color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
  { id: '3', title: 'Payment received', time: '1 hour ago', icon: CreditCard, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: '4', title: 'Report generated', time: '2 hours ago', icon: FileCheck2, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
];

function getIconAndColorForType(type?: string): { icon: React.ElementType; color: string } {
  switch (type?.toLowerCase()) {
    case 'customer':
      return { icon: UserPlus, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    case 'subscription':
      return { icon: ArrowUpRight, color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' };
    case 'payment':
      return { icon: CreditCard, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'report':
      return { icon: FileCheck2, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' };
    default:
      return { icon: Bell, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20' };
  }
}

interface ActivityTimelineProps {
  initialItems?: DashboardActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ initialItems }) => {
  const displayItems: ActivityItem[] = initialItems?.length
    ? initialItems.map((act) => {
        const { icon, color } = getIconAndColorForType(act.type);
        return {
          id: act.id,
          title: act.title,
          time: act.time,
          icon,
          color,
        };
      })
    : defaultActivities;

  return (
    <Card variant="standard" className="flex flex-col">
      <div className="mb-4 pb-3 border-b border-slate-200/90 dark:border-[#272C36]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Recent Activity</h3>
        <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">Real-time system events timeline</p>
      </div>

      <div className="space-y-4">
        {displayItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">{item.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-[#707784]">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/90 dark:border-[#272C36] text-center">
        <Link to="/activity" className="text-xs font-bold text-[#8B5CF6] hover:underline">
          View All Activity →
        </Link>
      </div>
    </Card>
  );
};
