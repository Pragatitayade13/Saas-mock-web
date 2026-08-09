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

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'usr_admin_01',
    organizationId: 'org_nexora_01',
    name: 'Alex Rivera',
    email: 'admin@nexorasaas.demo',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'Active',
    lastActiveAt: 'Just now',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-09T10:00:00Z',
  },
  {
    id: 'usr_manager_01',
    organizationId: 'org_nexora_01',
    name: 'Sarah Chen',
    email: 'sarah.chen@nexorasaas.demo',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    status: 'Active',
    lastActiveAt: '2 hours ago',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-08-08T14:00:00Z',
  },
  {
    id: 'usr_viewer_01',
    organizationId: 'org_nexora_01',
    name: 'Marcus Vance',
    email: 'marcus.vance@nexorasaas.demo',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Active',
    lastActiveAt: '1 day ago',
    createdAt: '2026-04-10T12:00:00Z',
    updatedAt: '2026-08-07T09:00:00Z',
  },
];

export async function fetchTeamMembers(params?: TeamQueryParams): Promise<PaginatedTeam> {
  try {
    const clean: Record<string, string> = {};
    if (params?.search) clean.search = params.search;
    if (params?.role && params.role !== 'all') clean.role = params.role;
    if (params?.status && params.status !== 'all') clean.status = params.status;

    const res = await apiClient.get<APIResponse<TeamMember[]> & { meta?: PaginationMeta }>('/api/team', { params: clean });
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {}

  let list = [...DEFAULT_TEAM];

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }

  if (params?.role && params.role !== 'all') {
    list = list.filter((m) => m.role.toLowerCase() === params.role?.toLowerCase());
  }

  return {
    data: list,
    meta: {
      page: params?.page || 1,
      limit: params?.limit || 20,
      total: list.length,
      totalPages: 1,
    },
  };
}

export async function fetchTeamMemberById(id: string): Promise<TeamMember> {
  try {
    const res = await apiClient.get<APIResponse<TeamMember>>(`/api/team/${id}`);
    if (res.data) return res.data;
  } catch {}
  return DEFAULT_TEAM.find((m) => m.id === id) || DEFAULT_TEAM[0];
}

export async function updateTeamMemberRole(id: string, role: UserRole): Promise<TeamMember> {
  const member = DEFAULT_TEAM.find((m) => m.id === id);
  if (member) {
    member.role = role;
    return member;
  }
  return DEFAULT_TEAM[0];
}

export async function updateTeamMemberStatus(id: string, status: UserStatus): Promise<TeamMember> {
  const member = DEFAULT_TEAM.find((m) => m.id === id);
  if (member) {
    member.status = status;
    return member;
  }
  return DEFAULT_TEAM[0];
}
