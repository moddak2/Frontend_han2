import { createSecurityApi } from '../api/securityApi';
import { createAppConfig, type AppConfig } from '../config/env';
import { defaultRuntime, type RuntimeAdapter } from '../platform/runtime';
import { createSecurityRepository } from '../storage/securityRepository';

/** 플랫폼별 의존성을 한곳에서 조립하는 composition root. */
export function createAppServices(
  config: Partial<AppConfig> = {},
  runtime: RuntimeAdapter = defaultRuntime,
) {
  const resolvedConfig = createAppConfig(config);
  return {
    config: resolvedConfig,
    analysis: createSecurityApi(resolvedConfig, runtime),
    repository: createSecurityRepository(runtime.storage),
  };
}

export const appServices = createAppServices();
