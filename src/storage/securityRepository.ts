import { defaultRuntime, type KeyValueStorage } from '../platform/runtime';
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
  // 기존 버전 키를 유지해 업데이트 후에도 사용자 데이터가 사라지지 않게 한다.
  riskLogs: 'security-keyboard:risk-logs',
  settings: 'security-keyboard:settings',
  guardians: 'security-keyboard:guardians',
  blockHistory: 'security-keyboard:block-history',
};

export const defaultSettings: UserSettings = {
  font_size: 'standard',
  vibration_enabled: true,
  voice_alert: false,
  guardian_alert_threshold: 'danger',
  accessibility_mode: 'standard',
};

export function createSecurityRepository(storage: KeyValueStorage): SecurityRepository {
  const read = <T>(key: string, fallback: T): T => {
    const value = storage.getItem(key);
    if (!value) return fallback;
    try { return JSON.parse(value) as T; } catch { return fallback; }
  };
  const write = (key: string, value: unknown) => storage.setItem(key, JSON.stringify(value));

  return {
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
}

// 웹/Electron 기본 구현. Android에서는 KeyValueStorage 어댑터 또는 별도 SQLite Repository를 주입한다.
export const browserSecurityRepository = createSecurityRepository(defaultRuntime.storage);
