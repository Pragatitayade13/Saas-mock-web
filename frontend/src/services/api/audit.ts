import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export type AuditResult = 'Success' | 'Failed' | 'Denied';

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  result: AuditResult;
  reason?: string;
  metadata?: Record<string, string>;
  ipAddress: string;
}

export interface AuditSummary {
  totalEventsToday: number;
  successCount: number;
  deniedCount: number;
  failedCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedAuditLogs {
  data: AuditLogItem[];
  meta: PaginationMeta;
}

export interface AuditQueryParams {
  search?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  result?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function toCleanParams(params?: AuditQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const clean: Record<string, string> = {};
  if (params.search) clean.search = params.search;
  if (params.action && params.action !== 'all') clean.action = params.action;
  if (params.entityType && params.entityType !== 'all') clean.entityType = params.entityType;
  if (params.actorId) clean.actorId = params.actorId;
  if (params.result && params.result !== 'all') clean.result = params.result;
  if (params.page) clean.page = params.page.toString();
  if (params.limit) clean.limit = params.limit.toString();
  if (params.sortBy) clean.sortBy = params.sortBy;
  if (params.sortOrder) clean.sortOrder = params.sortOrder;
  return clean;
}

export async function fetchAuditLogs(params?: AuditQueryParams): Promise<PaginatedAuditLogs> {
  const res = await apiClient.get<APIResponse<AuditLogItem[]> & { meta?: PaginationMeta }>('/api/audit', { params: toCleanParams(params) });
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchAuditLogById(id: string): Promise<AuditLogItem> {
  const res = await apiClient.get<APIResponse<AuditLogItem>>(`/api/audit/${id}`);
  if (!res.data) throw new Error('Audit log record not found');
  return res.data;
}

export async function fetchAuditSummary(): Promise<AuditSummary> {
  const res = await apiClient.get<APIResponse<AuditSummary>>('/api/audit/summary');
  return res.data || { totalEventsToday: 0, successCount: 0, deniedCount: 0, failedCount: 0 };
}
