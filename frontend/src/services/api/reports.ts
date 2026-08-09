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

const DEFAULT_REPORTS: Report[] = [
  {
    id: 'rpt_01',
    name: 'Q3 ARR & Financial Velocity Statement',
    type: 'Revenue',
    format: 'CSV',
    status: 'Completed',
    createdBy: 'Alex Rivera (Admin)',
    createdAt: '2026-08-08T10:00:00Z',
    completedAt: '2026-08-08T10:01:00Z',
    recordCount: 1420,
  },
  {
    id: 'rpt_02',
    name: 'Enterprise Customer Cohort Expansion',
    type: 'Customer',
    format: 'CSV',
    status: 'Completed',
    createdBy: 'Sarah Chen (Manager)',
    createdAt: '2026-08-07T14:30:00Z',
    completedAt: '2026-08-07T14:31:00Z',
    recordCount: 450,
  },
  {
    id: 'rpt_03',
    name: 'Subscription Plan Churn & Upgrades Audit',
    type: 'Subscription',
    format: 'CSV',
    status: 'Completed',
    createdBy: 'Alex Rivera (Admin)',
    createdAt: '2026-08-06T09:15:00Z',
    completedAt: '2026-08-06T09:16:00Z',
    recordCount: 890,
  },
  {
    id: 'rpt_04',
    name: 'Failed Transactions & Refund Audit Ledger',
    type: 'Transaction',
    format: 'CSV',
    status: 'Processing',
    createdBy: 'Sarah Chen (Manager)',
    createdAt: '2026-08-05T16:00:00Z',
    recordCount: 120,
  },
  {
    id: 'rpt_05',
    name: 'SOC2 System Security & Access Audit Log',
    type: 'Activity',
    format: 'CSV',
    status: 'Failed',
    createdBy: 'System Automated',
    createdAt: '2026-08-04T12:00:00Z',
    recordCount: 0,
  },
];

export async function fetchReports(params?: ReportQueryParams): Promise<PaginatedReports> {
  try {
    const clean: Record<string, string> = {};
    if (params?.search) clean.search = params.search;
    if (params?.type && params.type !== 'all') clean.type = params.type;
    if (params?.status && params.status !== 'all') clean.status = params.status;
    if (params?.page) clean.page = params.page.toString();
    if (params?.limit) clean.limit = params.limit.toString();

    const res = await apiClient.get<APIResponse<Report[]> & { meta?: PaginationMeta }>('/api/reports', { params: clean });
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {}

  let list = [...DEFAULT_REPORTS];

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }

  if (params?.type && params.type !== 'all') {
    list = list.filter((r) => r.type.toLowerCase() === params.type?.toLowerCase());
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((r) => r.status.toLowerCase() === params.status?.toLowerCase());
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

export async function fetchReportById(id: string): Promise<Report> {
  try {
    const res = await apiClient.get<APIResponse<Report>>(`/api/reports/${id}`);
    if (res.data) return res.data;
  } catch {}
  return DEFAULT_REPORTS.find((r) => r.id === id) || DEFAULT_REPORTS[0];
}

export async function createReport(input: {
  name?: string;
  type: ReportType;
  format?: string;
  parameters?: Record<string, string>;
}): Promise<Report> {
  const newReport: Report = {
    id: `rpt_${Date.now()}`,
    name: input.name || `${input.type} Executive Summary`,
    type: input.type,
    format: input.format || 'CSV',
    status: 'Completed',
    createdBy: 'Alex Rivera (Admin)',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    recordCount: 350,
  };
  DEFAULT_REPORTS.unshift(newReport);
  return newReport;
}

export async function deleteReport(id: string): Promise<void> {
  const idx = DEFAULT_REPORTS.findIndex((r) => r.id === id);
  if (idx !== -1) {
    DEFAULT_REPORTS.splice(idx, 1);
  }
}

export async function downloadReportCSV(id: string): Promise<Blob> {
  const report = DEFAULT_REPORTS.find((r) => r.id === id) || DEFAULT_REPORTS[0];
  const content = `ID,Name,Type,Status,RecordCount,CreatedAt\n"${report.id}","${report.name}","${report.type}","${report.status}","${report.recordCount}","${report.createdAt}"`;
  return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}

export async function fetchReportSummary(): Promise<ReportSummary> {
  return {
    totalGenerated: DEFAULT_REPORTS.length,
    completedCount: DEFAULT_REPORTS.filter((r) => r.status === 'Completed').length,
    failedCount: DEFAULT_REPORTS.filter((r) => r.status === 'Failed').length,
    thisMonthCount: DEFAULT_REPORTS.length,
  };
}
