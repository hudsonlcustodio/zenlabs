# ADR-0126 — GitHub Actions OIDC for AWS access

**Status:** Proposed

## Decision
CI/CD assumes temporary AWS roles through GitHub OIDC.

No long-lived AWS access key is stored in GitHub Secrets.
