import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { RevenueChartPoint, SubscriptionMixItem, CustomerGrowthPoint } from '../../services/api/dashboard';

const defaultMonthlyRevenueData: RevenueChartPoint[] = [
  { name: 'Jan', revenue: 42000, target: 40000 },
  { name: 'Feb', revenue: 51000, target: 45000 },
  { name: 'Mar', revenue: 58000, target: 50000 },
  { name: 'Apr', revenue: 64000, target: 60000 },
  { name: 'May', revenue: 72000, target: 68000 },
  { name: 'Jun', revenue: 79000, target: 75000 },
  { name: 'Jul', revenue: 84250, target: 80000 },
];

const defaultWeeklyRevenueData: RevenueChartPoint[] = [
  { name: 'Week 1', revenue: 18500, target: 17500 },
  { name: 'Week 2', revenue: 21000, target: 19000 },
  { name: 'Week 3', revenue: 22400, target: 20500 },
  { name: 'Week 4', revenue: 22350, target: 21000 },
];

const defaultSubscriptionMixData: SubscriptionMixItem[] = [
  { name: 'Enterprise', value: 10, color: '#8B5CF6' },
  { name: 'Professional', value: 12, color: '#22D3EE' },
  { name: 'Starter', value: 8, color: '#22C55E' },
];

const defaultUserGrowthData: CustomerGrowthPoint[] = [
  { month: 'Jan', users: 5 },
  { month: 'Feb', users: 10 },
  { month: 'Mar', users: 15 },
  { month: 'Apr', users: 20 },
  { month: 'May', users: 25 },
  { month: 'Jun', users: 30 },
];

interface RevenueOverviewChartProps {
  monthlyData?: RevenueChartPoint[];
  weeklyData?: RevenueChartPoint[];
}

export const RevenueOverviewChart: React.FC<RevenueOverviewChartProps> = ({
  monthlyData = defaultMonthlyRevenueData,
  weeklyData = defaultWeeklyRevenueData,
}) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');
  const data = timeframe === 'monthly' ? (monthlyData.length ? monthlyData : defaultMonthlyRevenueData) : (weeklyData.length ? weeklyData : defaultWeeklyRevenueData);

  return (
    <Card variant="chart" className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Revenue Overview</h3>
          <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">Monthly vs Weekly ARR progression</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181C25] p-1 rounded-lg border border-slate-200 dark:border-[#272C36] w-fit">
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              timeframe === 'monthly' ? 'bg-[#8B5CF6] text-white' : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              timeframe === 'weekly' ? 'bg-[#8B5CF6] text-white' : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

interface SubscriptionMixChartProps {
  data?: SubscriptionMixItem[];
}

export const SubscriptionMixChart: React.FC<SubscriptionMixChartProps> = ({ data = defaultSubscriptionMixData }) => {
  const chartData = data.length ? data : defaultSubscriptionMixData;

  return (
    <Card variant="chart" className="flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Subscription Mix</h3>
      <p className="text-xs text-slate-500 dark:text-[#A1A1AA] mb-4">Distribution by active plan tier</p>

      <div className="h-56 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#A1A1AA]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface UserGrowthChartProps {
  data?: CustomerGrowthPoint[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data = defaultUserGrowthData }) => {
  const chartData = data.length ? data : defaultUserGrowthData;

  return (
    <Card variant="chart" className="flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] mb-1">Customer Growth</h3>
      <p className="text-xs text-slate-500 dark:text-[#A1A1AA] mb-4">Cumulative active customer onboarding</p>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            <Bar dataKey="users" fill="#22D3EE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
