import { useCallback, useEffect, useState } from 'react';
import { securityApi } from '../api/securityApi';
import type { SecurityAnalysisService } from '../services/contracts';
import type { HealthStatus } from '../types/securityApi';

export function useEdgeHealth(service: SecurityAnalysisService = securityApi) {
  const [data, setData] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await service.health());
    } catch (caught) {
      setData(null);
      setError(caught instanceof Error ? caught.message : '서버 상태를 확인할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { data, isLoading, error, refresh, isDegraded: !data || data.status !== 'ok' };
}
