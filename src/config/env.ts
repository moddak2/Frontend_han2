const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

export const env = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'),
  apiKey: import.meta.env.VITE_API_KEY || '',
  adminApiKey: import.meta.env.VITE_ADMIN_API_KEY || '',
  clientVersion: import.meta.env.VITE_CLIENT_VERSION || '1.0.0',
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
};
