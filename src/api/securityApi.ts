import { env } from '../config/env';
import type {
  AnalyzeRequest,
  AnalyzeResult,
  ApplyRulesetResult,
  HealthStatus,
  ModelInfo,
  Ruleset,
} from '../types/securityApi';
import { apiRequest } from './client';
import { ApiError } from './client';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const mockHealth: HealthStatus = {
  status: 'ok', model_loaded: true, uptime_seconds: 86400, server_version: 'mock-1.0.0', queue_depth: 0,
};

const localAnalyze = (request: AnalyzeRequest, source: 'edge' | 'local_fallback' = 'edge'): AnalyzeResult => {
  const text = [request.input_text?.content, ...(request.conversation_context?.messages.map((item) => item.content) ?? [])]
    .filter(Boolean).join(' ');
  const patterns = [
    { type: 'resident_registration_number' as const, regex: /\d{6}-[1-4]\d{6}/ },
    { type: 'card_number' as const, regex: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/ },
    { type: 'phone_number' as const, regex: /01[0-9]-\d{3,4}-\d{4}/ },
    { type: 'otp_code' as const, regex: /(?:인증|OTP|코드)[^\d]{0,8}\d{4,8}/i },
    { type: 'account_number' as const, regex: /(?:계좌|송금)[^\d]{0,8}\d{2,6}[- ]?\d{2,6}[- ]?\d{2,6}/ },
  ];
  const detected = patterns.filter(({ regex }) => regex.test(text));
  const fraudContext = /(검찰|경찰청|금융감독원|지금 당장|즉시|송금|보안 앱|비밀로)/.test(text);
  const dangerous = detected.some(({ type }) => type !== 'phone_number') || fraudContext;
  const caution = !dangerous && detected.length > 0;
  const riskLevel = dangerous ? 'danger' : caution ? 'caution' : 'safe';
  return {
    risk_level: riskLevel,
    risk_score: dangerous ? 0.82 : caution ? 0.5 : 0.08,
    recommended_action: dangerous ? 'block_and_confirm' : caution ? 'show_banner' : 'log_only',
    detected_personal_info: detected.map(({ type }) => ({
      type, risk_grade: type === 'phone_number' ? 'caution' : 'danger', confidence: 0.9, span: null,
    })),
    detected_fraud_patterns: [],
    context_analysis: {
      is_fraud_conversation: dangerous,
      fraud_category: dangerous ? 'voice_phishing' : null,
      confidence: dangerous ? 0.9 : 0.95,
      response_inducement_detected: false,
    },
    warning: dangerous ? {
      message: '사기 상황일 가능성이 있습니다. 전송하기 전에 다시 확인해 주세요.',
      tone: 'advisory',
      display_type: 'block_overlay',
    } : null,
    analysis_meta: {
      analysis_source: source,
      model_version: source === 'edge' ? 'mock-model' : 'local-regex',
      ruleset_version: source === 'edge' ? 'mock-rules' : 'local-v1',
      processing_time_ms: 0,
      from_cache: false,
    },
  };
};

export const securityApi = {
  async health() {
    if (env.useMocks) { await wait(150); return mockHealth; }
    return apiRequest<HealthStatus>('/health', { timeoutMs: 1000 });
  },

  async analyze(request: AnalyzeRequest) {
    if (env.useMocks) { await wait(250); return localAnalyze(request); }
    const call = () => apiRequest<AnalyzeResult>('/analyze', {
      method: 'POST', body: request, apiKey: env.apiKey, timeoutMs: 1400,
      headers: { 'X-Request-ID': request.request_id, 'Accept-Language': request.options?.language ?? 'ko' },
    });
    try {
      return await call();
    } catch (caught) {
      if (caught instanceof ApiError && caught.retryable) {
        try { return await call(); } catch { return localAnalyze(request, 'local_fallback'); }
      }
      return localAnalyze(request, 'local_fallback');
    }
  },

  modelInfo() {
    return apiRequest<ModelInfo>('/model/info', { apiKey: env.apiKey });
  },

  ruleset() {
    return apiRequest<Ruleset>('/ruleset', { apiKey: env.apiKey });
  },

  applyRuleset(ruleset: Pick<Ruleset, 'ruleset_version' | 'rules'>) {
    return apiRequest<ApplyRulesetResult>('/ruleset', {
      method: 'PUT', body: ruleset, apiKey: env.adminApiKey,
    });
  },
};
