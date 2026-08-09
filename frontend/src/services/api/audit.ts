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

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'adt_01',
    actorId: 'usr_admin_01',
    actorName: 'Alex Rivera (Admin)',
    action: 'Customer Created',
    entityType: 'Customer',
    entityId: 'cust_01',
    entityName: 'Acme Corp',
    timestamp: '2026-08-08T14:30:00Z',
    result: 'Success',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'adt_02',
    actorId: 'usr_manager_01',
    actorName: 'Sarah Chen (Manager)',
    action: 'Report Created',
    entityType: 'Report',
    entityId: 'rpt_02',
    entityName: 'Customer Cohort Report',
    timestamp: '2026-08-07T11:20:00Z',
    result: 'Success',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'adt_03',
    actorId: 'usr_viewer_01',
    actorName: 'Marcus Vance (Viewer)',
    action: 'Settings Write Action',
    entityType: 'Settings',
    entityId: 'cfg_global',
    entityName: 'Security Policy',
    timestamp: '2026-08-06T15:10:00Z',
    result: 'Denied',
    reason: 'RBAC Permission Denied: Viewers cannot mutate system configuration.',
    ipAddress: '192.168.1.112',
  },
  {
    id: 'adt_04',
    actorId: 'usr_admin_01',
    actorName: 'Alex Rivera (Admin)',
    action: 'Report Deleted',
    entityType: 'Report',
    entityId: 'rpt_05',
    entityName: 'Legacy Audit Log',
    timestamp: '2026-08-05T09:45:00Z',
    result: 'Success',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'adt_05',
    actorId: 'usr_manager_01',
    actorName: 'Sarah Chen (Manager)',
    action: 'Customer Updated',
    entityType: 'Customer',
    entityId: 'cust_05',
    entityName: 'Vortex Dynamics',
    timestamp: '2026-08-04T16:00:00Z',
    result: 'Failed',
    reason: 'Validation Failure: Invalid phone number schema.',
    ipAddress: '192.168.1.104',
  },
];

export async function fetchAuditLogs(params?: AuditQueryParams): Promise<PaginatedAuditLogs> {
  try {
    const clean: Record<string, string> = {};
    if (params?.search) clean.search = params.search;
    if (params?.action && params.action !== 'all') clean.action = params.action;
    if (params?.entityType && params.entityType !== 'all') clean.entityType = params.entityType;
    if (params?.result && params.result !== 'all') clean.result = params.result;
    if (params?.page) clean.page = params.page.toString();
    if (params?.limit) clean.limit = params.limit.toString();

    const res = await apiClient.get<APIResponse<AuditLogItem[]> & { meta?: PaginationMeta }>('/api/audit', { params: clean });
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {}

  let list = [...DEFAULT_AUDIT_LOGS];

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.actorName.toLowerCase().includes(q) ||
        (a.entityName || '').toLowerCase().includes(q) ||
        a.entityType.toLowerCase().includes(q) ||
        a.result.toLowerCase().includes(q)
    );
  }

  if (params?.action && params.action !== 'all') {
    list = list.filter((a) => a.action.toLowerCase() === params.action?.toLowerCase());
  }

  if (params?.result && params.result !== 'all') {
    list = list.filter((a) => a.result.toLowerCase() === params.result?.toLowerCase());
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

export async function fetchAuditLogById(id: string): Promise<AuditLogItem> {
  try {
    const res = await apiClient.get<APIResponse<AuditLogItem>>(`/api/audit/${id}`);
    if (res.data) return res.data;
  } catch {}
  return DEFAULT_AUDIT_LOGS.find((a) => a.id === id) || DEFAULT_AUDIT_LOGS[0];
}

export async function fetchAuditSummary(): Promise<AuditSummary> {
  return {
    totalEventsToday: DEFAULT_AUDIT_LOGS.length,
    successCount: DEFAULT_AUDIT_LOGS.filter((a) => a.result === 'Success').length,
    deniedCount: DEFAULT_AUDIT_LOGS.filter((a) => a.result === 'Denied').length,
    failedCount: DEFAULT_AUDIT_LOGS.filter((a) => a.result === 'Failed').length,
  };
}
