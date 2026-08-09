import { apiClient } from './client';
import { APIResponse, AuthUserData, User } from '../../types/api';

export async function loginApi(email: string, password: string): Promise<User> {
  const response = await apiClient.post<APIResponse<AuthUserData>>('/api/auth/login', {
    email,
    password,
  });
  if (!response.data?.user) {
    throw new Error('Invalid server response during authentication.');
  }
  return response.data.user;
}

export async function getCurrentUserApi(): Promise<User> {
  const response = await apiClient.get<APIResponse<AuthUserData>>('/api/auth/me');
  if (!response.data?.user) {
    throw new Error('Authentication required.');
  }
  return response.data.user;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post<APIResponse<{ message: string }>>('/api/auth/logout');
}
