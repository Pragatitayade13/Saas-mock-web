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

const DEFAULT_ORGANIZATION: Organization = {
  id: 'org_nexora_01',
  name: 'Nexora Inc',
  slug: 'nexora-global',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
  email: 'admin@nexorasaas.demo',
  phone: '+91 98765 43210',
  website: 'https://nexorasaas.demo',
  industry: 'Enterprise SaaS & Cloud Analytics',
  timezone: 'Asia/Kolkata (IST)',
  currency: 'INR (₹)',
  country: 'India',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-08-09T10:00:00Z',
};

export async function fetchOrganization(): Promise<Organization> {
  try {
    const res = await apiClient.get<APIResponse<Organization>>('/api/organization');
    if (res.success && res.data) {
      return res.data;
    }
  } catch {
    // Seamless fallback to in-memory demo data when Vercel static deployment or offline
  }
  return DEFAULT_ORGANIZATION;
}

export async function updateOrganization(input: Partial<Organization>): Promise<Organization> {
  try {
    const res = await apiClient.put<APIResponse<Organization>>('/api/organization', input);
    if (res.success && res.data) {
      return res.data;
    }
  } catch {}

  Object.assign(DEFAULT_ORGANIZATION, input, { updatedAt: new Date().toISOString() });
  return DEFAULT_ORGANIZATION;
}
