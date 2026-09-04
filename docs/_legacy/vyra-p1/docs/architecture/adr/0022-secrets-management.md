# ADR-0022 — Secrets Manager + KMS + IAM least privilege

**Status**: Accepted · **Authority**: brief §30

## Context
Provider credentials (HeyGen, ElevenLabs, LLM, Meta, TikTok) carry financial and
identity-abuse risk. Nothing sensitive may be versioned.

## Decision
**AWS Secrets Manager** for provider keys, database credentials and signing keys;
**KMS** CMKs per environment; **IAM** least privilege per role and environment;
delivery via instance role. Social tokens additionally use envelope encryption
before storage. Secret scanning runs in CI and pre-commit.

## Alternatives rejected
- **Environment variables from a `.env` file in the repo** — rejected: the exact
  leakage vector the brief prohibits.
- **SSM Parameter Store** — rejected: acceptable, but Secrets Manager's native
  rotation and per-secret access policies fit credential handling better; a
  single mechanism avoids ambiguity about where a secret lives.
- **HashiCorp Vault** — rejected: another stateful service to operate against the
  lean baseline.

## Consequences
- Secret access is IAM-auditable.
- Rotation runbooks are an operational requirement.
- FF-19 and FF-14 make violations build failures.
