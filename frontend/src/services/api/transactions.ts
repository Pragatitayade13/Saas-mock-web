import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';
export type TransactionType = 'Subscription' | 'Upgrade' | 'Downgrade' | 'Refund' | 'Credit' | 'Adjustment';
export type PaymentMethod = 'Card' | 'UPI' | 'Bank Transfer' | 'Demo Payment';

export interface Transaction {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  paymentMethod: PaymentMethod | string;
  description?: string;
  transactionDate: string;
  originalTransactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionSummary {
  totalRevenue: number;
  successfulTransactions: number;
  pendingAmount: number;
  refundedAmount: number;
}

export interface RevenueTimePoint {
  date: string;
  revenue: number;
}

export interface RevenuePlanPoint {
  plan: string;
  revenue: number;
}

export interface RevenueMethodPoint {
  paymentMethod: string;
  revenue: number;
}

export interface RevenueAnalytics {
  daily: RevenueTimePoint[];
  monthly: RevenueTimePoint[];
  byPlan: RevenuePlanPoint[];
  byPaymentMethod: RevenueMethodPoint[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: PaginationMeta;
}

export interface TransactionQueryParams {
  search?: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  type?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchTransactions(params?: TransactionQueryParams): Promise<PaginatedTransactions> {
  const queryParams: Record<string, string> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.subscriptionId) queryParams.subscriptionId = params.subscriptionId;
  if (params?.status && params.status !== 'all') queryParams.status = params.status;
  if (params?.type && params.type !== 'all') queryParams.type = params.type;
  if (params?.paymentMethod && params.paymentMethod !== 'all') queryParams.paymentMethod = params.paymentMethod;
  if (params?.minAmount) queryParams.minAmount = params.minAmount.toString();
  if (params?.maxAmount) queryParams.maxAmount = params.maxAmount.toString();
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const res = await apiClient.get<APIResponse<Transaction[]> & { meta?: PaginationMeta }>('/api/transactions', { params: queryParams });
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  const res = await apiClient.get<APIResponse<Transaction>>(`/api/transactions/${id}`);
  if (!res.data) throw new Error('Transaction not found');
  return res.data;
}

export async function createTransaction(input: {
  customerId: string;
  subscriptionId?: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod | string;
  status?: TransactionStatus;
  description?: string;
  transactionDate?: string;
}): Promise<Transaction> {
  const res = await apiClient.post<APIResponse<Transaction>>('/api/transactions', input);
  if (!res.data) throw new Error('Failed to create transaction');
  return res.data;
}

export async function refundTransaction(id: string): Promise<Transaction> {
  const res = await apiClient.post<APIResponse<Transaction>>(`/api/transactions/${id}/refund`);
  if (!res.data) throw new Error('Failed to refund transaction');
  return res.data;
}

export async function fetchTransactionSummary(): Promise<TransactionSummary> {
  const res = await apiClient.get<APIResponse<TransactionSummary>>('/api/transactions/summary');
  return res.data || { totalRevenue: 0, successfulTransactions: 0, pendingAmount: 0, refundedAmount: 0 };
}

export async function fetchRevenueAnalytics(range: string = '30d'): Promise<RevenueAnalytics> {
  const res = await apiClient.get<APIResponse<RevenueAnalytics>>('/api/revenue/analytics', { params: { range } });
  return res.data || { daily: [], monthly: [], byPlan: [], byPaymentMethod: [] };
}
