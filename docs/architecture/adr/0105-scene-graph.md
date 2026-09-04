# ADR-0105 — Production → Chapter → Scene → Shot

**Status:** Proposed

## Decision
Shot is the smallest routable creative unit. Provider execution is represented separately by MediaJob.

This enables long-form composition and provider rerouting without changing creative intent.
