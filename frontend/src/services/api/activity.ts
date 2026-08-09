import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export type ActivitySeverity = 'Info' | 'Success' | 'Warning' | 'Critical';

export interface ActivityItem {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
  severity: ActivitySeverity;
}

export interface ActivitySummary {
  totalToday: number;
  successfulCount: number;
  warningCount: number;
  criticalCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedActivities {
  data: ActivityItem[];
  meta: PaginationMeta;
}

export interface ActivityQueryParams {
  search?: string;
  action?: string;
  entityType?: string;
  customerId?: string;
  subscriptionId?: string;
  actorId?: string;
  severity?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function toCleanParams(params?: ActivityQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const clean: Record<string, string> = {};
  if (params.search) clean.search = params.search;
  if (params.action && params.action !== 'all') clean.action = params.action;
  if (params.entityType && params.entityType !== 'all') clean.entityType = params.entityType;
  if (params.customerId) clean.customerId = params.customerId;
  if (params.subscriptionId) clean.subscriptionId = params.subscriptionId;
  if (params.actorId) clean.actorId = params.actorId;
  if (params.severity && params.severity !== 'all') clean.severity = params.severity;
  if (params.page) clean.page = params.page.toString();
  if (params.limit) clean.limit = params.limit.toString();
  if (params.sortBy) clean.sortBy = params.sortBy;
  if (params.sortOrder) clean.sortOrder = params.sortOrder;
  return clean;
}

export async function fetchActivities(params?: ActivityQueryParams): Promise<PaginatedActivities> {
  const res = await apiClient.get<APIResponse<ActivityItem[]> & { meta?: PaginationMeta }>('/api/activity', { params: toCleanParams(params) });
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchActivityById(id: string): Promise<ActivityItem> {
  const res = await apiClient.get<APIResponse<ActivityItem>>(`/api/activity/${id}`);
  if (!res.data) throw new Error('Activity record not found');
  return res.data;
}

export async function fetchActivitySummary(): Promise<ActivitySummary> {
  const res = await apiClient.get<APIResponse<ActivitySummary>>('/api/activity/summary');
  return res.data || { totalToday: 0, successfulCount: 0, warningCount: 0, criticalCount: 0 };
}
