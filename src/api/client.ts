import { env } from '../config/env';
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
    return this.detail?.retryable ?? (this.status >= 500 || this.status === 0);
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
  apiKey?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 3000);
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Client-Version', env.clientVersion);
  if (options.apiKey) headers.set('X-API-Key', options.apiKey);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json; charset=utf-8');

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      signal: controller.signal,
    });
    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !envelope.success || envelope.data === null) {
      throw new ApiError(envelope.error?.message || `HTTP ${response.status}`, response.status, envelope.error);
    }
    return envelope.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? '엣지 서버 응답 시간이 초과되었습니다.'
      : '엣지 서버에 연결할 수 없습니다.';
    throw new ApiError(message, 0, null);
  } finally {
    window.clearTimeout(timeout);
  }
}
