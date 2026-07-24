import type { PersonalInfoType, RiskLevel } from './securityApi';

export interface RiskLog {
  id: string;
  timestamp: string;
  app_name: string;
  risk_level: RiskLevel;
  risk_type: PersonalInfoType | 'fraud_context' | 'unknown';
  action_taken: 'logged' | 'warned' | 'blocked' | 'confirmed' | 'cancelled';
}

export interface UserSettings {
  font_size: 'standard' | 'large' | 'extra_large';
  vibration_enabled: boolean;
  voice_alert: boolean;
  guardian_alert_threshold: RiskLevel;
  accessibility_mode: 'standard' | 'senior' | 'visual' | 'hearing';
}

export interface GuardianInfo {
  id: string;
  name: string;
  phone: string;
  notification_type: 'sms' | 'push';
  is_active: boolean;
}

export interface BlockHistory {
  id: string;
  timestamp: string;
  app_name: string;
  blocked_content_hash: string;
  user_decision: 'confirmed' | 'cancelled';
}
