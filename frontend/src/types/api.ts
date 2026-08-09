export interface HealthResponse {
  success: boolean;
  status: string;
  service: string;
}

export interface ApiInfoResponse {
  success: boolean;
  service: string;
  version: string;
  environment: string;
}

export interface APIErrorDetails {
  code: string;
  message: string;
}

export interface APIErrorResponse {
  success: false;
  error: APIErrorDetails;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export type ApiConnectionState = 'checking' | 'connected' | 'offline';

export type UserRole = 'Administrator' | 'Manager' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Invited' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUserData {
  user: User;
}

export interface LoginResponseData {
  user: User;
}

