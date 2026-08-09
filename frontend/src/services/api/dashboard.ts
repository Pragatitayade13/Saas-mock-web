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

export const METRICS_BY_RANGE: Record<string, DashboardData> = {
  '7d': {
    revenue: {
      id: 'rev_7d',
      title: 'Total Revenue',
      value: '₹104,450.00',
      rawValue: 104450,
      change: '+18.4%',
      isPositive: true,
      period: 'vs previous 7 days',
    },
    customers: {
      id: 'cust_7d',
      title: 'Active Customers',
      value: '14',
      rawValue: 14,
      change: '+12.0%',
      isPositive: true,
      period: 'vs previous 7 days',
    },
    subscriptions: {
      id: 'sub_7d',
      title: 'Subscriptions',
      value: '14',
      rawValue: 14,
      change: '+9.5%',
      isPositive: true,
      period: 'vs previous 7 days',
    },
    conversion: {
      id: 'conv_7d',
      title: 'Conversion Rate',
      value: '91.20%',
      rawValue: 91.2,
      change: '+3.4%',
      isPositive: true,
      period: 'vs previous 7 days',
    },
    mrr: 32000,
    arr: 384000,
    pendingTransactions: 1,
    failedTransactions: 0,
    monthlyRevenueChart: [
      { name: 'Mon', revenue: 12400, target: 10000 },
      { name: 'Tue', revenue: 15200, target: 12000 },
      { name: 'Wed', revenue: 18900, target: 15000 },
      { name: 'Thu', revenue: 14100, target: 13000 },
      { name: 'Fri', revenue: 22500, target: 18000 },
      { name: 'Sat', revenue: 9800, target: 8000 },
      { name: 'Sun', revenue: 11350, target: 10000 },
    ],
    weeklyRevenueChart: [
      { name: 'Mon', revenue: 12400, target: 10000 },
      { name: 'Tue', revenue: 15200, target: 12000 },
      { name: 'Wed', revenue: 18900, target: 15000 },
      { name: 'Thu', revenue: 14100, target: 13000 },
      { name: 'Fri', revenue: 22500, target: 18000 },
      { name: 'Sat', revenue: 9800, target: 8000 },
      { name: 'Sun', revenue: 11350, target: 10000 },
    ],
    subscriptionMixChart: [
      { name: 'Enterprise', value: 5, color: '#8B5CF6' },
      { name: 'Professional', value: 6, color: '#22D3EE' },
      { name: 'Starter', value: 3, color: '#22C55E' },
    ],
    userGrowthChart: [
      { month: 'Mon', users: 2 },
      { month: 'Tue', users: 4 },
      { month: 'Wed', users: 7 },
      { month: 'Thu', users: 9 },
      { month: 'Fri', users: 12 },
      { month: 'Sat', users: 13 },
      { month: 'Sun', users: 14 },
    ],
    recentTransactions: [
      { id: 'tx_01', customer: 'Acme Corp', plan: 'Enterprise', amount: '₹12,499', status: 'Completed', date: '2 mins ago' },
      { id: 'tx_02', customer: 'Starlight Tech', plan: 'Professional', amount: '₹4,999', status: 'Completed', date: '1 hour ago' },
    ],
    recentActivity: [
      { id: 'act_01', title: 'New Enterprise Customer Onboarded: Acme Corp', time: '5 mins ago', type: 'customer' },
      { id: 'act_02', title: 'Subscription Upgraded: Starlight Tech', time: '1 hour ago', type: 'subscription' },
    ],
  },
  '30d': {
    revenue: {
      id: 'rev_30d',
      title: 'Total Revenue',
      value: '₹84,250.00',
      rawValue: 84250,
      change: '+12.5%',
      isPositive: true,
      period: 'vs last month',
    },
    customers: {
      id: 'cust_30d',
      title: 'Active Customers',
      value: '30',
      rawValue: 30,
      change: '+8.2%',
      isPositive: true,
      period: 'vs last month',
    },
    subscriptions: {
      id: 'sub_30d',
      title: 'Subscriptions',
      value: '30',
      rawValue: 30,
      change: '+5.7%',
      isPositive: true,
      period: 'vs last month',
    },
    conversion: {
      id: 'conv_30d',
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
  },
  '90d': {
    revenue: {
      id: 'rev_90d',
      title: 'Total Revenue',
      value: '₹235,250.00',
      rawValue: 235250,
      change: '+24.1%',
      isPositive: true,
      period: 'vs last quarter',
    },
    customers: {
      id: 'cust_90d',
      title: 'Active Customers',
      value: '68',
      rawValue: 68,
      change: '+15.3%',
      isPositive: true,
      period: 'vs last quarter',
    },
    subscriptions: {
      id: 'sub_90d',
      title: 'Subscriptions',
      value: '65',
      rawValue: 65,
      change: '+11.8%',
      isPositive: true,
      period: 'vs last quarter',
    },
    conversion: {
      id: 'conv_90d',
      title: 'Conversion Rate',
      value: '78.40%',
      rawValue: 78.4,
      change: '+4.2%',
      isPositive: true,
      period: 'vs last quarter',
    },
    mrr: 78000,
    arr: 936000,
    pendingTransactions: 4,
    failedTransactions: 2,
    monthlyRevenueChart: [
      { name: 'May', revenue: 72000, target: 68000 },
      { name: 'Jun', revenue: 79000, target: 75000 },
      { name: 'Jul', revenue: 84250, target: 80000 },
    ],
    weeklyRevenueChart: [
      { name: 'Month 1', revenue: 72000, target: 68000 },
      { name: 'Month 2', revenue: 79000, target: 75000 },
      { name: 'Month 3', revenue: 84250, target: 80000 },
    ],
    subscriptionMixChart: [
      { name: 'Enterprise', value: 24, color: '#8B5CF6' },
      { name: 'Professional', value: 26, color: '#22D3EE' },
      { name: 'Starter', value: 15, color: '#22C55E' },
    ],
    userGrowthChart: [
      { month: 'May', users: 40 },
      { month: 'Jun', users: 55 },
      { month: 'Jul', users: 68 },
    ],
    recentTransactions: [
      { id: 'tx_01', customer: 'Acme Corp', plan: 'Enterprise', amount: '₹12,499', status: 'Completed', date: '2 mins ago' },
      { id: 'tx_02', customer: 'Starlight Tech', plan: 'Professional', amount: '₹4,999', status: 'Completed', date: '1 hour ago' },
      { id: 'tx_03', customer: 'Apex Global', plan: 'Starter', amount: '₹1,999', status: 'Pending', date: '3 hours ago' },
    ],
    recentActivity: [
      { id: 'act_01', title: 'New Enterprise Customer Onboarded: Acme Corp', time: '5 mins ago', type: 'customer' },
      { id: 'act_02', title: 'Subscription Upgraded: Starlight Tech', time: '1 hour ago', type: 'subscription' },
    ],
  },
  'ytd': {
    revenue: {
      id: 'rev_ytd',
      title: 'Total Revenue',
      value: '₹450,250.00',
      rawValue: 450250,
      change: '+35.8%',
      isPositive: true,
      period: 'vs last year',
    },
    customers: {
      id: 'cust_ytd',
      title: 'Active Customers',
      value: '120',
      rawValue: 120,
      change: '+22.5%',
      isPositive: true,
      period: 'vs last year',
    },
    subscriptions: {
      id: 'sub_ytd',
      title: 'Subscriptions',
      value: '115',
      rawValue: 115,
      change: '+19.4%',
      isPositive: true,
      period: 'vs last year',
    },
    conversion: {
      id: 'conv_ytd',
      title: 'Conversion Rate',
      value: '88.60%',
      rawValue: 88.6,
      change: '+6.5%',
      isPositive: true,
      period: 'vs last year',
    },
    mrr: 148000,
    arr: 1776000,
    pendingTransactions: 6,
    failedTransactions: 3,
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
      { name: 'Q1', revenue: 151000, target: 135000 },
      { name: 'Q2', revenue: 215000, target: 203000 },
      { name: 'Q3', revenue: 84250, target: 80000 },
    ],
    subscriptionMixChart: [
      { name: 'Enterprise', value: 45, color: '#8B5CF6' },
      { name: 'Professional', value: 45, color: '#22D3EE' },
      { name: 'Starter', value: 25, color: '#22C55E' },
    ],
    userGrowthChart: [
      { month: 'Jan', users: 10 },
      { month: 'Feb', users: 25 },
      { month: 'Mar', users: 45 },
      { month: 'Apr', users: 70 },
      { month: 'May', users: 90 },
      { month: 'Jun', users: 105 },
      { month: 'Jul', users: 120 },
    ],
    recentTransactions: [
      { id: 'tx_01', customer: 'Acme Corp', plan: 'Enterprise', amount: '₹12,499', status: 'Completed', date: '2 mins ago' },
      { id: 'tx_02', customer: 'Starlight Tech', plan: 'Professional', amount: '₹4,999', status: 'Completed', date: '1 hour ago' },
    ],
    recentActivity: [
      { id: 'act_01', title: 'New Enterprise Customer Onboarded: Acme Corp', time: '5 mins ago', type: 'customer' },
    ],
  },
};

export const DEFAULT_DASHBOARD_DATA: DashboardData = METRICS_BY_RANGE['30d'];

export async function fetchDashboardData(range: string = '30d'): Promise<DashboardData> {
  try {
    const response = await apiClient.get<APIResponse<DashboardData>>('/api/dashboard', { params: { range } });
    if (response.success && response.data) {
      return response.data;
    }
  } catch {}

  return METRICS_BY_RANGE[range] || METRICS_BY_RANGE['30d'];
}
