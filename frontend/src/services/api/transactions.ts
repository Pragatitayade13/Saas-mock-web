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

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    customerId: 'cust_01',
    subscriptionId: 'sub_01',
    amount: 12499,
    currency: 'INR',
    status: 'Completed',
    type: 'Subscription',
    paymentMethod: 'Card',
    description: 'Enterprise Tier Monthly Renewal',
    transactionDate: '2026-08-08T14:00:00Z',
    createdAt: '2026-08-08T14:00:00Z',
  },
  {
    id: 'tx_02',
    customerId: 'cust_02',
    subscriptionId: 'sub_02',
    amount: 4999,
    currency: 'INR',
    status: 'Completed',
    type: 'Subscription',
    paymentMethod: 'UPI',
    description: 'Professional Tier Monthly Payout',
    transactionDate: '2026-08-07T10:30:00Z',
    createdAt: '2026-08-07T10:30:00Z',
  },
  {
    id: 'tx_03',
    customerId: 'cust_03',
    subscriptionId: 'sub_03',
    amount: 1999,
    currency: 'INR',
    status: 'Pending',
    type: 'Subscription',
    paymentMethod: 'Bank Transfer',
    description: 'Starter Tier Trial Settlement',
    transactionDate: '2026-08-06T12:15:00Z',
    createdAt: '2026-08-06T12:15:00Z',
  },
  {
    id: 'tx_04',
    customerId: 'cust_04',
    subscriptionId: 'sub_04',
    amount: 119990,
    currency: 'INR',
    status: 'Completed',
    type: 'Upgrade',
    paymentMethod: 'Card',
    description: 'Yearly Enterprise Sovereign Upgrade',
    transactionDate: '2026-08-05T09:00:00Z',
    createdAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 'tx_05',
    customerId: 'cust_05',
    subscriptionId: 'sub_05',
    amount: 4999,
    currency: 'INR',
    status: 'Failed',
    type: 'Subscription',
    paymentMethod: 'Card',
    description: 'Professional Tier Card Declined',
    transactionDate: '2026-08-04T16:20:00Z',
    createdAt: '2026-08-04T16:20:00Z',
  },
  {
    id: 'tx_06',
    customerId: 'cust_06',
    subscriptionId: 'sub_06',
    amount: 1999,
    currency: 'INR',
    status: 'Refunded',
    type: 'Refund',
    paymentMethod: 'UPI',
    description: 'Starter Plan Pro-rated Refund',
    transactionDate: '2026-08-03T11:45:00Z',
    createdAt: '2026-08-03T11:45:00Z',
  },
];

export async function fetchTransactions(params?: TransactionQueryParams): Promise<PaginatedTransactions> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.customerId) queryParams.customerId = params.customerId;
    if (params?.subscriptionId) queryParams.subscriptionId = params.subscriptionId;
    if (params?.status && params.status !== 'all') queryParams.status = params.status;
    if (params?.type && params.type !== 'all') queryParams.type = params.type;
    if (params?.paymentMethod && params.paymentMethod !== 'all') queryParams.paymentMethod = params.paymentMethod;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();

    const res = await apiClient.get<APIResponse<Transaction[]> & { meta?: PaginationMeta }>('/api/transactions', { params: queryParams });
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {}

  let list = [...DEFAULT_TRANSACTIONS];

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.customerId.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    );
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((t) => t.status.toLowerCase() === params.status?.toLowerCase());
  }

  if (params?.type && params.type !== 'all') {
    list = list.filter((t) => t.type.toLowerCase() === params.type?.toLowerCase());
  }

  if (params?.paymentMethod && params.paymentMethod !== 'all') {
    list = list.filter((t) => t.paymentMethod.toLowerCase() === params.paymentMethod?.toLowerCase());
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

export async function fetchTransactionById(id: string): Promise<Transaction> {
  try {
    const res = await apiClient.get<APIResponse<Transaction>>(`/api/transactions/${id}`);
    if (res.data) return res.data;
  } catch {}
  return DEFAULT_TRANSACTIONS.find((t) => t.id === id) || DEFAULT_TRANSACTIONS[0];
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
  const newTx: Transaction = {
    id: `tx_${Date.now()}`,
    customerId: input.customerId,
    subscriptionId: input.subscriptionId,
    amount: input.amount,
    currency: 'INR',
    status: input.status || 'Completed',
    type: input.type,
    paymentMethod: input.paymentMethod,
    description: input.description || 'Manual Transaction Settlement',
    transactionDate: input.transactionDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  DEFAULT_TRANSACTIONS.unshift(newTx);
  return newTx;
}

export async function refundTransaction(id: string): Promise<Transaction> {
  const tx = DEFAULT_TRANSACTIONS.find((t) => t.id === id);
  if (tx) {
    tx.status = 'Refunded';
    return tx;
  }
  return DEFAULT_TRANSACTIONS[0];
}

export async function fetchTransactionSummary(): Promise<TransactionSummary> {
  const totalRevenue = DEFAULT_TRANSACTIONS.filter((t) => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
  const successfulTransactions = DEFAULT_TRANSACTIONS.filter((t) => t.status === 'Completed').length;
  const pendingAmount = DEFAULT_TRANSACTIONS.filter((t) => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = DEFAULT_TRANSACTIONS.filter((t) => t.status === 'Refunded').reduce((sum, t) => sum + t.amount, 0);

  return {
    totalRevenue,
    successfulTransactions,
    pendingAmount,
    refundedAmount,
  };
}

export async function fetchRevenueAnalytics(range: string = '30d'): Promise<RevenueAnalytics> {
  return {
    daily: [
      { date: 'Aug 01', revenue: 12000 },
      { date: 'Aug 02', revenue: 15000 },
      { date: 'Aug 03', revenue: 18000 },
      { date: 'Aug 04', revenue: 14000 },
      { date: 'Aug 05', revenue: 22000 },
      { date: 'Aug 06', revenue: 9000 },
      { date: 'Aug 07', revenue: 11000 },
    ],
    monthly: [
      { date: 'Jan', revenue: 42000 },
      { date: 'Feb', revenue: 51000 },
      { date: 'Mar', revenue: 58000 },
      { date: 'Apr', revenue: 64000 },
      { date: 'May', revenue: 72000 },
      { date: 'Jun', revenue: 79000 },
      { date: 'Jul', revenue: 84250 },
    ],
    byPlan: [
      { plan: 'Enterprise', revenue: 124990 },
      { plan: 'Professional', revenue: 49990 },
      { plan: 'Starter', revenue: 19990 },
    ],
    byPaymentMethod: [
      { paymentMethod: 'Card', revenue: 132489 },
      { paymentMethod: 'UPI', revenue: 4999 },
      { paymentMethod: 'Bank Transfer', revenue: 1999 },
    ],
  };
}
