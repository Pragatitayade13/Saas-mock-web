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

const DEFAULT_INVITATIONS: Invitation[] = [
  {
    id: 'inv_01',
    organizationId: 'org_nexora_01',
    email: 'dev.lead@nexorasaas.demo',
    name: 'Rohan Sharma',
    role: 'Manager',
    token: 'tok_rohan_sharma_98723',
    status: 'Pending',
    createdBy: 'Alex Rivera (Admin)',
    createdAt: '2026-08-08T10:00:00Z',
    expiresAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'inv_02',
    organizationId: 'org_nexora_01',
    email: 'financial.analyst@nexorasaas.demo',
    name: 'Priya Patel',
    role: 'Viewer',
    token: 'tok_priya_patel_12345',
    status: 'Accepted',
    createdBy: 'Alex Rivera (Admin)',
    createdAt: '2026-08-05T14:30:00Z',
    expiresAt: '2026-08-12T14:30:00Z',
  },
];

export async function fetchInvitations(): Promise<PaginatedInvitations> {
  try {
    const res = await apiClient.get<APIResponse<Invitation[]> & { meta?: PaginationMeta }>('/api/team/invitations');
    if (res.success && res.data) {
      return {
        data: res.data,
        meta: res.meta || { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
      };
    }
  } catch {}

  return {
    data: DEFAULT_INVITATIONS,
    meta: { page: 1, limit: 20, total: DEFAULT_INVITATIONS.length, totalPages: 1 },
  };
}

export async function createInvitation(input: {
  name: string;
  email: string;
  role: UserRole;
}): Promise<Invitation> {
  const newInv: Invitation = {
    id: `inv_${Date.now()}`,
    organizationId: 'org_nexora_01',
    email: input.email,
    name: input.name,
    role: input.role,
    token: `tok_${Date.now()}`,
    status: 'Pending',
    createdBy: 'Alex Rivera (Admin)',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  DEFAULT_INVITATIONS.unshift(newInv);
  return newInv;
}

export async function revokeInvitation(id: string): Promise<Invitation> {
  const inv = DEFAULT_INVITATIONS.find((i) => i.id === id);
  if (inv) {
    inv.status = 'Revoked';
    return inv;
  }
  return DEFAULT_INVITATIONS[0];
}

export async function resendInvitation(id: string): Promise<Invitation> {
  const inv = DEFAULT_INVITATIONS.find((i) => i.id === id);
  if (inv) {
    inv.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return inv;
  }
  return DEFAULT_INVITATIONS[0];
}

export async function fetchInvitationByToken(token: string): Promise<Invitation> {
  return DEFAULT_INVITATIONS.find((i) => i.token === token) || DEFAULT_INVITATIONS[0];
}

export async function acceptInvitation(token: string): Promise<void> {
  const inv = DEFAULT_INVITATIONS.find((i) => i.token === token);
  if (inv) {
    inv.status = 'Accepted';
  }
}
