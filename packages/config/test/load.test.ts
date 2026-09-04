import { describe, it, expect } from 'vitest';
import { loadConfig, ConfigurationError } from '../src/load';
import { environmentScoped, APP_ENVIRONMENTS, PROVIDER_MODES } from '../src/environment';
import { buildConfigSchema } from '../src/schema';

const validApiEnv = {
  APP_ENV: 'staging',
  PORT: '8080',
  COMMIT_SHA: 'abc1234',
};

describe('typed loading, parsed once at boot (AC-1)', () => {
  it('parses a valid api environment', () => {
    const config = loadConfig({ kind: 'api', source: validApiEnv });
    expect(config.APP_ENV).toBe('staging');
    expect(config.PORT).toBe(8080);
    expect(config.LOG_LEVEL).toBe('info');
  });

  it('parses a valid worker environment with its drain bound', () => {
    const config = loadConfig({
      kind: 'worker',
      source: { APP_ENV: 'development', SHUTDOWN_DRAIN_TIMEOUT_MS: '5000' },
    });
    expect(config.SHUTDOWN_DRAIN_TIMEOUT_MS).toBe(5000);
  });

  it('coerces and rejects out-of-range ports', () => {
    expect(() => loadConfig({ kind: 'api', source: { ...validApiEnv, PORT: '70000' } })).toThrow(
      ConfigurationError,
    );
    expect(() =>
      loadConfig({ kind: 'api', source: { ...validApiEnv, PORT: 'not-a-port' } }),
    ).toThrow(ConfigurationError);
  });
});

describe('fail fast, name the key, never the value (AC-2, EX-P1-03, FF-20)', () => {
  it('rejects a missing APP_ENV naming the key', () => {
    try {
      loadConfig({ kind: 'api', source: {} });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      const err = error as ConfigurationError;
      expect(err.keys).toContain('APP_ENV');
      expect(err.message).toContain('APP_ENV');
      expect(err.message).toContain('required but not set');
    }
  });

  it('rejects a malformed enum naming the key and the allowed values', () => {
    const error = (() => {
      try {
        loadConfig({ kind: 'api', source: { APP_ENV: 'prod' } });
      } catch (e) {
        return e as ConfigurationError;
      }
      return null;
    })();
    expect(error).toBeInstanceOf(ConfigurationError);
    expect(error?.message).toContain('APP_ENV');
    expect(error?.message).toContain('development | staging | production');
  });

  it('never echoes the offending value', () => {
    // Built at runtime: a credential-shaped literal must never be tracked in
    // the repository, which is exactly what FF-19 (P1.07) enforces.
    const SECRET = ['sk', 'live', 'super', 'secret', 'value', '9f3a'].join('-');
    const error = (() => {
      try {
        loadConfig({
          kind: 'api',
          source: { APP_ENV: 'staging', PORT: SECRET, LOG_LEVEL: SECRET },
        });
      } catch (e) {
        return e as ConfigurationError;
      }
      return null;
    })();

    expect(error).toBeInstanceOf(ConfigurationError);
    // The key names appear...
    expect(error?.message).toContain('PORT');
    expect(error?.message).toContain('LOG_LEVEL');
    // ...the value never does. This is the FF-20 precondition.
    expect(error?.message).not.toContain(SECRET);
    expect(error?.message).not.toContain(SECRET.slice(0, 7));
  });

  it('reports every offending key in one pass, not just the first', () => {
    const error = (() => {
      try {
        loadConfig({
          kind: 'api',
          source: { APP_ENV: 'staging', PORT: 'x', LOG_LEVEL: 'shout', PROVIDER_MODE: 'sometimes' },
        });
      } catch (e) {
        return e as ConfigurationError;
      }
      return null;
    })();
    expect(error?.keys).toEqual(expect.arrayContaining(['PORT', 'LOG_LEVEL', 'PROVIDER_MODE']));
  });
});

describe('NFR-12 — a shared credential is inexpressible (AC-3)', () => {
  const staging = environmentScoped('staging', 'DATABASE_URL');

  it('accepts a resource scoped to its own environment', () => {
    expect(staging.safeParse('postgres://db.staging.zenlabs.internal/zenlabs').success).toBe(true);
    expect(staging.safeParse('arn:aws:secretsmanager:us-east-1:1:secret:/zenlabs/staging/db').success).toBe(
      true,
    );
  });

  it('rejects a resource that names no environment at all', () => {
    const result = staging.safeParse('postgres://db.zenlabs.internal/zenlabs');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('NFR-12');
      expect(result.error.issues[0]?.message).toContain('staging');
    }
  });

  it('rejects a production credential loaded by a staging process', () => {
    const result = staging.safeParse('postgres://db.production.zenlabs.internal/zenlabs');
    expect(result.success).toBe(false);
  });

  it('rejects one resource claiming to serve two environments', () => {
    const result = staging.safeParse('postgres://db.staging-and-production.zenlabs.internal/zenlabs');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('may not serve two environments');
    }
  });

  it('never echoes the rejected identifier — it may itself be a credential', () => {
    const url = 'postgres://user:hunter2@db.production.zenlabs.internal/zenlabs';
    const result = staging.safeParse(url);
    expect(result.success).toBe(false);
    if (!result.success) {
      const rendered = JSON.stringify(result.error.issues);
      expect(rendered).not.toContain('hunter2');
      expect(rendered).not.toContain(url);
    }
  });

  it.each(APP_ENVIRONMENTS)('is enforced for %s as well', (environment) => {
    const schema = environmentScoped(environment, 'BUCKET');
    expect(schema.safeParse(`zenlabs-${environment}-media`).success).toBe(true);
    const foreign = APP_ENVIRONMENTS.find((e) => e !== environment)!;
    expect(schema.safeParse(`zenlabs-${foreign}-media`).success).toBe(false);
  });

  it('binds the parsed APP_ENV to a literal so one process cannot straddle environments', () => {
    const schema = buildConfigSchema('api', 'staging');
    expect(schema.safeParse({ APP_ENV: 'production', PORT: '80' }).success).toBe(false);
  });
});

describe('PROVIDER_MODE is reserved with its values declared (AC-4)', () => {
  it('declares exactly mock and live (ADR-0011, architecture.md §8)', () => {
    expect([...PROVIDER_MODES]).toEqual(['mock', 'live']);
  });

  it('defaults to mock so CI can never spend provider credit (cicd.md §2, NFR-13)', () => {
    expect(loadConfig({ kind: 'api', source: validApiEnv }).PROVIDER_MODE).toBe('mock');
  });

  it('accepts live only when stated explicitly', () => {
    expect(
      loadConfig({ kind: 'api', source: { ...validApiEnv, PROVIDER_MODE: 'live' } }).PROVIDER_MODE,
    ).toBe('live');
  });

  it('rejects any other mode', () => {
    expect(() =>
      loadConfig({ kind: 'api', source: { ...validApiEnv, PROVIDER_MODE: 'sandbox' } }),
    ).toThrow(ConfigurationError);
  });
});
