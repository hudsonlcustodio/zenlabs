---
id: P20
title: "Application shell, navigation and global experience"
status: generated
depends_on: [P3, P18, P19]
---

# Epic P20 — Application shell, navigation and global experience

- **Epic ID**: `P20`
- **Source phase**: `docs/architecture/implementation-sequencing.md` → Phase 14 (Surfaces), **extracted forward**: the shell needs identity, not the domain
- **Status**: `generated`
- **Wave**: 4
- **Priority**: P0
- **Depends on**: `P3`, `P18`, `P19`
- **Blocks**: `P15`, `P16`, `P21`, `P22`, `P23`
- **Story points (epic total)**: 46
- **Stories**: 8
- **IMPLEMENTATION NOT STARTED**

---

## Feature Spec Summary

**Intent**: Build the frame every screen lives inside — topbar, navigation rail, content region, drawer region, command palette, notification centre and the global condition banners — as presentation over server-resolved identity, so that by the time `P15` renders a route the shell it renders into is finished, tested and accessible.

**Goals**
- G1 The shell anatomy of `VYRA_PRODUCT_EXPERIENCE.md` §3.1 as one composable structure serving all three surfaces with different chrome, density and vocabulary.
- G2 The navigation model of §3.2: depth ≤ 3, a rail that never scrolls, tabs only for views of one object, breadcrumbs only on object detail, and a rail that simply does not render an item the session cannot enter.
- G3 A command palette whose action corpus is the session's **authorized** actions and nothing more (§3.3).
- G4 An in-app notification centre that never implies an email was sent, because `ADR-0027` leaves `EmailProvider` unimplemented and `GATE-NOTIF01` is open (§3.4).
- G5 The responsive shell of §22.2: 248px rail → 64px icon rail → off-canvas → bottom tab bar.
- G6 Global condition banners and global error, not-found and offline surfaces that keep the user inside the shell rather than stranding them (§17.3, §20.1).

**Non-goals**
- NG1 No client-side authorization. The rail renders from a server-resolved manifest; a hidden item is never the control (`FF-17`, `api-contracts.md` §2).
- NG2 No route group and no screen; `P15.02` wires the surfaces into this shell and `P21`/`P22`/`P23` fill them.
- NG3 No new primitive; everything here composes `P18` and `P19`.
- NG4 No email, no push, no external notification channel (`ADR-0027`, `GATE-NOTIF01`).
- NG5 No surface-specific chrome; Portal, Studio and Control chrome is `P21.01`, `P22.01`, `P23.01`.

**Acceptance evidence**
- AE1 The rail renders zero items a session cannot enter, and requesting a hidden route directly is denied by the server rather than filtered by the client.
- AE2 The command palette offers no action the session cannot execute, proven by a matrix test against the `P3.07` route manifest.
- AE3 The shell is fully operable by keyboard at every breakpoint, including the off-canvas rail and the bottom tab bar.
- AE4 A notification never states or implies that an email was sent.
- AE5 A route change moves focus to the page `<h1>` and announces the new title.
- AE6 Every global surface — error, not-found, offline, session-expiry — keeps the rail present so the user is never stranded.

**Assumptions**
- ASM-P20-01 The shell consumes the route manifest from `P3.07` as its navigation source, so navigation and authorization cannot disagree by construction. This is the same manifest `FF-17` enumerates.
- ASM-P20-02 This epic sits at wave 4 because its real dependencies are identity (`P3`, wave 3) and the primitives (`P18` wave 2, `P19` wave 3). The shell needs to know **who** the user is, not **what** their content is doing.
- ASM-P20-03 Rail collapse state and grid preferences are per-user, per-surface client preferences stored locally; theme is stored on the profile (`P18.02` AC-3) because it must survive devices.

---

## Architecture Spec Summary

**Affected surfaces**: `apps/web` shell layout and its shared regions; `packages/ui` gains the shell composition primitives.

**Integration points**: The `P3.07` route manifest, the session endpoint from `P3.02`, and the in-app notification read route (`OQ-P16-02`). No external integration.

**Risks**
- A shell that decides what a user may do is a shell that will eventually be wrong. `FF-17` and AE1 keep it a renderer of a server decision.
- A command palette is the fastest way to accidentally expose an unauthorized action, because it is a flat list of everything. AE2 is the specific defence.
- A notification centre that implies email delivery would make `GATE-NOTIF01` invisible to the user and to us. AE4 keeps the gate honest.

**References (by path)**
- `docs/product/VYRA_PRODUCT_EXPERIENCE.md` §2, §3, §17.3, §20, §22.2, §23.2
- `docs/architecture/api-contracts.md` §2
- `docs/architecture/fitness-functions.md` FF-17
- `docs/architecture/security-architecture.md` §1, §1.1
- `docs/architecture/adr/0027-notifications.md`
- `docs/architecture/adr/0003-frontend-stack.md`
- `docs/architecture/prd.md` §5, NFR-14
- `docs/architecture/risks.md` GATE-NOTIF01

---

## Contract Inventory

| Kind | Entry | Notes |
|---|---|---|
| API | Session read; notification list and mark-read (`OQ-P16-02`) | Consumed, not defined. No new resource (`api-contracts.md` §1 versioning rule). |
| DB | [N/A] | — |
| UI | Shell, rail, topbar, command palette, notification centre, account menu, global banners and global state surfaces | Consumed by `P15`, `P21`, `P22`, `P23`. |
| Env/Config | Session-expiry warning margin, notification poll interval, rail default state per surface | Configuration, never constants. |
| Event | [N/A] | — |
| Build | Rendered-shell route entries contributed to the `P3.07` manifest | Consumed by FF-17 and `P15.22`. |

