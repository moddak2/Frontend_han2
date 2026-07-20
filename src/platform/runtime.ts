export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RuntimeAdapter {
  fetch: typeof fetch;
  storage: KeyValueStorage;
  createRequestId(): string;
  now(): string;
  delay(ms: number): Promise<void>;
}

const memoryValues = new Map<string, string>();

export const memoryStorage: KeyValueStorage = {
  getItem: (key) => memoryValues.get(key) ?? null,
  setItem: (key, value) => { memoryValues.set(key, value); },
  removeItem: (key) => { memoryValues.delete(key); },
};

const browserStorage = (): KeyValueStorage => {
  try {
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
  } catch {
    // Electron 보안 설정이나 브라우저 정책으로 접근이 거부되면 메모리 저장소를 사용한다.
  }
  return memoryStorage;
};

const fallbackUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    return (token === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });

export const defaultRuntime: RuntimeAdapter = {
  fetch: (...args) => globalThis.fetch(...args),
  storage: browserStorage(),
  createRequestId: () => globalThis.crypto?.randomUUID?.() ?? fallbackUuid(),
  now: () => new Date().toISOString(),
  delay: (ms) => new Promise((resolve) => globalThis.setTimeout(resolve, ms)),
};
