export type RiskLevel = 'safe' | 'caution' | 'danger';
export type RecommendedAction = 'log_only' | 'show_banner' | 'show_popup' | 'block_and_confirm';
export type PersonalInfoType =
  | 'resident_registration_number'
  | 'account_number'
  | 'card_number'
  | 'otp_code'
  | 'phone_number'
  | 'password_guess'
  | 'name_birth_combo';
export type FraudPatternType =
  | 'authority_impersonation'
  | 'urgent_remittance'
  | 'financial_info_request'
  | 'remote_control_inducement'
  | 'personal_info_request'
  | 'urgency_pressure'
  | 'excessive_intimacy';
export type SenderRole = 'user' | 'opponent';

export interface ApiErrorDetail {
  code: string;
  message: string;
  field: string | null;
  retryable: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  request_id: string;
  timestamp: string;
  data: T | null;
  error: ApiErrorDetail | null;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unavailable';
  model_loaded: boolean;
  uptime_seconds: number;
  server_version: string;
  queue_depth: number;
}

export interface AnalyzeRequest {
  request_id: string;
  client_timestamp: string;
  input_text?: {
    content: string;
    app_package?: string | null;
    field_type?: 'message' | 'email' | 'sms' | 'unknown' | null;
  };
  conversation_context?: {
    source?: 'accessibility' | 'ocr' | null;
    messages: Array<{ sender: SenderRole; content: string; sent_at?: string | null }>;
  };
  local_detection?: {
    detected: boolean;
    pattern_types?: PersonalInfoType[] | null;
    preliminary_level?: RiskLevel | null;
  } | null;
  options?: {
    analysis_depth?: 'quick' | 'full' | null;
    language?: 'ko' | 'en' | null;
    include_warning_message?: boolean | null;
  } | null;
}

export interface AnalyzeResult {
  risk_level: RiskLevel;
  risk_score: number;
  recommended_action: RecommendedAction;
  detected_personal_info: Array<{
    type: PersonalInfoType;
    risk_grade: RiskLevel;
    confidence: number;
    span: { start: number; end: number } | null;
  }>;
  detected_fraud_patterns: Array<{
    type: FraudPatternType;
    risk_grade: RiskLevel;
    confidence: number;
    source_role: SenderRole;
    matched_summary: string;
  }>;
  context_analysis: {
    is_fraud_conversation: boolean;
    fraud_category: 'voice_phishing' | 'smishing' | 'personal_info_phishing' | null;
    confidence: number;
    response_inducement_detected: boolean;
  };
  warning: {
    message: string;
    tone: 'advisory' | 'standard';
    display_type: 'banner' | 'popup' | 'block_overlay';
  } | null;
  analysis_meta: {
    analysis_source: 'edge' | 'local_fallback';
    model_version: string;
    ruleset_version: string;
    processing_time_ms: number;
    from_cache: boolean;
  };
}

export interface ModelInfo {
  model_version: string;
  model_type: string;
  ruleset_version: string;
  supported_languages: string[];
  min_client_version: string;
  updated_at: string;
}

export interface Rule {
  rule_id: string;
  pattern_type: FraudPatternType;
  keywords: string[];
  default_risk_grade: Exclude<RiskLevel, 'safe'>;
  enabled: boolean;
}

export interface Ruleset {
  ruleset_version: string;
  updated_at: string;
  rule_count: number;
  rules: Rule[];
}

export interface ApplyRulesetResult {
  ruleset_version: string;
  applied_rule_count: number;
  applied_at: string;
  previous_version: string | null;
}
