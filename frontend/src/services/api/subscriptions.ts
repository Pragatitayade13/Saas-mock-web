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

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_01',
    customerId: 'cust_01',
    plan: 'Enterprise',
    status: 'Active',
    amount: 12499,
    billingCycle: 'Monthly',
    startDate: '2026-01-15T10:00:00Z',
    nextBillingDate: '2026-09-15T10:00:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'sub_02',
    customerId: 'cust_02',
    plan: 'Professional',
    status: 'Active',
    amount: 4999,
    billingCycle: 'Monthly',
    startDate: '2026-02-10T11:30:00Z',
    nextBillingDate: '2026-09-10T11:30:00Z',
    createdAt: '2026-02-10T11:30:00Z',
    updatedAt: '2026-08-02T11:30:00Z',
  },
  {
    id: 'sub_03',
    customerId: 'cust_03',
    plan: 'Starter',
    status: 'Trial',
    amount: 1999,
    billingCycle: 'Monthly',
    startDate: '2026-03-05T09:15:00Z',
    nextBillingDate: '2026-08-19T09:15:00Z',
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
  },
  {
    id: 'sub_04',
    customerId: 'cust_04',
    plan: 'Enterprise',
    status: 'Active',
    amount: 119990,
    billingCycle: 'Yearly',
    startDate: '2026-04-12T14:20:00Z',
    nextBillingDate: '2027-04-12T14:20:00Z',
    createdAt: '2026-04-12T14:20:00Z',
    updatedAt: '2026-08-04T14:20:00Z',
  },
  {
    id: 'sub_05',
    customerId: 'cust_05',
    plan: 'Professional',
    status: 'PastDue',
    amount: 4999,
    billingCycle: 'Monthly',
    startDate: '2026-05-01T08:00:00Z',
    nextBillingDate: '2026-08-01T08:00:00Z',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-07-28T08:00:00Z',
  },
  {
    id: 'sub_06',
    customerId: 'cust_06',
    plan: 'Starter',
    status: 'Cancelled',
    amount: 1999,
    billingCycle: 'Monthly',
    startDate: '2026-06-18T16:45:00Z',
    nextBillingDate: '2026-07-18T16:45:00Z',
    createdAt: '2026-06-18T16:45:00Z',
    updatedAt: '2026-08-06T16:45:00Z',
  },
];

export async function fetchSubscriptions(params?: SubscriptionQueryParams): Promise<PaginatedSubscriptions> {
  try {
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
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {}

  let list = [...DEFAULT_SUBSCRIPTIONS];

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.customerId.toLowerCase().includes(q)
    );
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((s) => s.status.toLowerCase() === params.status?.toLowerCase());
  }

  if (params?.plan && params.plan !== 'all') {
    list = list.filter((s) => s.plan.toLowerCase() === params.plan?.toLowerCase());
  }

  if (params?.billingCycle && params.billingCycle !== 'all') {
    list = list.filter((s) => s.billingCycle.toLowerCase() === params.billingCycle?.toLowerCase());
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;

  return {
    data: list,
    meta: {
      page,
      limit,
      total: list.length,
      totalPages: Math.ceil(list.length / limit) || 1,
    },
  };
}

export async function fetchSubscriptionById(id: string): Promise<Subscription> {
  try {
    const res = await apiClient.get<APIResponse<Subscription>>(`/api/subscriptions/${id}`);
    if (res.data) return res.data;
  } catch {}
  return DEFAULT_SUBSCRIPTIONS.find((s) => s.id === id) || DEFAULT_SUBSCRIPTIONS[0];
}

export async function createSubscription(input: {
  customerId: string;
  plan: PlanTier;
  billingCycle: BillingCycle;
  startDate?: string;
  status?: SubscriptionStatus;
}): Promise<Subscription> {
  const newSub: Subscription = {
    id: `sub_${Date.now()}`,
    customerId: input.customerId,
    plan: input.plan,
    status: input.status || 'Active',
    amount: input.plan === 'Enterprise' ? 12499 : input.plan === 'Professional' ? 4999 : 1999,
    billingCycle: input.billingCycle,
    startDate: input.startDate || new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  DEFAULT_SUBSCRIPTIONS.unshift(newSub);
  return newSub;
}

export async function updateSubscription(id: string, input: Partial<Subscription>): Promise<Subscription> {
  const idx = DEFAULT_SUBSCRIPTIONS.findIndex((s) => s.id === id);
  if (idx !== -1) {
    DEFAULT_SUBSCRIPTIONS[idx] = { ...DEFAULT_SUBSCRIPTIONS[idx], ...input, updatedAt: new Date().toISOString() };
    return DEFAULT_SUBSCRIPTIONS[idx];
  }
  return DEFAULT_SUBSCRIPTIONS[0];
}

export async function changeSubscriptionPlan(id: string, plan: PlanTier): Promise<Subscription> {
  return updateSubscription(id, { plan });
}

export async function cancelSubscription(id: string): Promise<Subscription> {
  return updateSubscription(id, { status: 'Cancelled' });
}

export async function fetchCustomerSubscription(customerID: string): Promise<Subscription | null> {
  return DEFAULT_SUBSCRIPTIONS.find((s) => s.customerId === customerID) || null;
}

export async function fetchSubscriptionTransactions(id: string): Promise<{ data: CustomerTransaction[]; meta: PaginationMeta }> {
  return {
    data: [
      {
        id: 'tx_01',
        customerId: 'cust_01',
        subscriptionId: id,
        amount: 12499,
        currency: 'INR',
        status: 'Completed',
        type: 'Subscription',
        createdAt: '2026-08-08T14:00:00Z',
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };
}

export async function fetchPlans(): Promise<PlanConfig[]> {
  return [
    {
      plan: 'Starter',
      displayName: 'Starter Core',
      monthlyPrice: 1999,
      yearlyPrice: 19990,
      description: 'Ideal for early-stage SaaS startups',
      features: ['Up to 5 team members', 'Basic Analytics', 'Standard Support'],
    },
    {
      plan: 'Professional',
      displayName: 'Professional Growth',
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      description: 'For growing businesses requiring advanced telemetry',
      features: ['Up to 25 team members', 'Advanced Analytics', 'Priority Support'],
    },
    {
      plan: 'Enterprise',
      displayName: 'Enterprise Sovereign',
      monthlyPrice: 12499,
      yearlyPrice: 119990,
      description: 'Full sovereign multi-tenant engine',
      features: ['Unlimited team members', 'Dedicated DPO', 'Custom Webhooks'],
    },
  ];
}
