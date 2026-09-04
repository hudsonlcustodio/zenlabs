/**
 * @zenlabs/config — environment schema and typed configuration loading
 * (architecture.md §2.2, §8).
 *
 * Configuration is parsed once at process start. A misconfigured process fails
 * immediately instead of failing later in production.
 *
 * Secrets Manager retrieval (ADR-0022, FF-14) is deliberately absent: it is
 * owned by P4.11 in wave 2. This package holds the schema and the loader only.
 */

export {
  APP_ENVIRONMENTS,
  PROVIDER_MODES,
  appEnvironmentSchema,
  environmentScoped,
  providerModeSchema,
  type AppEnvironment,
  type ProviderMode,
} from './environment';

export {
  buildConfigSchema,
  environmentScopedResource,
  type ApiConfig,
  type ConfigByKind,
  type ProcessKind,
  type WebConfig,
  type WorkerConfig,
} from './schema';

export {
  ConfigurationError,
  loadConfig,
  loadConfigOrExit,
  type LoadOptions,
} from './load';
