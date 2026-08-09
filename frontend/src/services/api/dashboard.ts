import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  rawValue: number;
  change: string;
  isPositive: boolean;
  period: string;
}

export interface RevenueChartPoint {
  name: string;
  revenue: number;
  target: number;
}

export interface SubscriptionMixItem {
  name: string;
  value: number;
  color: string;
}

export interface CustomerGrowthPoint {
  month: string;
  users: number;
}

export interface DashboardTransaction {
  id: string;
  customer: string;
  plan: string;
  amount: string;
  status: string;
  date: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  time: string;
  type: string;
}

export interface DashboardData {
  revenue: DashboardMetric;
  customers: DashboardMetric;
  subscriptions: DashboardMetric;
  conversion: DashboardMetric;
  mrr: number;
  arr: number;
  pendingTransactions: number;
  failedTransactions: number;
  monthlyRevenueChart: RevenueChartPoint[];
  weeklyRevenueChart: RevenueChartPoint[];
  subscriptionMixChart: SubscriptionMixItem[];
  userGrowthChart: CustomerGrowthPoint[];
  recentTransactions: DashboardTransaction[];
  recentActivity: DashboardActivity[];
}

export const DEFAULT_DASHBOARD_DATA: DashboardData = {
  revenue: {
    id: 'rev_1',
    title: 'Total Revenue',
    value: '₹84,250.00',
    rawValue: 84250,
    change: '+12.5%',
    isPositive: true,
    period: 'vs last month',
  },
  customers: {
    id: 'cust_1',
    title: 'Active Customers',
    value: '30',
    rawValue: 30,
    change: '+8.2%',
    isPositive: true,
    period: 'vs last month',
  },
  subscriptions: {
    id: 'sub_1',
    title: 'Subscriptions',
    value: '30',
    rawValue: 30,
    change: '+5.7%',
    isPositive: true,
    period: 'vs last month',
  },
  conversion: {
    id: 'conv_1',
    title: 'Conversion Rate',
    value: '83.33%',
    rawValue: 83.33,
    change: '+1.8%',
    isPositive: true,
    period: 'vs last month',
  },
  mrr: 28000,
  arr: 336000,
  pendingTransactions: 2,
  failedTransactions: 1,
  monthlyRevenueChart: [
    { name: 'Jan', revenue: 42000, target: 40000 },
    { name: 'Feb', revenue: 51000, target: 45000 },
    { name: 'Mar', revenue: 58000, target: 50000 },
    { name: 'Apr', revenue: 64000, target: 60000 },
    { name: 'May', revenue: 72000, target: 68000 },
    { name: 'Jun', revenue: 79000, target: 75000 },
    { name: 'Jul', revenue: 84250, target: 80000 },
  ],
  weeklyRevenueChart: [
    { name: 'Week 1', revenue: 18500, target: 17500 },
    { name: 'Week 2', revenue: 21000, target: 19000 },
    { name: 'Week 3', revenue: 22400, target: 20500 },
    { name: 'Week 4', revenue: 22350, target: 21000 },
  ],
  subscriptionMixChart: [
    { name: 'Enterprise', value: 10, color: '#8B5CF6' },
    { name: 'Professional', value: 12, color: '#22D3EE' },
    { name: 'Starter', value: 8, color: '#22C55E' },
  ],
  userGrowthChart: [
    { month: 'Jan', users: 5 },
    { month: 'Feb', users: 10 },
    { month: 'Mar', users: 15 },
    { month: 'Apr', users: 20 },
    { month: 'May', users: 25 },
    { month: 'Jun', users: 30 },
  ],
  recentTransactions: [
    { id: 'tx_01', customer: 'Acme Corp', plan: 'Enterprise', amount: '₹12,499', status: 'Completed', date: '2 mins ago' },
    { id: 'tx_02', customer: 'Starlight Tech', plan: 'Professional', amount: '₹4,999', status: 'Completed', date: '1 hour ago' },
    { id: 'tx_03', customer: 'Apex Global', plan: 'Starter', amount: '₹1,999', status: 'Pending', date: '3 hours ago' },
    { id: 'tx_04', customer: 'Nova Media', plan: 'Enterprise', amount: '₹12,499', status: 'Completed', date: '5 hours ago' },
    { id: 'tx_05', customer: 'Vortex Inc', plan: 'Professional', amount: '₹4,999', status: 'Failed', date: '1 day ago' },
  ],
  recentActivity: [
    { id: 'act_01', title: 'New Enterprise Customer Onboarded: Acme Corp', time: '5 mins ago', type: 'customer' },
    { id: 'act_02', title: 'Subscription Upgraded: Starlight Tech', time: '1 hour ago', type: 'subscription' },
    { id: 'act_03', title: 'Security Audit Log Exported by Admin', time: '3 hours ago', type: 'security' },
    { id: 'act_04', title: 'Payment Processing Succeeded ₹12,499', time: '5 hours ago', type: 'transaction' },
  ],
};

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await apiClient.get<APIResponse<DashboardData>>('/api/dashboard');
    if (response.success && response.data) {
      return response.data;
    }
    return DEFAULT_DASHBOARD_DATA;
  } catch {
    // Seamless fallback to in-memory demo data when Vercel static deployment or offline
    return DEFAULT_DASHBOARD_DATA;
  }
}
