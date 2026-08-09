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

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await apiClient.get<APIResponse<DashboardData>>('/api/dashboard');
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch dashboard metrics');
  }
  return response.data;
}
