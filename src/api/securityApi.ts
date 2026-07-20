import { analyzeLocally } from '../domain/localRiskAnalyzer';
import { env, type AppConfig } from '../config/env';
import { defaultRuntime, type RuntimeAdapter } from '../platform/runtime';
import type { SecurityAnalysisService } from '../services/contracts';
import type { AnalyzeResult, ApplyRulesetResult, HealthStatus, ModelInfo, Ruleset } from '../types/securityApi';
import { ApiError, createApiClient } from './client';

const mockHealth: HealthStatus = {
  status: 'ok',
  model_loaded: true,
  uptime_seconds: 86400,
  server_version: 'mock-1.0.0',
  queue_depth: 0,
};

export function createSecurityApi(
  config: AppConfig = env,
  runtime: RuntimeAdapter = defaultRuntime,
): SecurityAnalysisService {
  const request = createApiClient(config, runtime);

  return {
    async health() {
      if (config.useMocks) {
        await runtime.delay(100);
        return mockHealth;
      }
      return request<HealthStatus>('/health', { timeoutMs: 1000 });
    },

    async analyze(payload) {
      if (config.useMocks) {
        await runtime.delay(150);
        return analyzeLocally(payload, 'edge');
      }
      const call = () => request<AnalyzeResult>('/analyze', {
        method: 'POST',
        body: payload,
        apiKey: config.apiKey,
        timeoutMs: 1400,
        headers: {
          'X-Request-ID': payload.request_id,
          'Accept-Language': payload.options?.language ?? 'ko',
        },
      });
      try {
        return await call();
      } catch (error) {
        if (error instanceof ApiError && error.retryable) {
          try { return await call(); } catch { return analyzeLocally(payload); }
        }
        return analyzeLocally(payload);
      }
    },

    modelInfo() {
      return request<ModelInfo>('/model/info', { apiKey: config.apiKey });
    },

    ruleset() {
      return request<Ruleset>('/ruleset', { apiKey: config.apiKey });
    },

    applyRuleset(ruleset: Pick<Ruleset, 'ruleset_version' | 'rules'>) {
      return request<ApplyRulesetResult>('/ruleset', {
        method: 'PUT', body: ruleset, apiKey: config.adminApiKey,
      });
    },
  };
}

// 기존 UI의 import를 깨지 않기 위한 기본 인스턴스
export const securityApi = createSecurityApi();
