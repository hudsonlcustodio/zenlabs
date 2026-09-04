# ADR-0029 — Payment provider interface only; no gateway in MVP

**Status**: Accepted · **Authority**: brief §21, §44

## Context
Payments occur externally in MVP. Plan, subscription, billing cycle, entitlement
and payment status must still exist internally, and an administrator records
payment status manually.

## Decision
Model `Plan`, `Subscription`, `BillingCycle`, `Entitlement` and `PaymentStatus`
(`pending | paid | overdue | suspended`) with manual/external payment metadata,
activation and suspension. Declare a `PaymentProvider` **interface only**.
**No gateway is implemented** — not Asaas, Stripe, Mercado Pago or Pagar.me.

## Alternatives rejected
- **Integrate a gateway now** — rejected: explicitly out of scope (brief §21, §44).
- **Omit billing entities entirely** — rejected: entitlement drives the usage
  ledger and access control; the entities are needed regardless of who collects money.
- **Skip the interface** — rejected: leaving a named seam costs nothing and
  prevents a later invasive refactor.

## Consequences
- Payment status changes are administrative, idempotent and audited.
- Suspension affects entitlement and therefore the reservation guard at T08.
- Adding a gateway later means implementing one port.
