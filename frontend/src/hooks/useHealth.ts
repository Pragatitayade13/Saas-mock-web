import { useState, useEffect, useCallback } from 'react';
import { healthApi } from '../services/api/health';
import { ApiConnectionState, HealthResponse } from '../types/api';

export function useHealth(pollIntervalMs = 10000) {
  const [status, setStatus] = useState<ApiConnectionState>('checking');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const data = await healthApi.getHealth();
      if (data && data.success && data.status === 'ok') {
        setHealthData(data);
        setStatus('connected');
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus('offline');
      setHealthData(null);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, pollIntervalMs]);

  return { status, healthData, refetch: checkHealth };
}