---

## ADR / NFR Notes

- ADR-0003 fixes one application hosting three surfaces; this epic is where "one application" becomes visible and where the three surfaces stop being three codebases in waiting.
- `FF-17` is why navigation reads from the route manifest rather than from a hand-maintained list; `P15.20` and `P15.22` then verify the rendered set.
- ADR-0027 and `GATE-NOTIF01` constrain `P20.04` to in-app delivery and constrain its copy.
- `NFR-14` is served by AE3 and AE5; `NFR-03` is served by the shell painting before its data regions resolve (`VYRA_PRODUCT_EXPERIENCE.md` §18.3).

---

## Traceability

| Req / Source | Contract | Story | AC | Validation | Debt / Gap |
|---|---|---|---|---|---|
| PX §3.1 / ADR-0003 | shell anatomy | `P20.01` | AC-1..6 | layout + streaming tests | - |
| PX §3.2 / FF-17 / `P3.07` | navigation model from the manifest | `P20.02` | AC-1..6 | manifest-driven render test | - |
| PX §3.3 | command palette, authorized corpus | `P20.03` | AC-1..5 | authorization matrix | - |
| PX §3.4 / ADR-0027 / GATE-NOTIF01 | in-app notification centre | `P20.04` | AC-1..5 | copy + delivery assertions | GATE-NOTIF01 |
| `security-architecture.md` §1 / PX §31.0 | account menu, session state, expiry | `P20.05` | AC-1..5 | session-expiry test | - |
| PX §22.2 | responsive shell | `P20.06` | AC-1..6 | breakpoint traversal | - |
| PX §17.3 | global condition banners | `P20.07` | AC-1..5 | per-condition fixtures | - |
| PX §20.1, §20.3 | global error, not-found, offline | `P20.08` | AC-1..6 | snapshot equality + FF-20 | - |

**BDD example IDs**
- EX-P20-01 GIVEN a session that cannot enter Control, WHEN the shell renders, THEN no Control rail item exists and a direct route request is denied server-side.
- EX-P20-02 GIVEN the command palette, WHEN its corpus is compared with the route manifest for the session's role, THEN it contains no action the session cannot execute.
- EX-P20-03 GIVEN a notification, WHEN it renders, THEN it never states or implies that an email was sent.
- EX-P20-04 GIVEN a route change, WHEN it completes, THEN focus moves to the page `<h1>` and the new title is announced.
- EX-P20-05 GIVEN a viewport of 320px, WHEN the shell renders, THEN navigation is a bottom tab bar of at most five labelled items and nothing scrolls horizontally.
- EX-P20-06 GIVEN a session approaching expiry, WHEN the margin is reached, THEN a global banner offers extension and no work is lost if it is ignored.
- EX-P20-07 GIVEN a `not_found` route and a cross-tenant route, WHEN both render, THEN the two renders are identical and the rail is still present.
- EX-P20-08 GIVEN the browser goes offline, WHEN the user continues, THEN the offline surface states that nothing was lost and offers retry.

**Open questions**
- OQ-P20-01 `OQ-P16-02` — the in-app notification read route is documented as an additive `v1` change in `api-contracts.md` §5. `P20.04` consumes it; if the route is not yet documented when this epic runs, the documentation change is a prerequisite, not a new resource.
- OQ-P20-02 Whether the Portal command palette ships with the reduced corpus described in §3.3 or is deferred is a scope decision inside `P20.03`; the reduced corpus is the default.

**Public-safety exclusions**: no credential, license key, provider API key,
customer PII or raw vendor corpus appears in this epic or its stories.

**Trace coverage**: requirements 8/8 mapped; contracts 4/4 actionable entries mapped; examples 8/8 mapped to validations; unresolved gap codes: GATE-NOTIF01 (accepted, ADR-0027).

---

## Stories

| ID | Title | Points | Depends on | Priority |
|---|---|---|---|---|
| `P20.01` | Application shell: topbar, rail, content and drawer regions | 8 | — | P0 |
| `P20.02` | Navigation model driven by the route manifest | 5 | `P20.01`, `P3.07` | P0 |
| `P20.03` | Command palette with an authorized action corpus | 5 | `P20.02` | P0 |
| `P20.04` | In-app notification centre | 5 | `P20.01` | P0 |
| `P20.05` | Account menu, session state and session-expiry experience | 5 | `P20.01`, `P3.02` | P0 |
| `P20.06` | Responsive shell across the breakpoint matrix | 8 | `P20.02` | P0 |
| `P20.07` | Global condition banners | 5 | `P20.01` | P0 |
| `P20.08` | Global error, not-found and offline surfaces | 5 | `P20.01` | P0 |

**Verification gate (epic exit)**: the shell renders for all three surfaces from one composition; the rail contains zero items the session cannot enter and a direct request to a hidden route is denied server-side; the command-palette corpus matches the `P3.07` manifest for every role with zero excess; a notification never implies email delivery; route change moves focus to `<h1>` and announces the title; keyboard traversal of the shell passes at all seven breakpoints including the off-canvas rail and the bottom tab bar; `not_found` and cross-tenant renders are byte-identical with the rail present; the `P18.16` conformance harness is green for every shell component.
