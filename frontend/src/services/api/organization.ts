import { apiClient } from './client';
import { APIResponse } from '../../types/api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  timezone: string;
  currency: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchOrganization(): Promise<Organization> {
  const res = await apiClient.get<APIResponse<Organization>>('/api/organization');
  if (!res.data) throw new Error('Failed to fetch organization settings');
  return res.data;
}

export async function updateOrganization(input: Partial<Organization>): Promise<Organization> {
  const res = await apiClient.put<APIResponse<Organization>>('/api/organization', input);
  if (!res.data) throw new Error('Failed to update organization settings');
  return res.data;
}
