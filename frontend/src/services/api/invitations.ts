import { apiClient } from './client';
import { APIResponse, UserRole } from '../../types/api';

export type InvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Revoked';

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedInvitations {
  data: Invitation[];
  meta: PaginationMeta;
}

export async function fetchInvitations(): Promise<PaginatedInvitations> {
  const res = await apiClient.get<APIResponse<Invitation[]> & { meta?: PaginationMeta }>('/api/team/invitations');
  return {
    data: res.data || [],
    meta: res.meta || { page: 1, limit: 20, total: (res.data || []).length, totalPages: 1 },
  };
}

export async function createInvitation(input: {
  name: string;
  email: string;
  role: UserRole;
}): Promise<Invitation> {
  const res = await apiClient.post<APIResponse<Invitation>>('/api/team/invitations', input);
  if (!res.data) throw new Error('Failed to create invitation');
  return res.data;
}

export async function revokeInvitation(id: string): Promise<Invitation> {
  const res = await apiClient.post<APIResponse<Invitation>>(`/api/team/invitations/${id}/revoke`);
  if (!res.data) throw new Error('Failed to revoke invitation');
  return res.data;
}

export async function resendInvitation(id: string): Promise<Invitation> {
  const res = await apiClient.post<APIResponse<Invitation>>(`/api/team/invitations/${id}/resend`);
  if (!res.data) throw new Error('Failed to resend invitation');
  return res.data;
}

export async function fetchInvitationByToken(token: string): Promise<Invitation> {
  const response = await fetch(`/api/team/invitations/token/${token}`);
  const json = await response.json();
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Invalid or expired invitation token');
  return json.data;
}

export async function acceptInvitation(token: string): Promise<void> {
  const response = await fetch(`/api/team/invitations/token/${token}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to accept invitation');
}
