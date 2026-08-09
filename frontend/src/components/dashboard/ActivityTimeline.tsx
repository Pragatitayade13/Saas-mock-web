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
  { id: '1', title: 'New customer registered', time: '5 minutes ago', icon: UserPlus, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: '2', title: 'Subscription upgraded', time: '24 minutes ago', icon: ArrowUpRight, color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
  { id: '3', title: 'Payment received', time: '1 hour ago', icon: CreditCard, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: '4', title: 'Report generated', time: '2 hours ago', icon: FileCheck2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
];

function getIconAndColorForType(type?: string): { icon: React.ElementType; color: string } {
  switch (type?.toLowerCase()) {
    case 'customer':
      return { icon: UserPlus, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    case 'subscription':
      return { icon: ArrowUpRight, color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' };
    case 'payment':
      return { icon: CreditCard, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'report':
      return { icon: FileCheck2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    default:
      return { icon: Bell, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
  }
}

interface ActivityTimelineProps {
  activities?: DashboardActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const displayItems: ActivityItem[] = activities?.length
    ? activities.map((act) => {
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
      <div className="mb-4 pb-3 border-b border-[#272C36]">
        <h3 className="text-sm font-bold text-[#F8FAFC]">Recent Activity</h3>
        <p className="text-xs text-[#A1A1AA]">Real-time system events timeline</p>
      </div>

      <div className="relative pl-4 border-l border-[#272C36] space-y-6 my-2">
        {displayItems.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="relative group">
              <div className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${act.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span>{act.title}</span>
                </span>
                <span className="text-[11px] text-[#71717A] mt-0.5">{act.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-[#272C36] text-center">
        <Link to="/activity" className="text-xs font-bold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
          View All Activity →
        </Link>
      </div>
    </Card>
  );
};
