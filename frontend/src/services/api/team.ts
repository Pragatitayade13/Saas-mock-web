import { apiClient } from './client';
import { APIResponse, UserRole, UserStatus } from '../../types/api';

export interface TeamMember {
  id: string;
  organizationId?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTeam {
  data: TeamMember[];
  meta: PaginationMeta;
}

export interface TeamQueryParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

function toCleanParams(params?: TeamQueryParams): Record<string, string> | undefined {
  if (!params) return undefined;
  const clean: Record<string, string> = {};
  if (params.search) clean.search = params.search;
  if (params.role && params.role !== 'all') clean.role = params.role;
  if (params.status && params.status !== 'all') clean.status = params.status;
  if (params.page) clean.page = params.page.toString();
  if (params.limit) clean.limit = params.limit.toString();
  return clean;
}

export async function fetchTeamMembers(params?: TeamQueryParams): Promise<PaginatedTeam> {
  const res = await apiClient.get<APIResponse<TeamMember[]> & { meta?: PaginationMeta }>('/api/team', { params: toCleanParams(params) });
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function fetchTeamMemberById(id: string): Promise<TeamMember> {
  const res = await apiClient.get<APIResponse<TeamMember>>(`/api/team/${id}`);
  if (!res.data) throw new Error('Team member not found');
  return res.data;
}

export async function updateTeamMemberRole(id: string, role: UserRole): Promise<TeamMember> {
  const res = await apiClient.patch<APIResponse<TeamMember>>(`/api/team/${id}/role`, { role });
  if (!res.data) throw new Error('Failed to update role');
  return res.data;
}

export async function updateTeamMemberStatus(id: string, status: UserStatus): Promise<TeamMember> {
  const res = await apiClient.patch<APIResponse<TeamMember>>(`/api/team/${id}/status`, { status });
  if (!res.data) throw new Error('Failed to update status');
  return res.data;
}
