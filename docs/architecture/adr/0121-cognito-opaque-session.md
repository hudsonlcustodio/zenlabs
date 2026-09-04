# ADR-0121 — Cognito for authentication, ZENLABS for authorization

**Status:** Proposed

## Decision
Amazon Cognito User Pools performs primary authentication.

ZENLABS creates its own opaque, revocable web session and stores the hashed session identifier in PostgreSQL.

Tenant memberships, roles and object authorization remain application-domain data.
