import type { AnalyzeRequest, AnalyzeResult, ApplyRulesetResult, HealthStatus, ModelInfo, Ruleset } from '../types/securityApi';

export interface SecurityAnalysisService {
  health(): Promise<HealthStatus>;
  analyze(request: AnalyzeRequest): Promise<AnalyzeResult>;
  modelInfo(): Promise<ModelInfo>;
  ruleset(): Promise<Ruleset>;
  applyRuleset(ruleset: Pick<Ruleset, 'ruleset_version' | 'rules'>): Promise<ApplyRulesetResult>;
}
