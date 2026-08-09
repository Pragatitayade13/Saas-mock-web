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

export async function fetchCustomers(params?: CustomerQueryParams): Promise<PaginatedCustomers> {
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
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const res = await apiClient.get<APIResponse<Customer>>(`/api/customers/${id}`);
  if (!res.data) throw new Error('Customer not found');
  return res.data;
}

export async function createCustomer(input: Partial<Customer>): Promise<Customer> {
  const res = await apiClient.post<APIResponse<Customer>>('/api/customers', input);
  if (!res.data) throw new Error('Failed to create customer');
  return res.data;
}

export async function updateCustomer(id: string, input: Partial<Customer>): Promise<Customer> {
  const res = await apiClient.put<APIResponse<Customer>>(`/api/customers/${id}`, input);
  if (!res.data) throw new Error('Failed to update customer');
  return res.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/api/customers/${id}`);
}

export async function fetchCustomerTransactions(id: string): Promise<PaginatedTransactions> {
  const res = await apiClient.get<APIResponse<CustomerTransaction[]> & { meta?: PaginationMeta }>(`/api/customers/${id}/transactions`);
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}
