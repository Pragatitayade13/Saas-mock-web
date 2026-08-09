import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export type ReportType = 'Revenue' | 'Customer' | 'Subscription' | 'Transaction' | 'Analytics' | 'Activity';
export type ReportStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: string;
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  parameters?: Record<string, string>;
  recordCount: number;
}

export interface ReportSummary {
  totalGenerated: number;
  completedCount: number;
  failedCount: number;
  thisMonthCount: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedReports {
  data: Report[];
  meta: PaginationMeta;
}

export interface ReportQueryParams {
  search?: string;
  type?: string;
  status?: string;
  actorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function toCleanParams(params?: ReportQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const clean: Record<string, string> = {};
  if (params.search) clean.search = params.search;
  if (params.type && params.type !== 'all') clean.type = params.type;
  if (params.status && params.status !== 'all') clean.status = params.status;
  if (params.actorId) clean.actorId = params.actorId;
  if (params.page) clean.page = params.page.toString();
  if (params.limit) clean.limit = params.limit.toString();
  if (params.sortBy) clean.sortBy = params.sortBy;
  if (params.sortOrder) clean.sortOrder = params.sortOrder;
  return clean;
}

export async function fetchReports(params?: ReportQueryParams): Promise<PaginatedReports> {
  const res = await apiClient.get<APIResponse<Report[]> & { meta?: PaginationMeta }>('/api/reports', { params: toCleanParams(params) });
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchReportById(id: string): Promise<Report> {
  const res = await apiClient.get<APIResponse<Report>>(`/api/reports/${id}`);
  if (!res.data) throw new Error('Report not found');
  return res.data;
}

export async function createReport(input: {
  name?: string;
  type: ReportType;
  format?: string;
  parameters?: Record<string, string>;
}): Promise<Report> {
  const res = await apiClient.post<APIResponse<Report>>('/api/reports', input);
  if (!res.data) throw new Error('Failed to create report');
  return res.data;
}

export async function deleteReport(id: string): Promise<void> {
  await apiClient.delete(`/api/reports/${id}`);
}

export async function downloadReportCSV(id: string): Promise<Blob> {
  const response = await fetch(`/api/reports/${id}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  });
  return response.blob();
}

export async function fetchReportSummary(): Promise<ReportSummary> {
  const res = await apiClient.get<APIResponse<ReportSummary>>('/api/reports/summary');
  return res.data || { totalGenerated: 0, completedCount: 0, failedCount: 0, thisMonthCount: 0 };
}
