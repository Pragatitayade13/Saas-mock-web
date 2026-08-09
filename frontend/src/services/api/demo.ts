import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export interface StateCounts {
  customers: number;
  subscriptions: number;
  transactions: number;
  notifications: number;
  users: number;
}

export async function resetDemoStore(): Promise<StateCounts> {
  const res = await apiClient.post<APIResponse<StateCounts>>('/api/demo/reset');
  if (!res.data) throw new Error('Failed to reset demo state');
  return res.data;
}

export async function fetchDemoState(): Promise<StateCounts> {
  const res = await apiClient.get<APIResponse<StateCounts>>('/api/demo/state');
  if (!res.data) throw new Error('Failed to fetch demo state');
  return res.data;
}
