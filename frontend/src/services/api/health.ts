import { apiClient } from './client';
import { HealthResponse, ApiInfoResponse } from '../../types/api';

export const healthApi = {
  getHealth: () => apiClient.get<HealthResponse>('/health'),
  getApiInfo: () => apiClient.get<ApiInfoResponse>('/api'),
};
