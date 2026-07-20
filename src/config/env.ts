export interface AppConfig {
  apiBaseUrl: string;
  apiKey: string;
  adminApiKey: string;
  clientVersion: string;
  useMocks: boolean;
}

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');
const parseBoolean = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value.toLowerCase() === 'true';

export function createAppConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    apiBaseUrl: normalizeBaseUrl(overrides.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'),
    apiKey: overrides.apiKey ?? import.meta.env.VITE_API_KEY ?? '',
    adminApiKey: overrides.adminApiKey ?? import.meta.env.VITE_ADMIN_API_KEY ?? '',
    clientVersion: overrides.clientVersion ?? import.meta.env.VITE_CLIENT_VERSION ?? '1.0.0',
    useMocks: overrides.useMocks ?? parseBoolean(import.meta.env.VITE_USE_MOCKS, true),
  };
}

export const env = createAppConfig();
