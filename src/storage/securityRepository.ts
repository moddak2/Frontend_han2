import type { BlockHistory, GuardianInfo, RiskLog, UserSettings } from '../types/localData';

export interface SecurityRepository {
  listRiskLogs(): Promise<RiskLog[]>;
  saveRiskLog(log: RiskLog): Promise<void>;
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<void>;
  listGuardians(): Promise<GuardianInfo[]>;
  saveGuardians(guardians: GuardianInfo[]): Promise<void>;
  listBlockHistory(): Promise<BlockHistory[]>;
  saveBlockHistory(history: BlockHistory): Promise<void>;
}

const keys = {
  riskLogs: 'security-keyboard:risk-logs',
  settings: 'security-keyboard:settings',
  guardians: 'security-keyboard:guardians',
  blockHistory: 'security-keyboard:block-history',
};

const defaultSettings: UserSettings = {
  font_size: 'standard',
  vibration_enabled: true,
  voice_alert: false,
  guardian_alert_threshold: 'danger',
  accessibility_mode: 'standard',
};

const read = <T>(key: string, fallback: T): T => {
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

/**
 * 웹 UI 프로토타입용 저장소다. Android 앱에서는 동일 인터페이스의 SQLite 구현체로 교체한다.
 * 보안 정책상 입력 원문을 받거나 저장하는 메서드는 의도적으로 제공하지 않는다.
 */
export const browserSecurityRepository: SecurityRepository = {
  async listRiskLogs() { return read<RiskLog[]>(keys.riskLogs, []); },
  async saveRiskLog(log) { write(keys.riskLogs, [log, ...read<RiskLog[]>(keys.riskLogs, [])]); },
  async getSettings() { return read(keys.settings, defaultSettings); },
  async saveSettings(settings) { write(keys.settings, settings); },
  async listGuardians() { return read<GuardianInfo[]>(keys.guardians, []); },
  async saveGuardians(guardians) {
    if (guardians.length > 3) throw new Error('보호자는 최대 3명까지 등록할 수 있습니다.');
    write(keys.guardians, guardians);
  },
  async listBlockHistory() { return read<BlockHistory[]>(keys.blockHistory, []); },
  async saveBlockHistory(history) { write(keys.blockHistory, [history, ...read<BlockHistory[]>(keys.blockHistory, [])]); },
};
