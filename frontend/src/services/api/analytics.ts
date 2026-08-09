import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export interface MetricWithChange {
  value: number;
  previousValue: number;
  changePercent: number;
}

export interface AnalyticsSummary {
  revenue: MetricWithChange;
  customers: MetricWithChange;
  activeSubscriptions: MetricWithChange;
  mrr: MetricWithChange;
}

export interface RevenueTimePoint {
  date: string;
  revenue: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customersWithoutSubCount: number;
}

export interface CustomerGrowthPoint {
  date: string;
  newCustomers: number;
  cumulativeCustomers: number;
}

export interface SubscriptionAnalytics {
  total: number;
  active: number;
  trial: number;
  pastDue: number;
  cancelled: number;
  expired: number;
}

export interface MRRAnalytics {
  mrr: number;
  arr: number;
  netMrrGrowth: number;
}

export interface ChurnAnalytics {
  churnRate: number;
  cancelledCount: number;
  baselineCount: number;
}

export interface TransactionAnalytics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  successRate: number;
  refundRate: number;
  failureRate: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  company: string;
  email: string;
  revenue: number;
}

export interface TopPlan {
  plan: string;
  revenue: number;
  subscriptionCount: number;
}

export interface AnalyticsQueryParams {
  range?: string;
  startDate?: string;
  endDate?: string;
  plan?: string;
  status?: string;
  paymentMethod?: string;
}

function toCleanParams(params?: AnalyticsQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const clean: Record<string, string> = {};
  if (params.range) clean.range = params.range;
  if (params.startDate) clean.startDate = params.startDate;
  if (params.endDate) clean.endDate = params.endDate;
  if (params.plan && params.plan !== 'all') clean.plan = params.plan;
  if (params.status && params.status !== 'all') clean.status = params.status;
  if (params.paymentMethod && params.paymentMethod !== 'all') clean.paymentMethod = params.paymentMethod;
  return clean;
}

export async function fetchAnalyticsSummary(params?: AnalyticsQueryParams): Promise<AnalyticsSummary> {
  const res = await apiClient.get<APIResponse<AnalyticsSummary>>('/api/analytics/summary', { params: toCleanParams(params) });
  return res.data || {
    revenue: { value: 0, previousValue: 0, changePercent: 0 },
    customers: { value: 0, previousValue: 0, changePercent: 0 },
    activeSubscriptions: { value: 0, previousValue: 0, changePercent: 0 },
    mrr: { value: 0, previousValue: 0, changePercent: 0 },
  };
}

export async function fetchRevenueTrend(params?: AnalyticsQueryParams): Promise<RevenueTimePoint[]> {
  const res = await apiClient.get<APIResponse<RevenueTimePoint[]>>('/api/analytics/revenue', { params: toCleanParams(params) });
  return res.data || [];
}

export async function fetchCustomerAnalytics(params?: AnalyticsQueryParams): Promise<CustomerAnalytics> {
  const res = await apiClient.get<APIResponse<CustomerAnalytics>>('/api/analytics/customers', { params: toCleanParams(params) });
  return res.data || { totalCustomers: 0, newCustomers: 0, activeCustomers: 0, customersWithoutSubCount: 0 };
}

export async function fetchCustomerGrowth(params?: AnalyticsQueryParams): Promise<CustomerGrowthPoint[]> {
  const res = await apiClient.get<APIResponse<CustomerGrowthPoint[]>>('/api/analytics/customers/growth', { params: toCleanParams(params) });
  return res.data || [];
}

export async function fetchSubscriptionAnalytics(params?: AnalyticsQueryParams): Promise<SubscriptionAnalytics> {
  const res = await apiClient.get<APIResponse<SubscriptionAnalytics>>('/api/analytics/subscriptions', { params: toCleanParams(params) });
  return res.data || { total: 0, active: 0, trial: 0, pastDue: 0, cancelled: 0, expired: 0 };
}

export async function fetchMRR(params?: AnalyticsQueryParams): Promise<MRRAnalytics> {
  const res = await apiClient.get<APIResponse<MRRAnalytics>>('/api/analytics/mrr', { params: toCleanParams(params) });
  return res.data || { mrr: 0, arr: 0, netMrrGrowth: 0 };
}

export async function fetchChurn(params?: AnalyticsQueryParams): Promise<ChurnAnalytics> {
  const res = await apiClient.get<APIResponse<ChurnAnalytics>>('/api/analytics/churn', { params: toCleanParams(params) });
  return res.data || { churnRate: 0, cancelledCount: 0, baselineCount: 0 };
}

export async function fetchTransactionAnalytics(params?: AnalyticsQueryParams): Promise<TransactionAnalytics> {
  const res = await apiClient.get<APIResponse<TransactionAnalytics>>('/api/analytics/transactions', { params: toCleanParams(params) });
  return res.data || { total: 0, completed: 0, pending: 0, failed: 0, refunded: 0, successRate: 0, refundRate: 0, failureRate: 0 };
}

export async function fetchTopCustomers(params?: AnalyticsQueryParams): Promise<TopCustomer[]> {
  const res = await apiClient.get<APIResponse<TopCustomer[]>>('/api/analytics/top-customers', { params: toCleanParams(params) });
  return res.data || [];
}

export async function fetchTopPlans(params?: AnalyticsQueryParams): Promise<TopPlan[]> {
  const res = await apiClient.get<APIResponse<TopPlan[]>>('/api/analytics/top-plans', { params: toCleanParams(params) });
  return res.data || [];
}

export async function exportAnalyticsReport(params?: AnalyticsQueryParams): Promise<Blob> {
  const response = await fetch(`/api/analytics/export?${new URLSearchParams(params as Record<string, string>).toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  });
  return response.blob();
}
