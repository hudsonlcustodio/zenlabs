# ADR-0017 — Official platform APIs only, with disclosure and audit gates

**Status**: Accepted · **Authority**: brief §22

## Context
Confirmed: Meta content publishing requires an Instagram Business/Creator account
linked to a Facebook Page with admin-equivalent permissions, may require Page
Publishing Authorization and 2FA, and limits Instagram to 100 API-published posts
per rolling 24 hours. TikTok restricts **unaudited** clients to `SELF_ONLY`
viewership with at most 5 posting users per 24 hours until an audit passes.

## Decision
Use **official APIs only**, behind a `PublishingProvider` port per platform.
Connection health (account type, Page link, PPA, 2FA, token validity, quota) is
validated **before** scheduling. AI-generated content uses official disclosure
mechanisms where they exist.

## Alternatives rejected
- **Unofficial APIs or browser automation** — rejected: violates platform terms
  and is operationally fragile.
- **Supporting personal Instagram accounts** — rejected: the API does not serve
  them; brief §22 forbids promising unsupported account types.
- **Publishing without AI disclosure** — rejected absolutely: brief §22 forbids
  hiding AI-generated nature. Enforced by FF-15.
- **Blocking the architecture on the TikTok audit** — rejected: it is a launch
  gate (GATE-TT01), not a design constraint.

## Consequences
- Onboarding must state account prerequisites explicitly.
- Rate limits are operational configuration used for admission control.
- GATE-TT02 (AIGC disclosure mapping) blocks AI-content publication to TikTok
  until resolved, rather than being guessed.
