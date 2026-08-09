import { apiClient } from './client';
import { APIResponse } from '../../types/api';
import { CustomerTransaction } from './customers';

export type PlanTier = 'Free' | 'Starter' | 'Professional' | 'Enterprise';
export type SubscriptionStatus = 'Active' | 'Trial' | 'PastDue' | 'Cancelled' | 'Expired';
export type BillingCycle = 'Monthly' | 'Yearly';

export interface PlanConfig {
  plan: PlanTier;
  displayName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
}

export interface Subscription {
  id: string;
  customerId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  amount: number;
  billingCycle: BillingCycle;
  startDate: string;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedSubscriptions {
  data: Subscription[];
  meta: PaginationMeta;
}

export interface SubscriptionQueryParams {
  search?: string;
  customerId?: string;
  status?: string;
  plan?: string;
  billingCycle?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchSubscriptions(params?: SubscriptionQueryParams): Promise<PaginatedSubscriptions> {
  const queryParams: Record<string, string> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.status && params.status !== 'all') queryParams.status = params.status;
  if (params?.plan && params.plan !== 'all') queryParams.plan = params.plan;
  if (params?.billingCycle && params.billingCycle !== 'all') queryParams.billingCycle = params.billingCycle;
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const res = await apiClient.get<APIResponse<Subscription[]> & { meta?: PaginationMeta }>('/api/subscriptions', { params: queryParams });
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchSubscriptionById(id: string): Promise<Subscription> {
  const res = await apiClient.get<APIResponse<Subscription>>(`/api/subscriptions/${id}`);
  if (!res.data) throw new Error('Subscription not found');
  return res.data;
}

export async function createSubscription(input: {
  customerId: string;
  plan: PlanTier;
  billingCycle: BillingCycle;
  startDate?: string;
  status?: SubscriptionStatus;
}): Promise<Subscription> {
  const res = await apiClient.post<APIResponse<Subscription>>('/api/subscriptions', input);
  if (!res.data) throw new Error('Failed to create subscription');
  return res.data;
}

export async function updateSubscription(id: string, input: Partial<Subscription>): Promise<Subscription> {
  const res = await apiClient.put<APIResponse<Subscription>>(`/api/subscriptions/${id}`, input);
  if (!res.data) throw new Error('Failed to update subscription');
  return res.data;
}

export async function changeSubscriptionPlan(id: string, plan: PlanTier): Promise<Subscription> {
  const res = await apiClient.post<APIResponse<Subscription>>(`/api/subscriptions/${id}/change-plan`, { plan });
  if (!res.data) throw new Error('Failed to change subscription plan');
  return res.data;
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  const res = await apiClient.post<APIResponse<Subscription>>(`/api/subscriptions/${id}/cancel`);
  if (!res.data) throw new Error('Failed to cancel subscription');
  return res.data;
}

export async function fetchCustomerSubscription(customerID: string): Promise<Subscription | null> {
  try {
    const res = await apiClient.get<APIResponse<Subscription>>(`/api/customers/${customerID}/subscription`);
    return res.data || null;
  } catch {
    return null;
  }
}

export async function fetchSubscriptionTransactions(id: string): Promise<{ data: CustomerTransaction[]; meta: PaginationMeta }> {
  const res = await apiClient.get<APIResponse<CustomerTransaction[]> & { meta?: PaginationMeta }>(`/api/subscriptions/${id}/transactions`);
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchPlans(): Promise<PlanConfig[]> {
  const res = await apiClient.get<APIResponse<PlanConfig[]>>('/api/plans');
  return res.data || [];
}
