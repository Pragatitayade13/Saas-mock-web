import React from 'react';
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { DashboardMetric } from '../../services/api/dashboard';

interface MetricCardsProps {
  metrics?: {
    revenue?: DashboardMetric;
    customers?: DashboardMetric;
    subscriptions?: DashboardMetric;
    conversion?: DashboardMetric;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const parseNumericValue = (val?: string): { raw: number; prefix: string; suffix: string; decimals: number } => {
    if (!val) return { raw: 0, prefix: '', suffix: '', decimals: 0 };
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned) || 0;
    const prefix = val.startsWith('$') ? '$' : val.startsWith('₹') ? '₹' : '';
    const suffix = val.endsWith('%') ? '%' : '';
    const decParts = cleaned.split('.')[1];
    const decimals = decParts ? decParts.length : 0;
    return { raw: num, prefix, suffix, decimals };
  };

  const cards = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      valueStr: metrics?.revenue?.value || '₹84,250.00',
      parsed: parseNumericValue(metrics?.revenue?.value || '₹84,250.00'),
      change: metrics?.revenue?.change || '+12.5%',
      period: metrics?.revenue?.period || 'vs last month',
      icon: DollarSign,
      sparkline: 'M0 20 Q 15 15, 30 18 T 60 8 T 90 4 T 120 12 T 150 2',
      color: 'from-purple-500/20 to-purple-500/5 text-[#8B5CF6] border-purple-500/30',
      strokeColor: '#8B5CF6',
    },
    {
      id: 'customers',
      title: 'Active Customers',
      valueStr: metrics?.customers?.value || '30',
      parsed: parseNumericValue(metrics?.customers?.value || '30'),
      change: metrics?.customers?.change || '+8.2%',
      period: metrics?.customers?.period || 'vs last month',
      icon: Users,
      sparkline: 'M0 18 Q 15 12, 30 15 T 60 10 T 90 6 T 120 8 T 150 4',
      color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      strokeColor: '#22D3EE',
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions',
      valueStr: metrics?.subscriptions?.value || '30',
      parsed: parseNumericValue(metrics?.subscriptions?.value || '30'),
      change: metrics?.subscriptions?.change || '+5.7%',
      period: metrics?.subscriptions?.period || 'vs last month',
      icon: CreditCard,
      sparkline: 'M0 22 Q 15 16, 30 18 T 60 12 T 90 14 T 120 6 T 150 5',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      strokeColor: '#22C55E',
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      valueStr: metrics?.conversion?.value || '83.33%',
      parsed: parseNumericValue(metrics?.conversion?.value || '83.33%'),
      change: metrics?.conversion?.change || '+1.8%',
      period: metrics?.conversion?.period || 'vs last month',
      icon: TrendingUp,
      sparkline: 'M0 16 Q 15 20, 30 14 T 60 10 T 90 8 T 120 5 T 150 3',
      color: 'from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-300 border-purple-500/30',
      strokeColor: '#A855F7',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.id} variant="metric" className="relative group overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-[#A5ACB8] uppercase tracking-wider">
                {item.title}
              </span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${item.color} shadow-xs transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 z-10 relative">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F7F8FA] tracking-tight">
                {item.parsed.raw > 0 ? (
                  <AnimatedCounter
                    value={item.parsed.raw}
                    prefix={item.parsed.prefix}
                    suffix={item.parsed.suffix}
                    decimals={item.parsed.decimals}
                  />
                ) : (
                  item.valueStr
                )}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{item.change}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-slate-500 dark:text-[#707784] font-medium">{item.period}</p>
              <svg className="w-20 h-6 overflow-visible opacity-70 group-hover:opacity-100 transition-opacity">
                <path
                  d={item.sparkline}
                  fill="none"
                  stroke={item.strokeColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
