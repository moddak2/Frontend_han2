import { env, type AppConfig } from '../config/env';
import { defaultRuntime, type RuntimeAdapter } from '../platform/runtime';
import type { ApiEnvelope, ApiErrorDetail } from '../types/securityApi';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly detail: ApiErrorDetail | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get retryable() {
    return this.detail?.retryable ?? (this.status >= 500 || this.status === 429 || this.status === 0);
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
  apiKey?: string;
};

const isEnvelope = <T>(value: unknown): value is ApiEnvelope<T> =>
  typeof value === 'object' && value !== null && 'success' in value && 'data' in value;

export function createApiClient(config: AppConfig, runtime: RuntimeAdapter = defaultRuntime) {
  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), options.timeoutMs ?? 3000);
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    headers.set('X-Client-Version', config.clientVersion);
    if (options.apiKey) headers.set('X-API-Key', options.apiKey);
    if (options.body !== undefined) headers.set('Content-Type', 'application/json; charset=utf-8');

    try {
      const response = await runtime.fetch(`${config.apiBaseUrl}${path}`, {
        ...options,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        headers,
        signal: controller.signal,
      });
      const payload: unknown = await response.json();

      // 정식 API envelope와 테스트/레거시 서버의 raw data 응답을 모두 지원한다.
      if (!isEnvelope<T>(payload)) {
        if (!response.ok) throw new ApiError(`HTTP ${response.status}`, response.status, null);
        return payload as T;
      }
      if (!response.ok || !payload.success || payload.data === null) {
        throw new ApiError(payload.error?.message || `HTTP ${response.status}`, response.status, payload.error);
      }
      return payload.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      throw new ApiError(
        timedOut ? '엣지 서버 응답 시간이 초과되었습니다.' : '엣지 서버에 연결할 수 없습니다.',
        0,
        null,
      );
    } finally {
      globalThis.clearTimeout(timeout);
    }
  };
}

export const apiRequest = createApiClient(env);
