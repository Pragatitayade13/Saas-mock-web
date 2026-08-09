import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export interface SessionItem {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  isCurrent: boolean;
  createdAt: string;
  expiresAt: string;
}

export async function fetchActiveSessions(): Promise<SessionItem[]> {
  const res = await apiClient.get<APIResponse<SessionItem[]>>('/api/security/sessions');
  return res.data || [];
}

export async function revokeOtherSessions(): Promise<void> {
  await apiClient.post('/api/security/sessions/revoke-others');
}
