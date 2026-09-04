# ADR-0103 — Authority model: Client, Human, AI and System

**Status:** Accepted

## Decision
Client owns intent/knowledge/identity authorization.
AI owns probabilistic recommendations/planning.
System owns transactional state/security/budget/execution.
Human Supervisor owns policies, risk, exceptions and authorized overrides.

AI never directly performs an authority action.
