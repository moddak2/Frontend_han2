import { useState } from 'react';
import { securityApi } from '../api/securityApi';
import type { AnalyzeRequest, AnalyzeResult } from '../types/securityApi';

const newRequestId = () => crypto.randomUUID();

export function useRiskAnalysis() {
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDegraded, setIsDegraded] = useState(false);

  const analyze = async (input: Omit<AnalyzeRequest, 'request_id' | 'client_timestamp'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await securityApi.analyze({
        ...input, request_id: newRequestId(), client_timestamp: new Date().toISOString(),
      });
      setData(result);
      setIsDegraded(result.analysis_meta.analysis_source === 'local_fallback');
      return result;
    } catch (caught) {
      setData(null);
      setIsDegraded(true);
      setError(caught instanceof Error ? caught.message : '분석 요청에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyze, data, isLoading, error, isDegraded, reset: () => setData(null) };
}
