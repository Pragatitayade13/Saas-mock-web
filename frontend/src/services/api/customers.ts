import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Inactive' | 'Trial' | 'Suspended';
  monthlyRevenue: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  type: 'Subscription' | 'OneTime' | 'Refund' | 'Adjustment';
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCustomers {
  data: Customer[];
  meta: PaginationMeta;
}

export interface PaginatedTransactions {
  data: CustomerTransaction[];
  meta: PaginationMeta;
}

export interface CustomerQueryParams {
  search?: string;
  status?: string;
  plan?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    name: 'Acme Corporation',
    email: 'billing@acmecorp.demo',
    company: 'Acme Corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    plan: 'Enterprise',
    status: 'Active',
    monthlyRevenue: 12499,
    location: 'San Francisco, CA',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'cust_02',
    name: 'Starlight Media',
    email: 'accounts@starlight.demo',
    company: 'Starlight Media Inc',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    plan: 'Professional',
    status: 'Active',
    monthlyRevenue: 4999,
    location: 'New York, NY',
    createdAt: '2026-02-10T11:30:00Z',
    updatedAt: '2026-08-02T11:30:00Z',
  },
  {
    id: 'cust_03',
    name: 'Apex Global Logistics',
    email: 'admin@apexglobal.demo',
    company: 'Apex Global',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    plan: 'Starter',
    status: 'Trial',
    monthlyRevenue: 1999,
    location: 'London, UK',
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
  },
  {
    id: 'cust_04',
    name: 'Nova Digital Studio',
    email: 'hello@novadigital.demo',
    company: 'Nova Media',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    plan: 'Enterprise',
    status: 'Active',
    monthlyRevenue: 12499,
    location: 'Austin, TX',
    createdAt: '2026-04-12T14:20:00Z',
    updatedAt: '2026-08-04T14:20:00Z',
  },
  {
    id: 'cust_05',
    name: 'Vortex Tech Systems',
    email: 'support@vortex.demo',
    company: 'Vortex Dynamics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    plan: 'Professional',
    status: 'Inactive',
    monthlyRevenue: 0,
    location: 'Seattle, WA',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-07-28T08:00:00Z',
  },
  {
    id: 'cust_06',
    name: 'Nexus Labs Innovations',
    email: 'contact@nexuslabs.demo',
    company: 'Nexus Labs',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    plan: 'Starter',
    status: 'Suspended',
    monthlyRevenue: 0,
    location: 'Toronto, Canada',
    createdAt: '2026-06-18T16:45:00Z',
    updatedAt: '2026-08-06T16:45:00Z',
  },
];

export async function fetchCustomers(params?: CustomerQueryParams): Promise<PaginatedCustomers> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.status && params.status !== 'all') queryParams.status = params.status;
    if (params?.plan && params.plan !== 'all') queryParams.plan = params.plan;
    if (params?.location) queryParams.location = params.location;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    const res = await apiClient.get<APIResponse<Customer[]> & { meta?: PaginationMeta }>('/api/customers', { params: queryParams });
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {
    // Fallback to local mock filtering when backend API is unreachable on Vercel
  }

  let list = [...DEFAULT_CUSTOMERS];

  // Apply search query
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }

  // Apply status filter
  if (params?.status && params.status !== 'all') {
    const statuses = params.status.toLowerCase().split(',');
    list = list.filter((c) => statuses.includes(c.status.toLowerCase()));
  }

  // Apply plan filter
  if (params?.plan && params.plan !== 'all') {
    const plans = params.plan.toLowerCase().split(',');
    list = list.filter((c) => plans.includes(c.plan.toLowerCase()));
  }

  // Apply location filter
  if (params?.location) {
    const loc = params.location.toLowerCase();
    list = list.filter((c) => c.location.toLowerCase().includes(loc));
  }

  // Apply sorting
  const sortBy = params?.sortBy || 'createdAt';
  const sortOrder = params?.sortOrder || 'desc';

  list.sort((a, b) => {
    let valA: any = (a as any)[sortBy] || '';
    let valB: any = (b as any)[sortBy] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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

export async function fetchCustomerById(id: string): Promise<Customer> {
  try {
    const res = await apiClient.get<APIResponse<Customer>>(`/api/customers/${id}`);
    if (res.data) return res.data;
  } catch {}
  return DEFAULT_CUSTOMERS.find((c) => c.id === id) || DEFAULT_CUSTOMERS[0];
}

export async function createCustomer(input: Partial<Customer>): Promise<Customer> {
  const newCust: Customer = {
    id: `cust_${Date.now()}`,
    name: input.name || 'New Customer',
    email: input.email || 'customer@nexora.demo',
    company: input.company || 'New Corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    plan: input.plan || 'Starter',
    status: input.status || 'Active',
    monthlyRevenue: input.monthlyRevenue || 1999,
    location: input.location || 'San Francisco, CA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  DEFAULT_CUSTOMERS.unshift(newCust);
  return newCust;
}

export async function updateCustomer(id: string, input: Partial<Customer>): Promise<Customer> {
  const idx = DEFAULT_CUSTOMERS.findIndex((c) => c.id === id);
  if (idx !== -1) {
    DEFAULT_CUSTOMERS[idx] = { ...DEFAULT_CUSTOMERS[idx], ...input, updatedAt: new Date().toISOString() };
    return DEFAULT_CUSTOMERS[idx];
  }
  return DEFAULT_CUSTOMERS[0];
}

export async function deleteCustomer(id: string): Promise<void> {
  const idx = DEFAULT_CUSTOMERS.findIndex((c) => c.id === id);
  if (idx !== -1) {
    DEFAULT_CUSTOMERS.splice(idx, 1);
  }
}

export async function fetchCustomerTransactions(id: string): Promise<PaginatedTransactions> {
  return {
    data: [
      {
        id: 'tx_01',
        customerId: id,
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
