import type { AnalyzeRequest, AnalyzeResult, PersonalInfoType } from '../types/securityApi';

const PERSONAL_PATTERNS: Array<{ type: PersonalInfoType; regex: RegExp }> = [
  { type: 'resident_registration_number', regex: /\d{6}-[1-4]\d{6}/ },
  { type: 'card_number', regex: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/ },
  { type: 'phone_number', regex: /01[0-9]-\d{3,4}-\d{4}/ },
  { type: 'otp_code', regex: /(?:인증|OTP|코드)[^\d]{0,8}\d{4,8}/i },
  { type: 'account_number', regex: /(?:계좌|송금)[^\d]{0,8}\d{2,6}[- ]?\d{2,6}[- ]?\d{2,6}/ },
];

const FRAUD_CONTEXT = /(검찰|경찰청|금융감독원|지금 당장|즉시|송금|보안 앱|비밀로)/;

export function analyzeLocally(
  request: AnalyzeRequest,
  source: 'edge' | 'local_fallback' = 'local_fallback',
): AnalyzeResult {
  const text = [
    request.input_text?.content,
    ...(request.conversation_context?.messages.map((message) => message.content) ?? []),
  ].filter(Boolean).join(' ');
  const detected = PERSONAL_PATTERNS.filter(({ regex }) => regex.test(text));
  const fraudContext = FRAUD_CONTEXT.test(text);
  const dangerous = detected.some(({ type }) => type !== 'phone_number') || fraudContext;
  const caution = !dangerous && detected.length > 0;
  const riskLevel = dangerous ? 'danger' : caution ? 'caution' : 'safe';

  return {
    risk_level: riskLevel,
    risk_score: dangerous ? 0.82 : caution ? 0.5 : 0.08,
    recommended_action: dangerous ? 'block_and_confirm' : caution ? 'show_banner' : 'log_only',
    detected_personal_info: detected.map(({ type }) => ({
      type,
      risk_grade: type === 'phone_number' ? 'caution' : 'danger',
      confidence: 0.9,
      span: null,
    })),
    detected_fraud_patterns: [],
    context_analysis: {
      is_fraud_conversation: fraudContext,
      fraud_category: fraudContext ? 'voice_phishing' : null,
      confidence: fraudContext ? 0.9 : 0.95,
      response_inducement_detected: false,
    },
    warning: dangerous
      ? { message: '사기 상황일 가능성이 있습니다. 전송하기 전에 다시 확인해 주세요.', tone: 'advisory', display_type: 'block_overlay' }
      : caution
        ? { message: '개인정보가 포함되어 있습니다. 받는 사람이 맞는지 확인해 주세요.', tone: 'advisory', display_type: 'banner' }
        : null,
    analysis_meta: {
      analysis_source: source,
      model_version: source === 'edge' ? 'mock-model' : 'local-regex-v1',
      ruleset_version: source === 'edge' ? 'mock-rules' : 'local-v1',
      processing_time_ms: 0,
      from_cache: false,
    },
  };
}
