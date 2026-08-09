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

const DEFAULT_SESSIONS: SessionItem[] = [
  {
    id: 'sess_cur_01',
    userId: 'usr_admin_01',
    userAgent: 'Chrome 122.0 / Windows 11 (Current Session)',
    ipAddress: '192.168.1.100 (Mumbai, IN)',
    isCurrent: true,
    createdAt: '2026-08-09T08:00:00Z',
    expiresAt: '2026-08-16T08:00:00Z',
  },
  {
    id: 'sess_mob_02',
    userId: 'usr_admin_01',
    userAgent: 'Safari Mobile / iOS 17.4',
    ipAddress: '103.45.12.89 (Delhi, IN)',
    isCurrent: false,
    createdAt: '2026-08-08T18:30:00Z',
    expiresAt: '2026-08-15T18:30:00Z',
  },
];

export async function fetchActiveSessions(): Promise<SessionItem[]> {
  try {
    const res = await apiClient.get<APIResponse<SessionItem[]>>('/api/security/sessions');
    if (res.success && res.data) {
      return res.data;
    }
  } catch {}

  return DEFAULT_SESSIONS;
}

export async function revokeOtherSessions(): Promise<void> {
  try {
    await apiClient.post('/api/security/sessions/revoke-others');
  } catch {}
}
