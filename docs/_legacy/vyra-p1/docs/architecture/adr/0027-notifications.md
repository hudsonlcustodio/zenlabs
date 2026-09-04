# ADR-0027 — Notification port now, vendor decision deferred

**Status**: Accepted · **Authority**: brief §43

## Context
Notifications are required for approval-waiting, failures, publication, low
provider balance, expiring integrations and identity readiness. The brief
forbids choosing an email vendor arbitrarily without an ADR or requirement.

## Decision
Define **two ports now** and defer only the vendor:

- `NotificationProvider` — channel-agnostic dispatch of a domain notification.
- `EmailProvider` — the email transport, a channel implementation behind it.

Plus a `notification` table with delivery state, attempts and retries.

**The vendor choice is deliberately deferred** and recorded as
**GATE-NOTIF01**, an implementation/architecture gate to be closed when delivery
requirements are stated (volume, deliverability, templating, localisation,
bounce/complaint handling, in-app vs email split).

MVP ships **in-app notifications only**, which need no vendor. Every trigger in
`prd.md` §8.13 is routed through `NotificationProvider`, so enabling email later
is implementing `EmailProvider` — no domain change.

This ADR records the deferral as an explicit decision so it is not an accidental
gap. Choosing a vendor now would be arbitrary and is forbidden by brief §43.

## Alternatives rejected
- **Pick SES/Resend/Postmark now** — rejected: the brief explicitly requires a
  requirement-driven decision; choosing now would be arbitrary. No vendor is
  named as preferred anywhere in these artifacts.
- **A single port covering both in-app and email** — rejected: email carries
  transport concerns (bounces, complaints, suppression, DKIM/SPF) that do not
  belong in a channel-agnostic dispatch interface.
- **No notification abstraction until needed** — rejected: notification triggers
  are already known and would otherwise be scattered through modules.

## Consequences
- Adding a vendor is implementing one port, with no domain change.
- **OQ-02 / GATE-NOTIF01** remains open. It blocks *email* delivery at launch,
  not the architecture and not in-app notifications.
