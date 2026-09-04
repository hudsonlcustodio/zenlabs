# VYRA — Product Experience & Visual System

- **Artifact**: `docs/product/VYRA_PRODUCT_EXPERIENCE.md`
- **Status**: **canonical** — this document is the single source of truth for
  UX, UI, interaction and visual system decisions for the VYRA MVP.
- **Authority**: `docs/product/VYRA_ARCH_PLAN_BRIEF.md` §4, §6, §16, §24;
  `docs/architecture/prd.md` §5, §7, NFR-03, NFR-14; ADR-0003, ADR-0028, ADR-0035.
- **Implementation status**: IMPLEMENTATION NOT STARTED.

---

## 0. Document control

### 0.1 What this document decides

`ADR-0003` fixed the **stack**. `ADR-0028` fixed the **verification method**
(owned primitives, no Storybook page-stories). Neither fixed the **visual
system**, and `prd.md` §7 recorded that absence as `ASM-BR01` — *"no canonical
branding exists; tokens are placeholders"*.

**This document closes that gap.** From here on:

| Identifier | Previous state | State after this document |
|---|---|---|
| `ASM-BR01` | Open assumption — no branding, placeholder tokens | **Superseded.** The visual system is defined in §4–§11 below. |
| `RISK-10` | Open — no canonical branding | **Closed.** Mitigation delivered, not deferred. |
| `OQ-P15-01` | Open — tokens remain placeholders | **Closed** by §4 and §5. |
| `OQ-P15-02` | Open — charting library unfixed | **Closed** by §3.2 and ADR-0035 (Recharts via shadcn Charts). |
| `ASM-P15-01` | Charting library selected at implementation time | **Superseded** by ADR-0035. |
| `ASM-IA01` | IA derived, not validated | **Superseded** by §2 and §31–§33 (blueprints). |
| `ASM-P15-02` | Screen seeds are inputs, not designs | **Superseded** by §31–§33. |
| `RISK-05` / `GATE-UX01` | No Storybook adapter | **Unchanged.** ADR-0028 stands; verification is component tests + the running application + the conformance suite in §23. |

### 0.2 What this document does **not** decide

- It does not change any ADR that fixes the stack, the API contracts, the
  authorization model or the infrastructure. Where a screen and a contract
  disagree, **the contract wins** and the screen is redrawn.
- It does not introduce client-side authorization. Every rule here is a
  presentation rule; `api-contracts.md` §2 and `FF-17` remain the only control.
- It does not add a component framework. See §3.3.

### 0.3 Precedence

1. `docs/architecture/api-contracts.md` (routes, error codes, pagination)
2. `docs/architecture/workflows-state-machines.md` (states, transitions, guards)
3. `docs/architecture/security-architecture.md` (media delivery, sessions)
4. **This document** (everything visual, interactional and informational)
5. `docs/architecture/prd.md` §7 screen seeds (historical input only)

---

## 1. Product design principles

Ten principles. Each one is testable; each one is cited by at least one
acceptance criterion in the backlog.

**PD-01 — The client never sees the machine.**
No prompt, model name, queue, provider, job id, retry count or engine appears on
a Portal surface. `FF-09` already forbids model identifiers outside
configuration; the Portal extends that to the whole vocabulary. Studio and
Control *do* see the machine — that asymmetry is the product.

**PD-02 — State is the primary content.**
VYRA sells a pipeline, not a page. Every Portal screen answers *"where is my
content and what does it need from me?"* before it answers anything else. The
21-state vocabulary in §21 is the product's spine and is never paraphrased
per-screen.

**PD-03 — Numbers are the hero.**
Metrics are set in display sizes with tabular figures and are never decorated.
A large number with a small, precise label outranks any illustration. Editorial
hierarchy (§6) replaces visual ornament.

**PD-04 — Surfaces are layered, not boxed.**
Depth comes from surface lightness and 1px borders at ≤ 10% opacity, never from
drop shadows on flat content and never from a card inside a card inside a card
(§15.4). Shadow is reserved for things that float over the page (§9.3).

**PD-05 — Restraint is the brand.**
Accent is a scarce resource. One primary accent per viewport region; violet is
secondary and is reserved for intelligence/identity semantics (§5.3). Glow is
functional only (§9.4). Gradients are limited to two sanctioned uses (§5.6).

**PD-06 — Motion explains, never entertains.**
Motion exists to show where something came from, that something is live, or that
a boundary was hit. Nothing loops decoratively. Everything respects
`prefers-reduced-motion` (§10.4).

**PD-07 — The irreversible is always announced.**
Approval commits usage (T11 commits are final). Revocation is irreversible.
Publication is public. Each of these has a distinct, non-dismissible affordance
(§28.4) and none of them is a toast.

**PD-08 — Density follows the operator.**
Portal is *comfortable* (one decision-maker, occasional use, phone-capable).
Studio and Control are *dense* (professionals, all day, keyboard-first,
desktop-first). Density is a token set (§7.4), not a redesign.

**PD-09 — Every screen has four other screens.**
Loading, empty, error and denied are designed with the same care as the happy
path and ship in the same story (§18–§20). A screen without them is not done.

**PD-10 — Accessibility is structural.**
`NFR-14` makes this architectural. Contrast, keyboard operability, focus
visibility, reduced motion and non-colour status encoding are acceptance
criteria, never a later pass (§23).

---

## 2. Information architecture

### 2.1 One application, three surfaces

`ADR-0003` fixes one Next.js App Router application. The surfaces are **route
groups with distinct chrome, density and vocabulary**, resolved server-side from
the session role. A user never sees a surface switcher for a surface they cannot
enter; a user with more than one surface sees an explicit switcher (§3 of §31.0).

```
apps/web/app
├─ (auth)/                    sign-in, mfa, recover, invite-accept
├─ (portal)/                  role: portal user            density: comfortable
├─ (studio)/                  roles: CONTENT_STRATEGIST, QA_REVIEWER,
│                                    PUBLISHER, OPERATIONS_MANAGER  density: dense
└─ (control)/                 roles: SUPER_ADMIN and delegated admin roles
                                                            density: dense
```

### 2.2 Portal information architecture

Two levels. No third level of navigation exists in the Portal.

| L1 | L2 | Screen id |
|---|---|---|
| **Overview** | — | `portal-dashboard` |
| **Content** | Pipeline · Library | `portal-content`, `portal-library` |
| **Calendar** | — | `portal-calendar` |
| **Performance** | — | `portal-performance` |
| **Account** | Plan & usage · Digital Twin · Consent · Profile & security | `portal-plan`, `portal-twin`, `portal-consent`, `portal-profile` |

Approvals are **not** a navigation item. They are an interruption surfaced by
the pipeline, the dashboard action rail and the notification centre, because an
approval is an event, not a place (PD-02).

### 2.3 Studio information architecture

| L1 | L2 | Screen id |
|---|---|---|
| **Operations** | — | `studio-overview` |
| **Clients** | list · detail | `studio-clients`, `studio-client` |
| **Production** | Requests · Scripts · Generation queue · QA | `studio-requests`, `studio-script`, `studio-queue`, `studio-qa` |
| **Knowledge** | Sources · Retrieval trace | `studio-knowledge`, `studio-knowledge-trace` |
| **Identity** | Digital Twins · Voice clones | `studio-twins`, `studio-voices` |
| **Distribution** | Calendar · Publishing | `studio-calendar`, `studio-publishing` |
| **Performance** | — | `studio-performance` |

Studio is **client-scoped by context**: a persistent client selector in the
shell scopes every Production, Knowledge and Identity screen. Distribution and
Performance are cross-tenant by default and scope down on demand.

### 2.4 Control information architecture

| L1 | L2 | Screen id |
|---|---|---|
| **Status** | — | `control-status` |
| **Tenancy** | Tenants · Users & roles | `control-tenants`, `control-tenant`, `control-users` |
| **Commercial** | Plans & entitlements · Usage ledger · Cost & contribution | `control-plans`, `control-usage`, `control-costs` |
| **Providers** | Health & balance · Integrations | `control-providers`, `control-integrations` |
| **Governance** | Audit trail · Security | `control-audit`, `control-security` |

### 2.5 Object model exposed to the interface

Six navigable object types. Every deep link resolves to one of them; anything
else is a view, not an object.

`Tenant` · `ContentItem` · `ScriptVersion` · `MediaAsset` · `KnowledgeSource` ·
`Identity asset` (`DigitalTwin` | `VoiceClone`).

URL shape: `/{surface}/{collection}/{id}` — no `tenantId` ever appears in a
client-facing URL (`api-contracts.md` §1 tenant scoping rule). A Control URL may
carry a tenant id because Control is explicitly cross-tenant.

---

## 3. Navigation model

### 3.1 Shell anatomy

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TOPBAR  56px   [mark] [surface] │ [client scope]      [⌘K] [bell] [user]  │
├────────────┬─────────────────────────────────────────────────────────────┤
│ RAIL       │ CONTENT                                                     │
│ 248px      │  ┌ page header (eyebrow · title · meta · primary action)     │
│ collapse→  │  ├ context bar (filters · view switch · bulk bar)  optional  │
│ 64px       │  └ page body (12-col grid)                                   │
│            │                                                             │
│ ...        │                                        ┌────────────────┐    │
│            │                                        │ DRAWER 480-840 │    │
└────────────┴────────────────────────────────────────┴────────────────┴────┘
```

- **Topbar** — persistent, 56px, `surface-1` with `border-subtle` bottom. Holds
  the VYRA mark, the surface label, the Studio client scope selector, the command
  palette trigger, the notification bell and the account menu.
- **Rail** — vertical primary navigation, 248px expanded / 64px collapsed,
  `surface-1`. Collapse state persists per user per surface in local storage.
  Active item: 2px lime left indicator + `text-primary` + `surface-2` fill.
- **Content** — `bg-base`, 12-column grid (§8).
- **Drawer** — right-anchored object detail; never nested; closing returns focus
  to the invoking control.

### 3.2 Navigation rules

1. **Depth ≤ 3.** `surface → section → object`. A fourth level is a drawer or a
   tab inside the object, never a rail item.
2. **The rail never scrolls on a 900px-tall viewport** for any surface. If it
   would, the IA is wrong.
3. **Tabs are for views of one object**, never for sibling objects.
4. **Breadcrumbs appear only on object detail screens** and always start at the
   collection.
5. **Back is browser-native.** No in-app back button except inside a drawer
   stack of depth 1.
6. **A route the session cannot enter returns the server's decision**, not a
   filtered view (`EX-P15-01`). The rail simply does not render the item.
7. **`404` is indistinguishable from a cross-tenant object** (`api-contracts.md`
   §2, `EX-P15-09`). The not-found screen is byte-identical in both cases.

### 3.3 Command palette (`⌘K` / `Ctrl+K`)

Available on Studio and Control from the first release; Portal ships it in the
same story but with a reduced corpus (navigation + own content items only).
Scopes: *Go to*, *Find content*, *Find client* (Studio/Control), *Action*.
Actions in the palette are the same authorized actions as the screen — the
palette never exposes an action the session cannot execute.

### 3.4 Notification centre

Bell in the topbar; unread count as a lime dot (no number badge below 1,
numeric to 99+). Panel is a 400px right drawer, grouped by day, with three
categories: **needs you** (approvals, consent, payment), **finished**
(published, ready), **attention** (blocked, failed). In-app only at MVP —
`ADR-0027` leaves `EmailProvider` unimplemented and `GATE-NOTIF01` open; the UI
must not imply an email was sent.

---

## 4. Design tokens

Tokens are the contract between this document and `packages/ui`. They are
declared once as CSS custom properties on `:root`, consumed through Tailwind
theme extension, and **never** hard-coded in a component.

### 4.1 Naming

`--vyra-<category>-<role>[-<step>]`

Categories: `bg`, `surface`, `border`, `text`, `accent`, `violet`, `status`,
`viz`, `radius`, `space`, `font`, `size`, `line`, `track`, `weight`, `dur`,
`ease`, `shadow`, `glow`, `z`.

Two layers, and only the second is used by components:

- **Primitive tokens** — raw values (`--vyra-lime-400: #B2EE2F`).
- **Semantic tokens** — roles (`--vyra-accent-solid: var(--vyra-lime-400)`).

A component that references a primitive token directly is a defect and is
caught by the token lint in §23.6.

### 4.2 Foundation — carbon

Dark is the canonical theme. Light is a token remap (§4.6), not a second design.

| Token | Value | Use |
|---|---|---|
| `--vyra-bg-base` | `#08090A` | Application background |
| `--vyra-bg-sunken` | `#050607` | Wells, code blocks, video letterbox |
| `--vyra-surface-1` | `#0E1012` | Topbar, rail, page-level panels |
| `--vyra-surface-2` | `#15181A` | Cards, table headers, inputs |
| `--vyra-surface-3` | `#1C2023` | Hover, selected row, tooltip |
| `--vyra-surface-4` | `#24282C` | Popover, dropdown, drawer, dialog |
| `--vyra-surface-inverse` | `#F2F5F6` | Rare: on-accent inversions, print |

### 4.3 Borders — extremely subtle

| Token | Value | Use |
|---|---|---|
| `--vyra-border-subtle` | `rgba(255,255,255,0.06)` | Default separator, card edge |
| `--vyra-border-default` | `rgba(255,255,255,0.10)` | Input rest, table outer |
| `--vyra-border-strong` | `rgba(255,255,255,0.18)` | Hover, dragging, emphasis |
| `--vyra-border-accent` | `rgba(178,238,47,0.45)` | Selected, active, focus companion |
| `--vyra-border-danger` | `rgba(244,81,78,0.50)` | Invalid input, destructive zone |

Rule: **one border weight only — 1px.** A 2px edge is an indicator (left rail
marker, focus ring), never a border.

### 4.4 Text

| Token | Value | Contrast on `surface-1` |
|---|---|---|
| `--vyra-text-primary` | `#F3F6F7` | 16.9:1 |
| `--vyra-text-secondary` | `#A9B2B8` | 8.2:1 |
| `--vyra-text-tertiary` | `#727C83` | 4.6:1 |
| `--vyra-text-disabled` | `#4B5359` | 2.6:1 — non-text only |
| `--vyra-text-on-accent` | `#0A0D04` | 13.4:1 on `accent-solid` |
| `--vyra-text-inverse` | `#0E1012` | on `surface-inverse` |

`--vyra-text-disabled` never carries information. A disabled control always has
a non-colour explanation (tooltip or adjacent help text), per §23.3.

### 4.5 Accent scales

**Lime / acid green — primary accent.**

| Step | Value | Sanctioned use |
|---|---|---|
| `lime-100` | `#EAFCC4` | On-accent text over `lime-700+` fills only |
| `lime-200` | `#D8F994` | Chart highlight on dark |
| `lime-300` | `#C4F55B` | Accent **text** and icons on dark surfaces |
| `lime-400` | `#B2EE2F` | **`accent-solid`** — primary fill, focus ring, active indicator |
| `lime-500` | `#9BD41C` | Primary hover |
| `lime-600` | `#7FAF14` | Primary pressed |
| `lime-700` | `#5F830F` | Accent on light theme fills |
| `lime-900` | `#2E400B` | Accent-tinted surface on dark (`≤ 10%` alpha in practice) |

**Violet — secondary accent, controlled.**

| Step | Value | Sanctioned use |
|---|---|---|
| `violet-300` | `#C6B8FD` | Intelligence/identity text and icons on dark |
| `violet-400` | `#A78BFA` | Second categorical series; Digital Twin identity mark |
| `violet-500` | `#8B5CF6` | Violet fill (rare — twin state chips, AI-assisted badges) |
| `violet-700` | `#6D28D9` | Violet on light theme |

**Violet budget.** Violet is permitted for exactly four semantic families and
nothing else: (a) Digital Twin / Voice Clone identity, (b) AI-assisted or
model-derived output provenance, (c) the second series in a two-series chart,
(d) the knowledge/retrieval domain in Studio. Any other use is a defect.

**Accent budget.** At most **one** `accent-solid` fill per viewport region
(topbar, rail, page header, each card, each drawer). A screen with two primary
buttons visible at once has the wrong primary action.

### 4.6 Light theme

Light exists for environments that demand it (projection, print, user
preference). It is a remap of the same semantic tokens; no component changes.

| Semantic | Dark | Light |
|---|---|---|
| `bg-base` | `#08090A` | `#F7F8F8` |
| `surface-1` | `#0E1012` | `#FFFFFF` |
| `surface-2` | `#15181A` | `#F1F3F3` |
| `surface-3` | `#1C2023` | `#E7EAEA` |
| `surface-4` | `#24282C` | `#FFFFFF` + `shadow-3` |
| `border-subtle` | `rgba(255,255,255,.06)` | `rgba(8,9,10,.08)` |
| `border-default` | `rgba(255,255,255,.10)` | `rgba(8,9,10,.14)` |
| `text-primary` | `#F3F6F7` | `#0E1012` |
| `text-secondary` | `#A9B2B8` | `#4B5359` |
| `text-tertiary` | `#727C83` | `#6B747A` |
| `accent-solid` | `lime-400` | `lime-700` |
| `text-on-accent` | `#0A0D04` | `#FFFFFF` |

Theme resolution order: explicit user choice → `prefers-color-scheme` → dark.
The choice is stored server-side on the user profile so it survives devices.

---

## 5. Semantic colours

### 5.1 Status palette

Distinct from the lime accent on purpose: success must never be confused with
"this is the primary action".

| Role | Text/icon on dark | Fill | Tinted surface (8%) |
|---|---|---|---|
| `status-success` | `#4FDCA0` | `#25C489` | `rgba(37,196,137,.10)` |
| `status-warning` | `#F7C465` | `#E9A426` | `rgba(233,164,38,.10)` |
| `status-danger` | `#FF7A78` | `#F4514E` | `rgba(244,81,78,.10)` |
| `status-info` | `#7FC0FF` | `#3E8FE8` | `rgba(62,143,232,.10)` |
| `status-neutral` | `#A9B2B8` | `#5A6167` | `rgba(169,178,184,.08)` |
| `status-active` | `lime-300` | `lime-400` | `rgba(178,238,47,.10)` |
| `status-identity` | `violet-300` | `violet-500` | `rgba(139,92,246,.10)` |

### 5.2 Colour is never the only channel

Every status carries **shape + text**: a 6px indicator whose form differs
(filled dot = terminal, ring = in flight, half = waiting on a human, square =
blocked, triangle = failed) plus the state label. This satisfies WCAG 2.2
1.4.1 and survives greyscale printing.

### 5.3 Domain colour semantics

| Domain | Colour | Rationale |
|---|---|---|
| Content pipeline | neutral + `status-*` | The pipeline is state, not brand |
| Consumption / entitlement | lime | Consumption is the value meter |
| Provider cost / contribution | violet + amber | Internal economics, Control only |
| Identity (Twin, Voice, Consent) | violet | Governance weight, distinct from pipeline |
| Knowledge / retrieval | violet-300 on `surface-2` | Same family as identity: "what VYRA knows" |
| Performance | `viz-*` categorical | Platform-scoped, never brand-scoped |

### 5.4 Data-visualisation palette

Ordered. Series *n* always takes `viz-n`; a chart never re-orders its palette
between renders.

| Token | Value |
|---|---|
| `viz-1` | `#B2EE2F` (lime-400) |
| `viz-2` | `#A78BFA` (violet-400) |
| `viz-3` | `#4FD1E8` |
| `viz-4` | `#F7C465` |
| `viz-5` | `#7FC0FF` |
| `viz-6` | `#F472B6` |
| `viz-7` | `#4FDCA0` |
| `viz-8` | `#94A3B8` |

Sequential (single-metric heat): `#1C2023 → #33450E → #5F830F → #9BD41C → #C4F55B`.
Diverging (contribution, variance): `#F4514E ← #5A6167 → #B2EE2F`.

Platform channels keep a **fixed** assignment so a colour means the same channel
on every screen: Instagram `viz-6`, TikTok `viz-3`, YouTube `viz-4`,
LinkedIn `viz-5`, Facebook `viz-2`.

### 5.5 Contrast contract

| Pair | Minimum |
|---|---|
| Body text on any surface | 4.5:1 |
| Display and heading ≥ 24px | 3:1 (we hold ≥ 7:1 in practice) |
| Icons and control boundaries | 3:1 |
| Chart series against plot background | 3:1 |
| Adjacent chart series | 1.5:1 luminance **and** distinguishable in deuteranopia simulation |
| Focus ring against both its inner and outer neighbours | 3:1 |

### 5.6 Gradient budget

Gradients are permitted in exactly two places:

1. **Single-series area fill** — `accent-solid` at 14% → 0% over the plot height.
2. **Media letterbox scrim** — `rgba(5,6,7,0)` → `rgba(5,6,7,.85)` behind player
   controls, for legibility over arbitrary video frames.

Everywhere else, a gradient is a defect. No mesh gradients, no gradient text,
no gradient borders, no gradient buttons.

---

## 6. Typography scale

### 6.1 Families

| Role | Family | Fallback stack |
|---|---|---|
| Display / UI | **Geist Sans** (variable, self-hosted) | `ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Data / identifiers | **Geist Mono** (variable, self-hosted) | `ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace` |

One family carries the whole product. Editorial force comes from **scale,
weight and tracking contrast**, not from a second typeface (PD-03). Both faces
are self-hosted (`next/font/local`) — no external font host, no layout shift,
no third-party request from a page that renders tenant data.

### 6.2 Scale

`size / line-height / tracking / weight`. Tabular figures
(`font-variant-numeric: tabular-nums`) are **mandatory** on every `metric-*` and
`mono-*` role and on every numeric table cell.

| Role | Size | Line | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `display-2xl` | 72px | 1.00 | -0.04em | 620 | Marketing-grade hero inside product (rare: onboarding completion) |
| `display-xl` | 56px | 1.02 | -0.035em | 620 | Empty-state hero, onboarding step title |
| `display-lg` | 44px | 1.05 | -0.03em | 600 | Screen hero on `portal-dashboard` |
| `metric-xl` | 40px | 1.00 | -0.03em | 600 | Primary KPI |
| `metric-lg` | 32px | 1.05 | -0.025em | 600 | Secondary KPI, drawer headline number |
| `metric-md` | 24px | 1.10 | -0.02em | 600 | Tile number, table summary row |
| `heading-xl` | 28px | 1.15 | -0.02em | 600 | Page title |
| `heading-lg` | 22px | 1.20 | -0.015em | 600 | Section title |
| `heading-md` | 18px | 1.30 | -0.01em | 600 | Card title, drawer title |
| `heading-sm` | 15px | 1.35 | -0.005em | 600 | Sub-section, table group header |
| `body-lg` | 16px | 1.55 | 0 | 400 | Script body, long-form reading |
| `body-md` | 14px | 1.55 | 0 | 400 | Default UI text |
| `body-sm` | 13px | 1.50 | 0 | 400 | Helper text, table cell secondary |
| `label-md` | 13px | 1.20 | 0.005em | 500 | Form label, button, tab |
| `label-sm` | 11px | 1.20 | 0.06em | 600 | **Eyebrow** — uppercase section/kicker label |
| `mono-md` | 13px | 1.50 | 0 | 400 | Ids, correlation ids, checksums |
| `mono-sm` | 11px | 1.45 | 0.02em | 400 | Axis labels, timestamps, chart ticks |

### 6.3 Editorial hierarchy rules

1. **Eyebrow → headline → support.** Every page header and every metric block
   uses `label-sm` (uppercase, `text-tertiary`) above the headline. This one
   pattern carries most of the editorial character of the product.
2. **Never more than three type roles in one block.**
3. **Measure is capped at 72ch** for `body-*`; script reading is capped at 68ch.
4. **Never centre body text.** Centring is permitted only for empty-state heroes
   and dialog titles.
5. **Numbers never wrap.** A metric that cannot fit is abbreviated with a
   locale-aware compact notation and carries the exact value in its `title`
   and in an accessible label.
6. **Never letterspace lowercase body text.** Tracking adjustments apply to
   display sizes (negative) and to `label-sm` (positive) only.

### 6.4 Localisation

Portuguese (pt-BR) is the first locale; the type scale is validated against
pt-BR string lengths, which run ~15–20% longer than English. No layout may
depend on a string fitting on one line; every label region declares its
truncation strategy (§14.5).

---

## 7. Spacing system

### 7.1 Base

4px base unit. Nothing in the product uses a value outside this scale.

| Token | px | Typical use |
|---|---|---|
| `space-0` | 0 | — |
| `space-1` | 2 | Icon optical nudge, chip inner |
| `space-2` | 4 | Icon↔label |
| `space-3` | 8 | Inside compact controls |
| `space-4` | 12 | Control padding, chip padding |
| `space-5` | 16 | Card padding (compact), stack gap |
| `space-6` | 20 | Card padding (default) |
| `space-7` | 24 | Card padding (comfortable), grid gutter |
| `space-8` | 32 | Section gap |
| `space-9` | 40 | Page header ↔ body |
| `space-10` | 48 | Major section gap |
| `space-11` | 64 | Page top padding (desktop) |
| `space-12` | 80 | Empty-state vertical rhythm |
| `space-13` | 96 | Onboarding hero |
| `space-14` | 128 | Full-bleed editorial break |

### 7.2 Vertical rhythm

Content stacks use exactly three gaps: `space-5` inside a component,
`space-8` between components, `space-10` between page sections. A fourth value
means the hierarchy is wrong.

### 7.3 Page padding

| Breakpoint | Horizontal | Top |
|---|---|---|
| `< 640` | `space-5` (16) | `space-7` (24) |
| `640–1023` | `space-7` (24) | `space-8` (32) |
| `1024–1439` | `space-8` (32) | `space-9` (40) |
| `≥ 1440` | `space-10` (48) | `space-11` (64) |

### 7.4 Density modes

Density is a token override applied at the surface root, not a component fork.

| Token | Comfortable (Portal) | Dense (Studio / Control) |
|---|---|---|
| `--vyra-control-h` | 40px | 36px |
| `--vyra-row-h` | 52px | 44px |
| `--vyra-row-h-compact` | 44px | 36px |
| `--vyra-card-pad` | `space-7` (24) | `space-6` (20) |
| `--vyra-stack-gap` | `space-8` (32) | `space-7` (24) |
| `--vyra-font-body` | `body-md` (14) | `body-sm` (13) |

Touch targets remain ≥ 24×24 CSS px in every mode and ≥ 44×44 on
coarse pointers (§23.4), regardless of density.

---

## 8. Grid and layout

### 8.1 Breakpoints

| Name | Min width | Primary target |
|---|---|---|
| `xs` | 0 | Phone portrait |
| `sm` | 640 | Phone landscape / small tablet |
| `md` | 768 | Tablet portrait |
| `lg` | 1024 | Tablet landscape / small laptop — **Studio & Control minimum** |
| `xl` | 1280 | Laptop |
| `2xl` | 1536 | Desktop |
| `3xl` | 1760 | Wide desktop — content stops growing, gutters absorb |

### 8.2 Grid

12 columns; gutter `space-7` (24) at `≥ lg`, `space-5` (16) below.
Content max width **1440px**; long-form reading column max **760px**;
the grid is left-aligned within the content area, never centred, so the rail
and the content share one optical axis.

### 8.3 Standard layouts

| Layout | Composition | Used by |
|---|---|---|
| `L-dashboard` | 12-col; KPI row (4×3 or 3×4); then 8/4 split | `portal-dashboard`, `studio-overview`, `control-status` |
| `L-collection` | Full-width table/board + optional 3-col filter rail | list screens |
| `L-object` | 8-col primary + 4-col meta rail; tabs under the header | detail screens |
| `L-workspace` | 3-pane: 3-col context / 6-col canvas / 3-col inspector | `studio-script`, `studio-qa`, approval screens |
| `L-focus` | Single 760px column, no rail | auth, onboarding, consent |
| `L-board` | Horizontally scrolling lanes, sticky lane headers | `studio-queue`, `studio-publishing`, `portal-content` (board view) |
| `L-calendar` | Month grid / week columns / agenda list | `portal-calendar`, `studio-calendar` |

### 8.4 Layout invariants

1. The page body never scrolls horizontally. Wide content scrolls **inside its
   own** `overflow-x: auto` region with a visible edge fade.
2. Sticky elements are limited to: topbar, table header, lane header, decision
   bar, drawer header/footer. Nothing else sticks.
3. The primary action of a screen is visible without scrolling at every
   breakpoint. On mobile it becomes a docked bar (§22.3).
4. Empty regions collapse; a card never renders as an empty rectangle (§19).

---

## 9. Radius, border and elevation

### 9.1 Radius

| Token | px | Applied to |
|---|---|---|
| `radius-xs` | 2 | Indicator bars, progress meters, chart bars |
| `radius-sm` | 4 | Chips, tags, checkbox |
| `radius-md` | 6 | Inputs, selects, small buttons |
| `radius-lg` | 8 | Buttons, tooltips, menu items |
| `radius-xl` | 12 | Cards, panels, table container |
| `radius-2xl` | 16 | Dialogs, drawers, media frames |
| `radius-full` | 9999 | Avatars, status pills, toggle |

Nested radius rule: an inner radius equals the outer radius minus its padding,
floored at `radius-sm`. Concentric corners are a quiet premium signal; mismatched
ones read as a template.

### 9.2 Border

One weight (1px). Two exceptions, both indicators: the 2px active rail marker
and the 2px focus ring. Borders carry structure; fills carry state.

### 9.3 Elevation

On carbon, elevation is **surface lightness first, shadow only when floating**.

| Level | Composition | Applied to |
|---|---|---|
| `e0` | `bg-base`, no border | Page background |
| `e1` | `surface-1` + `border-subtle` | Rail, topbar, page panels |
| `e2` | `surface-2` + `border-subtle` | Cards, inputs, table header |
| `e3` | `surface-3` + `border-default` + `shadow-3` | Tooltip, popover, dropdown |
| `e4` | `surface-4` + `border-default` + `shadow-4` | Drawer, dialog, command palette |
| `e5` | `surface-4` + `border-strong` + `shadow-4` + scrim | Destructive confirmation |

```
--vyra-shadow-3: 0 6px 20px -6px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.4);
--vyra-shadow-4: 0 24px 64px -16px rgba(0,0,0,.70), 0 2px 8px rgba(0,0,0,.5);
```

No shadow is ever applied to a card, a table, a chart or an input. A shadow on
flat content is the single fastest way to look like a template (PD-04).

### 9.4 Glow — functional only

Four sanctioned glows. Any fifth is a defect.

| Name | Composition | Trigger |
|---|---|---|
| `glow-focus` | `0 0 0 2px var(--vyra-bg-base), 0 0 0 4px var(--vyra-lime-400)` | Keyboard focus |
| `glow-accent` | `0 0 24px -8px rgba(178,238,47,.55)` | Primary CTA hover; live indicator |
| `glow-live` | `0 0 0 3px rgba(178,238,47,.14)` pulsing 2s | A job actively running, ≤ 1 per region |
| `glow-danger` | `0 0 0 3px rgba(244,81,78,.18)` | Destructive confirm focus |

`glow-live` is the only animated glow, is capped at one instance per viewport
region, and is replaced by a static ring under `prefers-reduced-motion`.

### 9.5 Glassmorphism budget

Backdrop blur is permitted in exactly two places, both at `blur(8px)` maximum:
the modal scrim and the media-player control scrim. No blurred cards, no frosted
panels, no translucent rail.

---

## 10. Motion system

### 10.1 Durations

| Token | ms | Use |
|---|---|---|
| `dur-instant` | 80 | Hover, active, checkbox |
| `dur-fast` | 120 | Tooltip, colour and border transitions |
| `dur-base` | 160 | Menu, popover, tab underline, chip |
| `dur-slow` | 240 | Drawer, dialog, sheet, lane reflow |
| `dur-slower` | 320 | Page-level transition, chart first-draw |
| `dur-deliberate` | 480 | Irreversible confirmation reveal only |

Nothing exceeds 480ms except an indeterminate progress indicator.

### 10.2 Easing

```
--vyra-ease-standard:   cubic-bezier(0.20, 0, 0, 1);
--vyra-ease-decelerate: cubic-bezier(0, 0, 0, 1);
--vyra-ease-accelerate: cubic-bezier(0.30, 0, 1, 1);
--vyra-ease-emphasized: cubic-bezier(0.16, 1, 0.30, 1);
```

Enter uses `decelerate`, exit uses `accelerate`, movement within the page uses
`standard`, a drop after a drag uses `emphasized`.

### 10.3 Animatable properties

`transform` and `opacity` only. Animating `height`, `width`, `top`, `left`,
`box-shadow`, `filter` or `background-position` is a defect; height changes use
a grid-template-rows or scale transform technique.

### 10.4 Reduced motion

`prefers-reduced-motion: reduce` sets every duration to `1ms` **except** opacity
cross-fades, which stay at `dur-fast`. Additionally:

- `glow-live` becomes a static ring.
- Skeleton shimmer becomes a flat `surface-2` block.
- Chart draw-in is skipped; the final state renders immediately.
- Drag-and-drop retains its keyboard equivalent (§26.4) with no fly animation.
- Auto-advancing anything is prohibited product-wide, reduced motion or not.

### 10.5 Motion vocabulary

| Pattern | Behaviour |
|---|---|
| **Reveal** | Opacity 0→1 + translateY 4px→0, `dur-base`, `decelerate` |
| **Drawer** | translateX 100%→0, `dur-slow`, `emphasized`; scrim opacity `dur-base` |
| **Dialog** | scale .98→1 + opacity, `dur-slow`, `emphasized` |
| **State change** | Status chip cross-fades label and indicator in `dur-fast`; the row flashes `surface-3` for `dur-slow` once |
| **Value change** | A metric that changes counts to its new value over `dur-slower` **only** if the delta is user-initiated; background updates swap without counting |
| **Live** | `glow-live` pulse on the single active job indicator |
| **Drag** | Item lifts to `e3` at `dur-instant`; placeholder resizes at `dur-base`; drop settles at `dur-slow`/`emphasized` |
| **List reflow** | FLIP transform, `dur-base`, capped at 24 animated rows; beyond that, no animation |

### 10.6 Implementation

`Motion for React` is the sanctioned engine for orchestrated and gesture-driven
motion (drawer, dialog, list reflow, drag). Simple state transitions use CSS
transitions on Tailwind classes. A component may not use both for the same
property. See §3.2 of ADR-0035.

---

## 11. Iconography

- **Library**: Lucide, and only Lucide (`ADR-0003`). No second icon set, no
  brand-logo set beyond the five channel marks in §11.4.
- **Sizes**: 14 (inline in `body-sm`), 16 (default in controls), 20 (rail, page
  header), 24 (empty state, media controls). Stroke width 1.5 at all sizes;
  1.25 at 24px+ to keep optical weight even.
- **Colour**: icons inherit `currentColor`. A coloured icon means the colour
  carries meaning (status, channel), never decoration.
- **Naming**: every icon usage is wrapped by a semantic component
  (`<StatusIcon state="RENDERING">`), never imported directly into a screen.
  This is what makes a future icon-set change a one-file change.
- **Accessibility**: decorative icons are `aria-hidden`. An icon-only control
  always has an `aria-label` **and** a tooltip; the tooltip text and the label
  are the same string.

### 11.4 Channel marks

Instagram, TikTok, YouTube, LinkedIn and Facebook marks are the only
third-party logos in the product. They render monochrome `text-secondary` at
rest and take their fixed `viz-*` colour when they identify a data series
(§5.4). They never appear at a size below 16px and never inside a filled chip.

### 11.5 The VYRA mark

A single glyph, monochrome, rendered in `text-primary` in the topbar and in
`accent-solid` on the auth and onboarding screens only. It is never animated,
never gradient-filled, and never accompanied by a wordmark inside the product
chrome — the surface label carries the words.

---

## 12. Data visualisation

### 12.1 Engine

**shadcn Charts on Recharts** (ADR-0035). Charts are wrapped by
`packages/ui` chart primitives; a screen never imports Recharts directly.

### 12.2 Chart selection

| Question | Chart |
|---|---|
| How did one metric move over time? | Line (single series) or area (single series, gradient per §5.6) |
| How do 2–5 series compare over time? | Multi-line; never stacked area |
| How do categories compare at one moment? | Horizontal bar, sorted descending |
| What is the composition of a whole? | Stacked horizontal bar — **never a pie or donut** |
| How does one value sit against a target? | Meter (linear, with target tick) |
| What is the trend inside a table row or tile? | Sparkline, no axes, no tooltip |
| How dense is activity over a period? | Calendar heat grid (sequential palette) |

Prohibited: pie, donut, radar, 3D anything, dual y-axes, stacked area,
truncated y-axis on a bar chart.

### 12.3 Chart anatomy

- Plot background: transparent over `surface-2`.
- Grid: horizontal only, `border-subtle`, no vertical grid, no axis lines.
- Ticks: `mono-sm`, `text-tertiary`, maximum 6 on y, adaptive on x.
- Series labels: inline at the end of the line when ≤ 3 series; a legend appears
  only at ≥ 4 series and is a wrapping chip row above the plot.
- Tooltip: `e3` surface, `radius-lg`, series swatch + label + tabular value,
  keyboard reachable, follows the crosshair, never covers the hovered point.
- Empty plot: the frame renders with axes and the empty state (§19) inside it —
  the chart never disappears.

### 12.4 Truth rules (non-negotiable)

1. **A gap is a gap.** `performance.md` §5 and `P14.05` make partial collection a
   first-class outcome. A missing value renders as a **discontinuity** in the
   line and a hatched cell in a table. It is never zero, never interpolated.
2. **Snapshots are labelled.** Every performance chart carries a
   `Collected {relative}` stamp in `mono-sm` and a tooltip with the absolute
   timestamp and the collection bucket, because `FF-16`/`FR-PF05` guarantee the
   read path never calls a provider — the user must know the data's age.
3. **Cross-platform aggregates are labelled `indicative`** (`ASM-PF01`) with an
   info affordance explaining that platform metric definitions differ.
4. **No provider text on a chart.** Error and gap explanations use VYRA
   vocabulary and the stable `code` values from `api-contracts.md` §1.1.

### 12.5 Accessibility of charts

Every chart ships a `role="img"` container with a generated summary label, a
keyboard-navigable data table equivalent behind a "View as table" disclosure,
and series that are distinguishable by dash pattern or point marker as well as
colour when a chart carries ≥ 3 series.

---

## 13. Forms

### 13.1 Structure

Label above the control (`label-md`, `text-secondary`), control, then help or
error text (`body-sm`). No placeholder-as-label, ever. Optional fields are
marked `Optional` in `text-tertiary`; required fields are unmarked — because
in VYRA forms most fields are required, and marking the minority is quieter.
Where the majority is optional (the content request, `api-contracts.md` §3.1 —
only `objective` and `channel` are required) the polarity inverts and required
fields carry a `Required` tag.

### 13.2 Sizing and states

| State | Treatment |
|---|---|
| Rest | `surface-2`, `border-default`, `text-primary` |
| Hover | `border-strong` |
| Focus | `border-accent` + `glow-focus` |
| Filled | identical to rest — a value is not a state |
| Invalid | `border-danger`, danger icon in the field, error text below |
| Disabled | `surface-1`, `text-disabled`, cursor `not-allowed`, **plus** a reason |
| Read-only | `bg-sunken`, `border-subtle`, selectable text, no focus ring |
| Loading | control retains size, inline 16px spinner right, `aria-busy` |

Control height comes from `--vyra-control-h` (§7.4). Multi-line inputs start at
3 rows and auto-grow to 12, then scroll.

### 13.3 Validation

- **Never validate on keystroke before first blur.** After the first blur of a
  field, live re-validation is allowed and is how the error clears.
- On submit, focus moves to the first invalid field and a form-level summary
  appears above the form as an `alert` region listing each error as a link to
  its field.
- Server errors are mapped from the RFC 9457 `code` to a VYRA sentence.
  The raw `detail` is never rendered; the `code` is shown as a `mono-sm` chip
  next to the message so support can act on it.
- `validation_failed` renders field-scoped; `conflict`,
  `state_transition_not_allowed`, `entitlement_exhausted`, `consent_revoked`,
  `capability_unsupported`, `provider_unavailable`, `rate_limited` and
  `connection_invalid` render at form level with the specific next action
  from §21.4.

### 13.4 Submission

Every submit button shows an inline spinner and disables **itself only** — the
form fields remain readable. Forms that create billable or external effects
send `Idempotency-Key` (`api-contracts.md` §1); a retry of the same submission
reuses the key, and an `idempotency_key_reuse` response resolves to the existing
object rather than showing an error.

### 13.5 Destructive and irreversible forms

A destructive form requires a typed confirmation of the object's name when the
effect is irreversible (consent revocation, twin revocation, tenant suspension).
The confirm button stays disabled until the string matches exactly, is styled
`danger`, and carries the consequence sentence directly above it — not in a
tooltip.

### 13.6 Autosave

Autosave exists in exactly one place: the Studio script editor (§25). Everywhere
else, a form is explicit. An autosaving surface displays `Saved {relative}` in
`mono-sm` and never a toast.

---

## 14. Tables

### 14.1 Engine

**TanStack Table** headless, wrapped by `packages/ui` data-grid primitives
(ADR-0035). Simple, non-interactive tabular content uses the plain `<table>`
primitive — TanStack is for grids with sorting, column control, selection,
pinning or virtualisation.

### 14.2 Anatomy

- Container: `radius-xl`, `border-subtle`, `surface-1`. No shadow.
- Header: `surface-2`, sticky, `label-sm` uppercase `text-tertiary`, 40px tall.
- Rows: `--vyra-row-h`, separated by `border-subtle`. **No zebra striping.**
- Hover: `surface-2`. Selected: `surface-3` + 2px `accent` left indicator.
- Numeric columns: right-aligned, `tabular-nums`. Identifier columns: `mono-md`.
- Row actions: a right-pinned column with an overflow menu; the primary row
  action also appears on hover as an inline button and is always reachable by
  keyboard regardless of hover.

### 14.3 Interaction

| Capability | Rule |
|---|---|
| Sort | Click header or `Enter`/`Space`; sort state is in the URL |
| Filter | Filter chips above the table; every active filter is removable individually and collectively; filter state is in the URL |
| Column control | Show/hide + reorder in a popover; persisted per user per table |
| Pinning | First column and the actions column pin by default; user may pin up to 3 |
| Selection | Checkbox column; `Shift+Click` range; header checkbox selects the loaded page only and says so |
| Bulk actions | A docked bar replaces the context bar, states the count, and offers only actions valid for **every** selected row |
| Pagination | **Cursor-based** (`api-contracts.md` §1): `Load more` for feeds, `Newer/Older` for ledgers. No page numbers, no total count unless the API returns one |
| Row open | Click opens the drawer; `Cmd/Ctrl+Click` opens the full page; `Enter` on a focused row opens the drawer |
| Density | Table-local density toggle (default/compact) that maps to `--vyra-row-h*` |

### 14.4 Virtualisation

Row virtualisation engages above 200 rows. A virtualised table keeps a real
`<table>` semantic structure with `aria-rowcount`, and its keyboard navigation
(`↑ ↓ Home End PageUp PageDown`) works across the virtual boundary.

### 14.5 Truncation

Each column declares one strategy: `truncate-end` (default, with a title
tooltip), `truncate-middle` (identifiers, paths), `wrap-2` (titles, max two
lines) or `none` (numbers, dates, status). A truncated cell is always
recoverable — via the drawer, the tooltip, or a copy action.

### 14.6 Table states

Loading, empty, filtered-empty and error render **inside the table frame**, with
the header still visible so the user keeps their column and filter context
(§18–§20).

---

## 15. Cards and surfaces

### 15.1 Card anatomy

```
┌ e2 · radius-xl · border-subtle · pad --vyra-card-pad ────────────┐
│ EYEBROW label-sm text-tertiary                    [action]       │
│ Title heading-md                                                 │
│ ─ optional divider border-subtle ──────────────────────────────  │
│ body                                                             │
│ ─ optional footer, text-tertiary body-sm ─────────────────────── │
└──────────────────────────────────────────────────────────────────┘
```

### 15.2 Card variants

| Variant | Use |
|---|---|
| `panel` | Default container for a section of content |
| `metric` | One KPI: eyebrow, `metric-xl` value, delta, optional sparkline |
| `object` | A navigable object summary (content item, client, twin) |
| `action` | A card whose entire body is one decision; has exactly one primary button |
| `inset` | `bg-sunken`, no border — used **inside** a card for code, transcript, raw payload |

### 15.3 Metric card rules

Eyebrow label, `metric-xl` value with tabular figures, an optional delta chip
(`status-success`/`status-danger` + arrow + percentage), an optional 40px
sparkline, and an optional footnote naming the period. A metric card never
contains a second metric of equal weight — that is a metric row.

### 15.4 The nesting rule

**A card may contain a card only when the inner element is an independently
navigable or actionable object.** Grouping without navigation uses a section
heading and a divider, not a nested surface. Maximum nesting depth is 2, and at
depth 2 the inner surface steps only one level (`surface-2` → `surface-3`) and
drops its shadow entirely.

### 15.5 Section without a card

Most page sections need no card at all: an eyebrow, a `heading-lg`, a divider
and the content, directly on `bg-base`. This is the default; a card is a
deliberate act of grouping.

---

## 16. Dialogs and drawers

### 16.1 Choosing the container

| Container | When | Width |
|---|---|---|
| **Dialog** | A single decision or a ≤ 3-field form; blocks the page | 440 / 560 / 720 |
| **Drawer** (right) | Object detail, multi-field edit, side-by-side reference; keeps page context | 480 / 640 / 840 |
| **Sheet** (bottom) | The mobile form of both, at `< md` | 92vh max |
| **Popover** | Non-blocking selection, filters, column control | ≤ 360 |
| **Full page** | Anything requiring more than 840px or its own URL | — |

### 16.2 Rules

1. **No stacking.** One dialog or one drawer at a time. A dialog opened from a
   drawer replaces it and restores it on close.
2. **Focus** moves to the container on open (to the heading, not the first
   field, unless the container is a single-field form), is trapped, and returns
   to the invoking element on close.
3. `Escape` closes, except when a form inside is dirty — then it prompts.
4. Scrim: `rgba(4,5,6,.72)` + `backdrop-blur(8px)`, fade in `dur-base`.
5. Header and footer are sticky; only the body scrolls.
6. A drawer that represents an object has its own URL
   (`?item=<id>`) so it is linkable and survives refresh.
7. Destructive dialogs use `e5`, place the destructive button on the right,
   never focus it by default, and state the consequence in a sentence.

---

## 17. Toast and feedback

### 17.1 Placement and behaviour

Bottom-right at `≥ md`, top-centre below the topbar at `< md`. Maximum 3
visible; older toasts collapse into "+n more". Default 5s; a toast with an
action gets 8s; an error toast is sticky until dismissed.

### 17.2 What may and may not be a toast

| May | May not |
|---|---|
| Asynchronous success ("Publication scheduled") | Form validation errors — those are inline |
| Background completion ("Video ready") | Destructive confirmations — those are dialogs |
| Undoable action + `Undo` | Anything the user must read to proceed |
| Copy-to-clipboard confirmation | Anything that repeats what the screen already shows |

### 17.3 Feedback hierarchy

1. **Inline** — next to the control that caused it (validation, field errors).
2. **Region banner** — inside the card or section that is affected (a blocked
   item, a stale snapshot, a degraded provider).
3. **Page banner** — under the page header, for conditions that affect the whole
   screen (entitlement exhausted, subscription suspended, consent revoked).
4. **Toast** — transient, off to the side, never load-bearing.
5. **Dialog** — blocking, only for decisions.

### 17.4 Live regions

Async outcomes are announced through `aria-live="polite"`; errors through
`role="alert"`. Every toast is mirrored into the live region. State changes
arriving from the server while a screen is open announce once, coalesced, at
most every 10 seconds.

---

## 18. Loading and skeletons

### 18.1 Selection

| Situation | Treatment |
|---|---|
| Layout is known, data pending | **Skeleton** matching the real geometry |
| Layout unknown / first navigation | Route-level skeleton of the shell + page header |
| Inside a button after submit | 16px inline spinner, button keeps its width |
| Inline value refresh | Opacity to 0.6, no spinner |
| Determinate long job (upload, ingestion) | Linear progress with a percentage and a cancel affordance where cancel is legal |
| Indeterminate long job (render, publish) | State chip with `glow-live` + elapsed time, **never** a fake progress bar |

### 18.2 Skeleton rules

- Built from the same layout primitives as the real content, so geometry cannot
  drift. A skeleton that does not match its content is a defect.
- `surface-2` blocks, `radius-md`, with a 1.4s shimmer that is **disabled**
  under `prefers-reduced-motion`.
- Text skeletons use 3 line widths (100%, 92%, 64%) and never more than 4 lines.
- Minimum display 200ms (to avoid a flash), maximum 8s before the region
  switches to the error state with a retry (§20).
- Never a full-page spinner. Never a skeleton for something that arrives in
  under 200ms — those regions render optimistically.

### 18.3 Progressive disclosure

Server components stream: the page header, navigation and static structure paint
first; each data region resolves independently with its own boundary. `NFR-03`
(< 3s for critical screens) is measured to the first meaningful region, and the
budget is asserted in `P16.09`.

---

## 19. Empty states

### 19.1 The four kinds

| Kind | Meaning | Composition |
|---|---|---|
| `first-run` | The user has never created this | Geometric mark, `display-xl` headline, one sentence, **one** primary action, optional secondary "learn what this is" |
| `filtered` | Data exists, this filter excludes it | `heading-md`, the active filter summary, `Clear filters` as primary |
| `absent-by-design` | Nothing here yet because the pipeline has not reached it | `heading-md`, the explanation in state vocabulary, **no action** |
| `restricted` | The session may see the region but not its contents | `heading-md`, one sentence, no action, no hint about what exists |

### 19.2 Rules

- The mark is a geometric composition built from VYRA tokens. **No stock
  illustration, no 3D render, no mascot.**
- Copy is specific: never "No data". Always "No content requests yet" / "No
  published items in this period".
- A first-run empty state names the value, not the mechanism: *"Request your
  first piece of content and VYRA takes it from briefing to publication."*
- An empty state inside a table or chart keeps the frame (§12.3, §14.6).
- `absent-by-design` and `restricted` must be indistinguishable from each other
  when the difference would disclose existence (`api-contracts.md` §2).

---

## 20. Error states

### 20.1 Scopes

| Scope | Container | Example |
|---|---|---|
| Field | Inline below the control | `validation_failed` on `reason` |
| Form | Alert region above the form | `state_transition_not_allowed` |
| Region | Banner inside the card/section, content replaced by retry | A chart whose snapshot query failed |
| Page | Full-page state under the shell | `not_found`, `forbidden`, 5xx |
| Global | Page banner under the topbar | Session expiring, degraded provider (Studio/Control only) |

### 20.2 Anatomy

Icon (`status-danger` or `status-warning`) · a sentence saying **what happened**
in VYRA vocabulary · a sentence saying **what to do** · the primary recovery
action · a `mono-sm` chip with the stable `code` · a `mono-sm` copyable
`X-Correlation-Id`.

### 20.3 Rules

1. **Never render provider or vendor text.** `FF-20` keeps it out of logs; the
   UI keeps it off the screen. Only the stable `code` set from
   `api-contracts.md` §1.1 reaches a user.
2. **Never blame the user** for a system failure, and never say "unexpected".
3. **A retry is offered only where a retry is safe.** Idempotent reads always;
   writes only with the original `Idempotency-Key`.
4. **`not_found` and cross-tenant are identical** — same layout, same copy, same
   status, no timing difference introduced by the client.
5. **`forbidden` never lists what the session lacks.**
6. Errors reaching a user are counted as a metric (`P16.01`); the UI emits the
   `code` and the screen id, never the payload.

---

## 21. Status language

### 21.1 The single vocabulary

`ContentItem.state` is the product's spine. These labels are canonical for
Portal; Studio and Control add the technical suffix in parentheses where noted.
No screen invents a synonym.

| State | Portal label (pt-BR) | Portal label (en) | Tone | Indicator | Who acts next |
|---|---|---|---|---|---|
| `REQUESTED` | Solicitado | Requested | neutral | ring | VYRA |
| `BRIEFING` | Em briefing | Briefing | info | ring | VYRA |
| `SCRIPTING` | Em roteiro | Writing script | info | ring | VYRA |
| `SCRIPT_REVIEW` | Aguardando sua aprovação | Awaiting your approval | **active** | half | **You** |
| `SCRIPT_APPROVED` | Roteiro aprovado | Script approved | success | dot | VYRA |
| `VOICE_GENERATION` | Gerando voz | Generating voice | info | ring | VYRA |
| `RENDER_QUEUED` | Na fila de vídeo | Queued for video | info | ring | VYRA |
| `RENDERING` | Gerando vídeo | Rendering video | info | ring + live | VYRA |
| `INGESTING` | Finalizando | Finalising | info | ring | VYRA |
| `QA` | Em verificação | In quality check | info | ring | VYRA |
| `VIDEO_REVIEW` | Aguardando sua aprovação | Awaiting your approval | **active** | half | **You** |
| `READY` | Pronto para publicar | Ready to publish | success | dot | **You** |
| `SCHEDULED` | Agendado | Scheduled | success | dot | VYRA |
| `PUBLISHING` | Publicando | Publishing | info | ring + live | VYRA |
| `PUBLISHED` | Publicado | Published | success | dot filled | — |
| `ARCHIVED` | Arquivado | Archived | neutral | dot hollow | — |
| `REVISION_REQUESTED` | Em revisão | In revision | warning | half | VYRA |
| `REJECTED` | Recusado | Rejected | danger | triangle | — |
| `FAILED` | Falhou | Failed | danger | triangle | VYRA |
| `CANCELLED` | Cancelado | Cancelled | neutral | dot hollow | — |
| `BLOCKED` | Bloqueado | Blocked | danger | square | **You** or VYRA (reason-dependent) |

### 21.2 The two states that matter most

`SCRIPT_REVIEW` and `VIDEO_REVIEW` are the only states where the client is the
bottleneck. They use the `status-active` lime treatment, sort first in every
list by default, drive the dashboard action rail, and are the only states that
raise a `needs you` notification. Nothing else in the Portal is lime.

### 21.3 `BLOCKED` is never opaque

`BLOCKED` (T22, plus `ingestion_failed` via T11b) always renders a reason from a
closed set, and each reason carries its own next action:

| Reason | Portal message | Next action |
|---|---|---|
| `consent_revoked` | Consent for this identity was revoked | Review consent (Portal) |
| `twin_revoked` / `voice_revoked` | The Digital Twin or voice is no longer available | Contact VYRA |
| `subscription_suspended` | Subscription is suspended | Resolve payment |
| `entitlement_exhausted` | Plan capacity for the period is used | View plan |
| `ingestion_failed` | Finalising the video did not complete | **None for the client.** VYRA is recovering it — and the client is told the generation is already accounted for |
| `provider_balance_depleted` | *(internal only — never shown in Portal)* | Control: provider balance |

`ingestion_failed` deserves emphasis: `ADR-0034` and `FF-32` guarantee the usage
stays committed and no automatic re-render happens. The Portal must therefore
say clearly that the item is being recovered by VYRA and that it will **not** be
re-billed, because the alternative — silence — is what makes this state feel
like a bug.

### 21.4 Non-content status vocabularies

**Digital Twin / Voice Clone**: `absent`, `provisioning`, `active`, `suspended`,
`revoked` (§30).
**Knowledge source**: `uploaded`, `processing`, `indexed`, `partial`, `failed`.
**Publication**: `scheduled`, `publishing`, `published`, `failed`,
`restricted` (TikTok `SELF_ONLY` under `GATE-TT01`).
**Provider (Control only)**: `healthy`, `degraded`, `unavailable`,
`balance_low`, `balance_depleted`.
**Subscription**: `active`, `past_due`, `suspended`, `cancelled`.

### 21.5 Time vocabulary

Relative for anything under 7 days (`há 4 min`, `em 2 h`); absolute
(`24 fev 2026, 14:32`) beyond that, always with the tenant's timezone abbreviated
when it differs from the viewer's. Every relative timestamp carries the absolute
value in its `title` and in `<time datetime>`. Durations use `mono-sm`.

---

## 22. Responsive behaviour

### 22.1 Per-surface commitment

| Surface | Full support | Degraded | Not supported |
|---|---|---|---|
| **Portal** | `xs` → `3xl` — **complete**, including approval on a phone | — | — |
| **Studio** | `lg` → `3xl` | `md` — read + single-object actions; boards and grids become lists | `xs`, `sm` — a "use a larger screen" state with a link to the mobile-capable Portal |
| **Control** | `lg` → `3xl` | `md` — read-only ledgers and audit | `xs`, `sm` — as Studio |

The Portal commitment is a product decision, not a technical one: the client's
single required act is an approval, and approvals happen on phones.

### 22.2 Shell adaptation

| Breakpoint | Rail | Topbar | Drawer |
|---|---|---|---|
| `≥ xl` | 248px expanded | Full | Right, 480–840 |
| `lg` | 64px icon rail, expands on hover/focus | Full | Right, 480–640 |
| `md` | Off-canvas, opened from a menu button | Compact (mark + title + actions) | Right, 480 |
| `< md` | Bottom tab bar, ≤ 5 items, labels always visible | 48px, mark + title + bell | Bottom sheet |

### 22.3 Content adaptation

- 12 → 8 → 4 columns at `lg` / `md` / `xs`.
- KPI rows: 4-up → 2-up → 1-up, and never smaller than `metric-md`.
- `L-workspace` collapses its inspector into a tab at `md` and its context pane
  into a drawer at `< md`.
- Tables become **stacked object rows** below `md` (title + 3 key fields +
  status + overflow), never horizontally scrolling data grids on a phone.
- Boards become a filtered single-lane list with a lane switcher below `md`.
- The calendar becomes an agenda list below `md`.
- The primary action docks to a bottom bar (`surface-1`, `border-subtle` top,
  safe-area padding) below `md`.

### 22.4 Input adaptation

Coarse pointers get ≥ 44×44 targets, no hover-only affordances, and a long-press
equivalent for every right-click menu. Drag-and-drop on touch requires a
deliberate 200ms long-press to start, and every drag has the keyboard/menu
equivalent from §26.4.

---

## 23. Accessibility

### 23.1 Target

**WCAG 2.2 Level AA** across all three surfaces. `NFR-14` makes this
architectural; the conformance suite (§23.6) runs in CI and is an epic exit gate.

### 23.2 Structure

- One `<h1>` per page (the page title); heading levels never skip.
- Landmarks: `banner` (topbar), `navigation` (rail), `main`, `complementary`
  (meta rail), `contentinfo` where present.
- A skip link to `main` as the first focusable element.
- Every route change moves focus to the page `<h1>` and announces the new title.
- Lists of objects are real lists; tables of data are real tables.

### 23.3 Interaction

- Everything operable by keyboard, in DOM order, with no trap outside a modal.
- `:focus-visible` renders `glow-focus` — 2px lime ring with a 2px base-coloured
  offset so it reads on any surface. Focus is **never** removed.
- Disabled controls are focusable-but-`aria-disabled` when their reason matters,
  so a keyboard user can discover why.
- Every icon-only control has a matching `aria-label` and tooltip.
- Roving tabindex inside grids, boards, calendars and toolbars.
- Modal semantics: `role="dialog"`, `aria-modal`, labelled by its heading.

### 23.4 Perception

- Contrast per §5.5.
- Minimum target 24×24 CSS px (WCAG 2.2 SC 2.5.8); 44×44 on coarse pointers.
- Status never encoded by colour alone (§5.2).
- Text resizes to 200% without loss of content or function; the shell reflows at
  320px width (SC 1.4.10).
- `prefers-reduced-motion` honoured per §10.4; `prefers-contrast: more` raises
  every border token one step and text one step.
- No content flashes more than 3 times per second — trivially satisfied because
  §10 forbids it.

### 23.5 Content

- Language declared per document and per element when it changes.
- Error identification, suggestion and prevention (SC 3.3.1/3.3.3/3.3.4) —
  §13.3 and §13.5 implement all three.
- Accessible authentication (SC 3.3.8): paste is never blocked in the MFA field,
  and no cognitive test is used.
- Redundant entry avoided (SC 3.3.7): the request composer never re-asks for
  something already on the tenant profile.

### 23.6 Verification

`ADR-0028` removed Storybook, so accessibility is verified by:

1. Automated axe assertions in component tests for every primitive and every
   composed screen (zero serious/critical violations).
2. A keyboard-only traversal test per screen blueprint asserting reachability of
   every interactive element and correct focus return from every overlay.
3. A contrast token test asserting every semantic foreground/background pair in
   both themes meets §5.5 — this is a pure token computation and needs no browser.
4. A reduced-motion test asserting no animation exceeds 1ms except sanctioned
   opacity fades.
5. A screen-reader name/role/value snapshot per primitive.
6. A **token lint** asserting no component references a primitive token or a raw
   colour, and no CSS value outside the spacing scale.

---

## 24. Video and media presentation

### 24.1 Delivery

Media is delivered exclusively through **CloudFront signed URLs with short TTL**
issued by the API (`security-architecture.md` §6). The player never receives a
bucket URL, never caches a signed URL beyond its TTL, and refreshes the URL
transparently when playback outlives it. No media element is ever `crossorigin`
to a public object.

### 24.2 Player

A custom control layer over the native `<video>` element — no third-party player
dependency (§3.3).

- Frame: `radius-2xl`, `bg-sunken` letterbox, 1px `border-subtle`.
- Controls: appear on hover/focus over the media scrim (§5.6), 48px tall,
  auto-hide after 2.5s of inactivity **only when playing**.
- Scrubber: 4px track, `radius-xs`, buffered range at `border-strong`, played
  range `accent-solid`, 12px handle on hover/focus.
- Poster: the first ingested frame; while absent, a `bg-sunken` frame with the
  content title, never a spinner over black.
- Time: `mono-sm`, elapsed / total, tabular.
- Volume, playback rate (0.5–2×), fullscreen, and picture-in-picture where the
  browser supports it.
- Captions/subtitles rendered when a track exists, styled with product tokens.

### 24.3 Keyboard

`Space`/`K` play-pause · `←`/`→` ±5s · `J`/`L` ±10s · `,`/`.` frame step when
paused · `↑`/`↓` volume · `M` mute · `F` fullscreen · `C` captions ·
`0`–`9` seek to decile. Every shortcut is listed in a `?` overlay and none of
them fires while focus is inside a text field.

### 24.4 AI disclosure

`FF-15` makes AI disclosure non-suppressible. Every VYRA-produced video carries
a persistent disclosure affordance in the player chrome and on every card that
represents it. It is not a dismissible badge, it is not hidden in a menu, and no
tenant setting removes it. Where a platform requires its own disclosure flag
(`GATE-TT02`), the UI shows the platform-specific state and **blocks publication
rather than guessing** when the mechanism is unconfirmed.

### 24.5 Comparison and review

Video approval and QA need comparison:

- **Side-by-side**: two players, synchronised scrub, one shared timeline.
  Used for revision *n* against *n-1*.
- **Reference rail**: the approved script beside the player, auto-scrolling to
  the spoken section when a transcript with timings exists, manually otherwise.
- **Annotation**: a QA reviewer marks a timestamp with a note; the mark appears
  on the scrubber and in the QA record. Portal users do not annotate — they
  approve or reject with a reason (`FR-P05`, T15/T16).

### 24.6 Audio

Voice-clone previews and generated audio use a compact waveform player: 32px
waveform rendered from a precomputed peak array (never decoded client-side),
`accent-solid` played portion, `border-strong` remainder, same keyboard map as
§24.3 minus the video-only keys.

### 24.7 Upload

Knowledge documents and reference media upload with per-file progress, explicit
type and size validation before transfer, cancel per file, and a clear
distinction between *uploaded*, *processing* and *indexed* (§21.4). No upload
component ever blocks the page.

---

## 25. Script editing experience

### 25.1 Where editing happens

| Surface | Capability |
|---|---|
| **Studio** | Full rich editing of `ScriptVersion` drafts (`FR-S02`, `FR-S07`) |
| **Portal** | **Read-only.** Approve (T05) or request revision with a reason (T06). No editing — the client's role is decision, not authorship (PD-01, `FR-P04`) |
| **Control** | No script access |

### 25.2 Engine and schema

**Tiptap** over a **VYRA-owned document schema** (ADR-0035). The schema is
deliberately narrow — a script is not a document:

| Node | Purpose | Constraints |
|---|---|---|
| `hook` | Opening 3–5 seconds | Exactly one, first, ≤ 240 chars |
| `section` | A spoken block | Has a title; contains `paragraph` only |
| `paragraph` | Spoken text | Plain text + inline marks only |
| `direction` | Non-spoken stage direction | Excluded from the spoken word count and from voice synthesis |
| `broll` | Visual instruction | Excluded from voice synthesis |
| `cta` | Call to action | At most one, last |

Marks: `emphasis` (affects prosody hints), `pause` (explicit beat), `term`
(links to a knowledge entity). **No** font, colour, size, table, image or
arbitrary HTML mark exists in the schema — the editor cannot express a visual
style, which is precisely why it stays a script.

### 25.3 Editor layout (`L-workspace`)

```
┌ context 3col ──┬ canvas 6col ─────────────────┬ inspector 3col ───┐
│ Brief          │  hook                        │ Versions          │
│ Objective      │  ─────────────────────────── │  v3 draft  ●      │
│ Channel/format │  section: Problem            │  v2 rejected      │
│ Brand rules    │    paragraph…                │  v1 rejected      │
│ Knowledge used │  direction: pause 1s         │ ───────────────── │
│  · source A ↗  │  section: Proof              │ Estimated runtime │
│  · source B ↗  │    paragraph…                │  0:47  (142 words)│
│ Revisions 2/3  │  cta                         │ Brand compliance  │
└────────────────┴──────────────────────────────┴───────────────────┘
```

### 25.4 Behaviours

- **Autosave** every 2s idle or on blur, with `Saved {relative}` in `mono-sm`.
  This is the only autosaving surface in the product (§13.6).
- **Estimated runtime** recalculates live from the spoken word count at the
  tenant's configured words-per-minute, and shows the delta against the target
  duration for the channel. `direction` and `broll` nodes are excluded.
- **Versions**: every submission creates a `ScriptVersion`; the rail lists them
  with state and author. A rejected version's reason is attached to it.
- **Diff**: any two versions compare in a side-by-side view with word-level
  insert/delete marks in `status-success`/`status-danger` at 12% tint. Diff is
  read-only.
- **Revision budget**: `maxScriptRevisions` (T07) is displayed as
  `Revisions 2 / 3`; at the last one the editor states that the next rejection
  moves the item to `BLOCKED`, before it happens.
- **Knowledge provenance**: a `term` mark links to the knowledge chunk that
  supported it; hovering shows the source and the retrieval trace link
  (`knowledge-engine.md` §4). This is the visible half of `FF-27`'s containment
  story — the operator can always see *why* a claim is in the script.
- **Brand compliance**: the inspector shows the last compliance result with each
  failed rule quoted and a jump-to-offending-range control. It never auto-edits.
- **Collaboration**: single-writer at MVP. Opening a script another operator is
  editing renders read-only with the holder's name and a `Take over` action that
  is audited.

### 25.5 Editor accessibility

Full keyboard operation with no modifier-only paths; a slash-menu for node
insertion reachable by keyboard; every node type announced by a screen reader;
`Escape` always exits the editor to the toolbar; the diff view is navigable
change-by-change with `n`/`p` and announces each change.

---

## 26. Content pipeline

### 26.1 Two views, one dataset

| View | Default for | Shape |
|---|---|---|
| **Pipeline board** (`L-board`) | Studio; Portal ≥ `lg` | Lanes by state group |
| **Table** (`L-collection`) | Portal `< lg`; anyone who chooses it | Rows with state, channel, dates |

View choice persists per user per screen and is reflected in the URL.

### 26.2 Lane grouping

Twenty-one states do not make twenty-one lanes. They make five:

| Lane | States | Meaning |
|---|---|---|
| **Requested** | `REQUESTED`, `BRIEFING`, `SCRIPTING` | VYRA is preparing |
| **Your review** | `SCRIPT_REVIEW`, `VIDEO_REVIEW` | Waiting on the client |
| **In production** | `SCRIPT_APPROVED`, `VOICE_GENERATION`, `RENDER_QUEUED`, `RENDERING`, `INGESTING`, `QA`, `REVISION_REQUESTED` | VYRA is producing |
| **Ready & scheduled** | `READY`, `SCHEDULED`, `PUBLISHING` | Heading out |
| **Closed** | `PUBLISHED`, `ARCHIVED`, `REJECTED`, `CANCELLED` | Done |

`FAILED` and `BLOCKED` do not get a lane. They render **in place** with a danger
treatment, because hiding a problem in a "problems" column is how problems get
ignored. A count of them appears in the context bar as a filter chip.

### 26.3 Drag-and-drop rules

Drag is powered by **dnd-kit** (ADR-0035) and is bound by one principle:
**a drag expresses intent; the workflow engine decides.**

| Drag | Maps to | Guard |
|---|---|---|
| Card → `Ready & scheduled` lane | Opens the schedule drawer (T17) | Only from `READY`; channel must be connected |
| Card reorder within the Studio generation queue | Priority change | `OPERATIONS_MANAGER` only |
| Card → calendar cell | T17 with that date | `READY`; date must be future |
| Scheduled card → another calendar cell | Reschedule | `SCHEDULED`; not yet `PUBLISHING` |

Everything else is not draggable, and a non-draggable card says so on grab
attempt rather than silently refusing. `FF-06` makes the workflow engine the
only mutator, so the client sends an intent and renders the server's answer;
an optimistic move that the server refuses animates back to origin and raises a
region-level error, never a toast.

### 26.4 Keyboard equivalence

Every drag has a keyboard path: focus the card, `Space` to lift, `↑ ↓ ← →` to
move between valid targets (invalid targets are skipped and announced),
`Space` to drop, `Escape` to cancel. The live region announces the target and
its validity at every step. A drag interaction without this path is a defect.

### 26.5 Board performance

Lanes virtualise above 50 cards; the board renders at most 200 cards before
switching to the table view with an explanation. Lane counts always reflect the
server total, not the loaded page.

---

## 27. Editorial calendar

### 27.1 Views

**Month** (default ≥ `lg`), **Week** (Studio default), **Agenda** (mobile and
`< md`). View and date range live in the URL.

### 27.2 Month grid

Cells are `surface-1` with `border-subtle`; today's cell carries a 2px lime top
edge. Each cell shows up to 3 items plus `+n`. An item chip shows the channel
mark, the time in `mono-sm`, the title truncated to two lines, and the status
indicator. Past days dim to `text-tertiary`; days outside the month drop to
`bg-sunken`.

### 27.3 Timezone

Every calendar declares its timezone in the header. The tenant timezone is
authoritative for scheduling; if the viewer's timezone differs, both are shown
on hover and in the schedule drawer. A publication time is never displayed
without a timezone anywhere in the product.

### 27.4 Scheduling interaction

- Drag an item from the pipeline or the unscheduled rail onto a cell → schedule
  drawer prefilled with that date, time defaulting to the channel's configured
  best-time or 09:00 tenant time.
- Drag an existing scheduled item to another cell → reschedule confirmation
  inline in the cell, applied on drop, reverted on server refusal.
- Click an empty cell → create-request drawer with the desired date prefilled.
- **Conflict detection**: two publications to the same channel within the
  configured minimum interval render a warning ring on both chips and an
  explanation in the drawer. It warns; it does not block, unless the platform
  itself rejects it.
- **Restricted channels**: a TikTok item under `GATE-TT01` shows a
  `restricted` badge and states that the post will be `SELF_ONLY` — on the
  calendar, before scheduling, not after publishing.

### 27.5 Unscheduled rail

A right rail lists `READY` items with no schedule, sorted by age. It is the
source for drag-to-schedule and collapses to a chip with a count at `md`.

---

## 28. Approval experience

### 28.1 Why it is a designed surface

Approval is the only mandatory client action in the product and the moment where
usage becomes billable (T08 reserves, T11 commits). It gets the most careful
screen in the Portal.

### 28.2 Script approval (`L-workspace`)

- **Canvas**: the script, read-only, `body-lg`, 68ch measure, sectioned exactly
  as authored.
- **Context rail**: objective, channel, format, target duration, and the brand
  rules that applied.
- **Inspector**: version history, estimated runtime, and — if this is revision
  *n* — a `Compare with v(n-1)` control opening the diff (§25.4).
- **Decision bar**: pinned to the bottom of the canvas, `surface-1`,
  `border-subtle` top. `Approve` (primary, `accent-solid`) and
  `Request revision` (secondary). Nothing else.
- **Request revision** opens a dialog requiring a reason (`api-contracts.md`
  §3.2 `reason*`, `EX-P15-03`). The reason field states its minimum length,
  offers optional structured tags (tone, accuracy, length, compliance), and
  shows the revision budget (§25.4).
- **Approve** shows, before committing, exactly what approval starts: voice
  generation and video render, and the entitlement that will be reserved.

### 28.3 Video approval

Same skeleton, canvas replaced by the player (§24.2) with the approved script in
the context rail and QA notes in the inspector. `Approve` marks the item
`READY`; `Request revision` requires a reason and, where the QA record exists,
shows what QA already found so the client does not repeat it.

### 28.4 The irreversibility affordance

Approving a script starts a **billable** generation. The Approve control
therefore carries a one-line consequence statement above it — not a tooltip, not
a modal on every approval:

> Approving starts voice and video generation and reserves *N* minutes from your
> plan.

If the reservation would exceed the entitlement, the control is disabled with
the reason inline and a link to the plan screen (`entitlement_exhausted`, §21.4).
If consent is not active, the control is disabled with the consent reason
(`consent_revoked`, G-1). The screen never lets a user attempt an action the
guard will refuse.

### 28.5 Idempotency and double submission

Approve sends an `Idempotency-Key` derived from the object and version. A
duplicate submission (double click, retry after a timeout, back-and-resubmit)
resolves to the same outcome and renders the resulting state, never an error.
The control disables on first click and re-enables only on a terminal response.

### 28.6 Auto-approval policy

Where the tenant policy is `AUTO` (T05/T15), the screen states that this item
was approved automatically and by which policy, with the brand-compliance result
that permitted it (G-4). `FF-33` guarantees VYRA QA is never skipped by a client
setting, and the UI says so on the QA row rather than leaving it implied.

### 28.7 Studio-side approvals

`FR-S07` allows Studio to act on a tenant's behalf where policy permits. Those
screens are identical in structure but carry a persistent `Acting on behalf of
{client}` banner in `status-warning` tone, and every such action is written to
the audit trail and shown as such in the item's history.

---

## 29. Performance dashboards

### 29.1 The one hard rule

`FF-16` and `FR-PF05`: opening a dashboard makes **zero** provider calls. Every
number comes from `performance_snapshot`. The UI therefore always shows the
snapshot age (§12.4) and never offers a "refresh from platform" control — because
none exists. It offers "collected in windows after publication" as an explanation.

### 29.2 Portal performance

- **Header**: period selector (7 / 30 / 90 days, custom), channel filter.
- **KPI row**: published items, total views, total engagements, engagement rate.
  Each with a delta against the previous equal period and a sparkline.
- **Trend**: one multi-line chart, one line per channel, `viz-*` fixed channel
  colours (§5.4).
- **Top content**: a table of published items with per-platform metric columns,
  gaps hatched, sortable, opening the item drawer.
- **Per-item drawer**: the item, its publication, and each collection bucket as
  a row with its captured time and its values — so a user can see exactly which
  windows have and have not been collected.

### 29.3 Studio performance

Cross-tenant by default (`FR-S09`), scoped by the client selector on demand.
Adds a client dimension to the trend chart and a client column to the table.
Same snapshot rules.

### 29.4 Control commercial dashboards

`FR-C04`/`FR-C05` — consumption ledger per tenant and provider cost ledger with
derived contribution. These are the only screens where money appears.

- Contribution uses the diverging palette (§5.4).
- Every cost row states whether the provider reported the cost or VYRA estimated
  it (`GATE-COST01`, `RISK-14`); an estimated value renders with a dashed
  underline and an `estimated` chip. **An estimate is never presented as a fact.**
- Ledgers are append-only (`FF-11`); the UI has no edit affordance anywhere, and
  says "adjustment" — a new entry — where a correction is needed.

### 29.5 Degradation

A missing snapshot renders as a gap (§12.4). A collection that failed entirely
renders the `absent-by-design` empty state inside the chart frame with the next
scheduled window. A period with no publications renders `filtered` empty with a
link to the calendar.

---

## 30. Onboarding and Digital Twin state

### 30.1 The onboarding spine

A tenant becomes able to request content only after six things exist. The
onboarding surface is a persistent checklist that is the Portal's home until it
completes, then collapses into an account section.

| # | Step | Blocks | Owner |
|---|---|---|---|
| 1 | Account and security (password, MFA) | Everything | Client |
| 2 | Identity owner and consent | Twin, voice, all generation (G-1, `FF-30`) | Client |
| 3 | Digital Twin provisioning | Video render (T10, G-3) | VYRA (`GATE-HG02`) |
| 4 | Voice clone | Voice generation (T08) | VYRA (`GATE-EL01`) |
| 5 | Knowledge sources | Script quality — **warns, never blocks** | Client |
| 6 | Channel connections | Publication (T17) — not generation | Client |

Each step shows its own state, who is acting, and what it unlocks. A step VYRA
owns says so and gives no false agency to the client — this is the difference
between a premium managed service and a self-serve tool.

### 30.2 Twin presence module

A persistent module (dashboard card, account screen, and a compact chip in the
topbar when not `active`) rendering one of five states:

| State | Treatment | Copy | Actions |
|---|---|---|---|
| `absent` | neutral, `absent-by-design` empty | Not yet created | None — VYRA acts |
| `provisioning` | `status-info`, ring + `glow-live`, elapsed time | Being prepared by VYRA | None |
| `active` | `status-identity` violet, filled indicator | Ready | View details |
| `suspended` | `status-warning`, square | Paused, with reason | Resolve reason |
| `revoked` | `status-danger`, triangle, **no generation action anywhere** | Permanently revoked | None (`EX-P15-08`) |

`revoked` is irreversible and the UI must never imply otherwise: no "restore",
no "reactivate", no greyed-out button that hints at one.

### 30.3 Consent

Consent is a governed write path, not a checkbox.

- The consent screen shows the **current version**, its scope, when it was
  granted, by whom, and the full version history.
- Granting requires reading the scope; the confirm control enables only after
  the scope region has been scrolled to its end and an explicit affirmative is
  selected. No pre-checked boxes.
- **Revocation** uses the destructive pattern (§13.5): typed confirmation, an
  explicit statement that generation stops immediately and that in-flight items
  move to `BLOCKED` (T22, G-1), and no undo affordance because there is no undo.
- After revocation the UI shows the propagation state — which downstream assets
  have been marked — because `P5`'s revocation-with-propagation-tracking is
  visible governance, and hiding it would make the strongest guarantee in the
  product invisible.

### 30.4 First value

The onboarding completion moment is the single place in the product that uses
`display-2xl` and a full-bleed editorial break (`space-14`). It states what the
tenant can now do and offers exactly one action: request the first content item.
It appears once, is not repeatable, and is never re-shown.

---

## 31. Screen blueprints — VYRA Portal

Every blueprint below specifies: **Objective · Primary action · Hierarchy ·
Regions · Key components · States · Responsive · Desktop/mobile notes.**
"States" always covers loading, empty, error and denied; additional states are
listed where they exist.

### 31.0 Shell (applies to every Portal screen)

- **Objective**: Give a single-tenant client a persistent sense of where their
  content operation stands and what it needs from them.
- **Primary action**: `Request content` — present in the topbar on every screen.
- **Hierarchy**: pending decisions → pipeline state → everything else.
- **Regions**: topbar (mark, surface label, `⌘K`, bell, account) · rail
  (Overview, Content, Calendar, Performance, Account) · content · drawer.
- **Key components**: `AppShell`, `NavRail`, `SurfaceLabel`, `CommandPalette`,
  `NotificationBell`, `AccountMenu`, `RequestContentButton`, `TwinChip`.
- **States**: session valid · session expiring (global banner with extend) ·
  subscription `past_due` / `suspended` (global banner, blocks request) ·
  entitlement exhausted (global banner) · twin not `active` (topbar chip).
- **Responsive**: §22.2. Below `md` the rail becomes a 5-item bottom tab bar
  (Overview, Content, Calendar, Performance, Account) and `Request content`
  becomes a floating action in the content area, not a tab.
- **Desktop/mobile**: desktop keeps the rail expanded by default; mobile hides
  the client-scope concept entirely (a Portal user has exactly one tenant).

### 31.1 `portal-auth` — Sign in, MFA, recovery
- **Objective**: Authenticate a single portal user with MFA, with no information
  leakage about account existence.
- **Primary action**: `Sign in` (then `Verify` on the MFA step).
- **Hierarchy**: VYRA mark → step title → the single input → primary → secondary.
- **Regions**: `L-focus` single 400px column on `bg-base`; left 40% on `≥ xl`
  carries a full-height carbon panel with the mark and one editorial line — no
  imagery, no gradient.
- **Key components**: `AuthCard`, `TextField`, `OtpField`, `Button`,
  `FormAlert`, `PasswordStrength` (set/reset only).
- **States**: idle · submitting · invalid credentials (generic message, identical
  timing) · locked out (states the wait, never the count) · MFA required ·
  MFA invalid · recovery-code path · rate limited (`rate_limited`) · session
  expired (arrived here from a protected route, returns after login).
- **Responsive**: single column at every breakpoint; the editorial panel drops
  below `xl`.
- **Desktop/mobile**: mobile shows a numeric keypad for OTP, allows paste
  (SC 3.3.8), and never blocks password managers.

### 31.2 `portal-onboarding` — Activation checklist
- **Objective**: Get the tenant from account created to first content request.
- **Primary action**: The next incomplete step's own action; when all complete,
  `Request your first content`.
- **Hierarchy**: progress → next step → remaining steps → what each unlocks.
- **Regions**: `L-focus` 760px; progress meter; six step cards; completion hero.
- **Key components**: `StepChecklist`, `StepCard`, `ProgressMeter`,
  `ConsentFlow`, `TwinPresence`, `KnowledgeUploader`, `ChannelConnector`.
- **States**: per step — `todo` / `waiting on VYRA` / `blocked` / `done`; overall
  — in progress / complete (once, §30.4); a VYRA-owned step that has exceeded its
  expected duration shows an explicit "we're on it" state with a contact action.
- **Responsive**: cards stack; the progress meter becomes a sticky top bar below
  `md`.
- **Desktop/mobile**: file upload on mobile accepts camera and document sources;
  consent reading requirement (§30.3) applies identically on both.

### 31.3 `portal-dashboard` — Overview
- **Objective**: In one screen, answer "what needs me, what is in flight, how am
  I doing, and how much is left".
- **Primary action**: The topmost pending approval — or `Request content` when
  nothing is pending.
- **Hierarchy**: action rail (needs you) → pipeline summary → consumption →
  recent performance → recent activity.
- **Regions**: `L-dashboard`. Row 1: action rail (full width, only when
  non-empty). Row 2: 4 metric cards. Row 3: 8-col pipeline summary + 4-col
  consumption meter. Row 4: 8-col performance trend + 4-col activity feed.
- **Key components**: `ActionRail`, `MetricCard`, `PipelineSummary`,
  `ConsumptionMeter`, `TrendChart`, `ActivityFeed`, `TwinPresence`.
- **States**: first-run (no content ever — a single `first-run` empty state
  replaces rows 2–4 and the action rail is absent) · nothing pending (action rail
  hidden, not empty) · blocked items present (danger banner above row 1) ·
  entitlement exhausted · subscription suspended · partial load (each region has
  its own boundary and skeleton).
- **Responsive**: 4-up → 2-up → 1-up metrics; rows 3–4 stack; the action rail
  becomes a horizontally scrollable set of cards below `md`.
- **Desktop/mobile**: on mobile the action rail is the screen — it sits directly
  under the header and everything else follows.

### 31.4 `portal-request-content` — New content request
- **Objective**: Capture intent with the minimum required and let everything else
  be optional (`api-contracts.md` §3.1 — only `objective` and `channel` required).
- **Primary action**: `Submit request`.
- **Hierarchy**: objective → channel → everything optional, progressively
  disclosed.
- **Regions**: drawer at `≥ md` (640), full page at `< md`. Required block,
  then an `Add details` disclosure containing subject, campaign, references,
  guidance, format, priority, desired date.
- **Key components**: `RequestComposer`, `ObjectiveField` (multiline, autogrow),
  `ChannelSelect` (only connected channels, disconnected shown with a connect
  action), `CampaignCombobox`, `ReferenceUploader`, `DatePicker`,
  `IdempotencySubmit`.
- **States**: idle · validating · submitting · `validation_failed` (field-scoped)
  · `entitlement_exhausted` (form-level, blocks submit, links to plan) ·
  `consent_revoked` (blocks submit, links to consent) · subscription suspended ·
  no channel connected (`first-run` empty inside the channel field with a connect
  action) · success (drawer closes, item appears in the pipeline with a one-shot
  highlight, toast with `View item`).
- **Responsive**: full-page form below `md` with a docked submit bar.
- **Desktop/mobile**: mobile places `objective` in focus on open and keeps the
  optional block collapsed.

### 31.5 `portal-content` — Pipeline and tracking
- **Objective**: Show every in-flight and recent item and make the ones waiting
  on the client impossible to miss (`FR-P03`).
- **Primary action**: Open the first item in `Your review`.
- **Hierarchy**: `Your review` lane → in-production lanes → closed.
- **Regions**: context bar (view switch board/table, state filter chips, channel
  filter, search, problems count) · board (`L-board`, five lanes per §26.2) or
  table (`L-collection`) · item drawer.
- **Key components**: `PipelineBoard`, `Lane`, `ContentCard`, `StatusChip`,
  `ContentTable`, `FilterChips`, `ItemDrawer`, `StateTimeline`.
- **States**: loading (lane skeletons) · first-run · filtered-empty ·
  per-lane empty (`absent-by-design`) · items in `FAILED`/`BLOCKED` (in place,
  danger, with the §21.3 reason) · error per lane (lane keeps its header).
- **Responsive**: board at `≥ lg`; single-lane list with a lane switcher at
  `md`; stacked object rows below `md`.
- **Desktop/mobile**: drag is disabled in the Portal board — the client's only
  pipeline write is scheduling from `READY`, which happens in the calendar or
  the drawer. Mobile opens items as bottom sheets.

### 31.6 `portal-content-item` — Item detail (drawer + deep-linkable page)
- **Objective**: Give the full life of one content item, including every state it
  passed through and why.
- **Primary action**: Whatever the current state requires — approve, request
  revision, schedule, view published post — or none.
- **Hierarchy**: current state and required action → asset (script or video) →
  timeline → metadata.
- **Regions**: header (title, channel, state chip, action) · tabs
  (Overview · Script · Video · Publication · Performance) · body · footer meta.
- **Key components**: `ItemHeader`, `StatusChip`, `StateTimeline`,
  `ScriptReader`, `VideoPlayer`, `PublicationPanel`, `PerformancePanel`,
  `AiDisclosureBadge`.
- **States**: per state (§21.1) · `BLOCKED` with reason and next action (§21.3) ·
  `FAILED` with the recovery statement · not found (§20.3 rule 4) · tab-level
  `absent-by-design` (no video yet, no publication yet, no performance yet).
- **Responsive**: drawer 640 at `≥ lg`, 480 at `md`, bottom sheet below.
- **Desktop/mobile**: the timeline collapses to the last three events with a
  disclosure on mobile.

### 31.7 `portal-script-approval`
- **Objective**: Let the client approve or reject a script with full context and
  full awareness of what approval starts (§28.2).
- **Primary action**: `Approve`.
- **Hierarchy**: script → decision bar → context → versions.
- **Regions**: `L-workspace` — context rail 3 / script canvas 6 / inspector 3;
  pinned decision bar.
- **Key components**: `ScriptReader`, `DecisionBar`, `RevisionDialog`,
  `VersionRail`, `ScriptDiff`, `BrandComplianceSummary`, `RuntimeEstimate`,
  `ConsequenceNotice`, `EntitlementGuardNotice`.
- **States**: reviewable · submitting approval · submitting revision ·
  approved (transitions to the produced state with an inline confirmation) ·
  revision requested (state changes, revision counter increments) ·
  budget exhausted warning (last revision) · `entitlement_exhausted` /
  `consent_revoked` (approve disabled with reason) ·
  `state_transition_not_allowed` (someone else acted — the screen refreshes to
  the true state and explains) · auto-approved (§28.6, read-only).
- **Responsive**: at `md` the inspector becomes a tab; below `md` the context
  becomes a collapsible header block and the decision bar docks to the bottom.
- **Desktop/mobile**: approving on a phone is a first-class path — the decision
  bar is thumb-reachable and the reason dialog is a full-height sheet.

### 31.8 `portal-video-approval`
- **Objective**: Approve or reject the finished video with the script and QA
  result in view (§28.3).
- **Primary action**: `Approve`.
- **Hierarchy**: video → decision bar → script reference → QA notes.
- **Regions**: `L-workspace` — script rail 3 / player 6 / inspector 3; pinned
  decision bar.
- **Key components**: `VideoPlayer`, `AiDisclosureBadge`, `DecisionBar`,
  `RevisionDialog`, `ScriptReader`, `QaNotes`, `SideBySideCompare`.
- **States**: as §31.7, plus — media loading · signed-URL expired (transparent
  refresh; visible only if refresh fails) · playback unsupported (fallback with
  a download-free message) · revision *n* available for comparison.
- **Responsive**: player goes full-width above the rails below `lg`; controls
  remain ≥ 44px on touch.
- **Desktop/mobile**: mobile locks the player to 16:9 at the top, script below,
  decision bar docked; picture-in-picture offered where supported.

### 31.9 `portal-calendar`
- **Objective**: Show what is scheduled and let the client schedule `READY`
  items (`FR-P06`, T17).
- **Primary action**: `Schedule` on a `READY` item.
- **Hierarchy**: current period → scheduled items → unscheduled ready items.
- **Regions**: header (period nav, view switch, timezone, channel filter) ·
  `L-calendar` grid · unscheduled rail (§27.5) · schedule drawer.
- **Key components**: `CalendarGrid`, `CalendarChip`, `UnscheduledRail`,
  `ScheduleDrawer`, `TimezoneNotice`, `ConflictWarning`, `RestrictedChannelBadge`.
- **States**: loading (grid skeleton) · empty period (`filtered`) · no ready
  items (rail `absent-by-design`) · conflict warning · restricted channel
  (`GATE-TT01`) · drag refused by the server (revert + region error) ·
  channel disconnected (chip shows it and offers reconnect).
- **Responsive**: month at `≥ lg`, week at `md`, agenda below `md`.
- **Desktop/mobile**: drag-and-drop is desktop and tablet only; mobile schedules
  through the item's `Schedule` action, which is the same drawer.

### 31.10 `portal-library`
- **Objective**: Browse and retrieve approved and published assets (`FR-P07`).
- **Primary action**: Open an asset.
- **Hierarchy**: recent → filters → grid.
- **Regions**: context bar (search, channel, date, type, sort) · responsive
  media grid · asset drawer.
- **Key components**: `MediaGrid`, `MediaTile` (poster, duration, channel mark,
  AI disclosure, status), `AssetDrawer`, `VideoPlayer`, `SignedUrlNotice`.
- **States**: loading (tile skeletons preserving aspect ratio) · first-run ·
  filtered-empty · poster missing (`bg-sunken` frame with the title) ·
  signed-URL failure (tile-level error with retry) · asset archived (dimmed with
  an `Archived` chip).
- **Responsive**: 4 → 3 → 2 → 1 columns.
- **Desktop/mobile**: mobile tiles are 16:9 full-width with the title below;
  playback opens the sheet player.

### 31.11 `portal-performance`
- **Objective**: Show published performance from snapshots only (`FR-P08`,
  `FR-PF05`, `FF-16`).
- **Primary action**: None — this is a reading screen. Secondary: open an item.
- **Hierarchy**: KPIs → trend → per-item table.
- **Regions**: header (period, channel) · KPI row · trend chart · items table ·
  item drawer with per-bucket detail (§29.2).
- **Key components**: `MetricCard`, `TrendChart`, `PerformanceTable`,
  `SnapshotAgeStamp`, `GapIndicator`, `IndicativeAggregateNotice`.
- **States**: loading · no publications in period (`filtered`) · never published
  (`first-run`) · collection pending for the period (`absent-by-design` inside
  the chart, naming the next window) · partial data (gaps rendered as gaps) ·
  error per region.
- **Responsive**: KPIs 4→2→1; the trend chart keeps a 320px minimum height and
  reduces its tick density; the table becomes stacked rows below `md`.
- **Desktop/mobile**: mobile shows one channel at a time in the trend, switched
  by chips, rather than a 5-line chart.

### 31.12 `portal-plan` — Plan and consumption
- **Objective**: Show entitlement against consumption as a fold of the ledger
  (`FR-P09`, `FR-UC05`, `FF-07`).
- **Primary action**: None at MVP (no self-serve upgrade — `ADR-0029` leaves
  payment as an extension point). Secondary: `Contact VYRA`.
- **Hierarchy**: remaining capacity → period → breakdown → history.
- **Regions**: consumption meter (hero) · period selector · breakdown by
  content item · ledger history table.
- **Key components**: `ConsumptionMeter`, `EntitlementSummary`,
  `UsageBreakdownTable`, `LedgerHistoryTable`, `ReservationNotice`.
- **States**: healthy · approaching limit (warning at a configurable threshold) ·
  exhausted (danger, explains that new requests and approvals are blocked) ·
  reservations held (shows reserved-but-not-committed separately from committed,
  because a reservation is not a charge) · loading · error.
- **Responsive**: meter full width; tables become stacked rows below `md`.
- **Desktop/mobile**: identical information; no capability is desktop-only here.

### 31.13 `portal-account` — Subscription, payment, profile, security
- **Objective**: Show subscription and payment situation (`FR-P10`) and let the
  user manage their own credentials and MFA.
- **Primary action**: Context-dependent — `Resolve payment` when `past_due`,
  otherwise none.
- **Hierarchy**: subscription state → payment → profile → security → sessions.
- **Regions**: tabs (Subscription · Profile · Security). Subscription: state
  banner, plan summary, billing history. Security: password, MFA, active
  sessions, sign-out-everywhere.
- **Key components**: `SubscriptionPanel`, `PaymentStatusBanner`,
  `BillingHistoryTable`, `ProfileForm`, `MfaPanel`, `SessionList`,
  `DestructiveConfirm`.
- **States**: `active` · `past_due` (global banner, §31.0) · `suspended` (blocks
  content requests and approvals, states it) · `cancelled` · MFA enrolled /
  not enrolled / recovery codes unviewed · session revocation success.
- **Responsive**: tabs become a select below `md`.
- **Desktop/mobile**: MFA enrolment shows both QR and a copyable secret so a
  phone-only user can enrol without a second device.

### 31.14 `portal-twin` — Digital Twin and voice status
- **Objective**: Make the identity assets and their state legible (`FR-P11`).
- **Primary action**: None in most states — VYRA owns provisioning (§30.2).
- **Hierarchy**: twin state → voice state → what each unlocks → history.
- **Regions**: twin presence module · voice presence module · capability list ·
  identity version history.
- **Key components**: `TwinPresence`, `VoicePresence`, `CapabilityList`,
  `IdentityVersionTimeline`, `AudioWaveformPlayer` (voice preview).
- **States**: five twin states (§30.2) × the same for voice · `revoked` exposes
  **no** generation action anywhere in the product (`EX-P15-08`) ·
  `provisioning` shows elapsed time and who is acting · capability unsupported
  for a requested format (`capability_unsupported`, G-3) rendered as a plain
  sentence, not an error.
- **Responsive**: two modules stack below `lg`.
- **Desktop/mobile**: voice preview playback is available on both.

### 31.15 `portal-consent`
- **Objective**: Make consent readable, versioned and revocable with full
  awareness of the consequence (§30.3).
- **Primary action**: `Grant consent` when absent; otherwise none (revocation is
  deliberately not a primary action).
- **Hierarchy**: current consent → scope → history → revocation.
- **Regions**: `L-focus` 760px. Current version card · scope document ·
  version history · revocation zone (visually separated, `border-danger`, at the
  end of the page).
- **Key components**: `ConsentSummary`, `ScopeReader` (scroll-to-end gate),
  `ConsentVersionTimeline`, `DestructiveConfirm`, `PropagationStatus`.
- **States**: absent · active · superseded by a new version (must re-accept) ·
  revoked (terminal; shows propagation status per §30.3) · granting · revoking.
- **Responsive**: single column at every breakpoint.
- **Desktop/mobile**: the scroll-to-end gate works identically on touch; the
  typed confirmation uses a text keyboard, never a numeric one.

### 31.16 `portal-notifications`
- **Objective**: Collect everything that needed the client's attention.
- **Primary action**: Open the first `needs you` item.
- **Hierarchy**: needs you → attention → finished.
- **Regions**: 400px drawer from the bell, or a full page at `/notifications`.
  Grouped by day within category.
- **Key components**: `NotificationPanel`, `NotificationGroup`,
  `NotificationRow`, `MarkAllRead`.
- **States**: unread / read · empty (`absent-by-design`, "You're up to date") ·
  loading · error · in-app only (never implies an email was sent, §3.4).
- **Responsive**: full-height sheet below `md`.
- **Desktop/mobile**: identical.

### 31.17 `portal-not-found` / `portal-error`
- **Objective**: Fail safely without disclosing existence and without dead-ending.
- **Primary action**: `Back to overview`.
- **Hierarchy**: what happened → what to do → recovery action → support codes.
- **Regions**: `L-focus`, centred, inside the shell (the rail stays, so the user
  is never stranded).
- **Key components**: `PageErrorState`, `CodeChip`, `CorrelationIdChip`.
- **States**: `not_found` (identical for cross-tenant, §20.3) · `forbidden`
  (states nothing about what exists) · 5xx (offers retry) · offline (offers
  retry, states that nothing was lost).
- **Responsive**: single column.
- **Desktop/mobile**: identical.

---

## 32. Screen blueprints — VYRA Studio

### 32.0 Shell (applies to every Studio screen)

- **Objective**: Give the internal operator dense, keyboard-first control over
  many clients' production without losing track of which client they are in.
- **Primary action**: `⌘K` command palette — the operator's real entry point.
- **Hierarchy**: client scope → section → object.
- **Regions**: topbar (mark, `Studio`, **client scope selector**, `⌘K`, bell,
  account) · rail (Operations, Clients, Production, Knowledge, Identity,
  Distribution, Performance) · content · drawer.
- **Key components**: `AppShell`, `ClientScopeSelector`, `CommandPalette`,
  `ActingOnBehalfBanner`, `DensityToggle`.
- **States**: no client selected (cross-tenant screens work; client-scoped rail
  items are disabled with the reason) · client selected · acting on behalf
  (§28.7 banner) · restricted role (rail renders only permitted sections).
- **Responsive**: `lg`+ full; `md` degraded per §22.1; below `md` a "use a larger
  screen" state.
- **Desktop/mobile**: Studio is a desktop tool. The mobile state is a deliberate,
  well-designed refusal, not a broken layout.

### 32.1 `studio-overview` — Operations home
- **Objective**: Show what needs an operator right now across all clients.
- **Primary action**: Open the oldest item in the QA queue.
- **Hierarchy**: queues needing action → throughput → problems → recent activity.
- **Regions**: `L-dashboard`. Row 1: queue tiles (QA pending, awaiting client
  approval, blocked, failed, scheduled today). Row 2: 8-col throughput chart +
  4-col problems list. Row 3: activity feed.
- **Key components**: `QueueTile`, `ThroughputChart`, `ProblemList`,
  `ActivityFeed`, `AgeIndicator`.
- **States**: loading · all clear (`absent-by-design` per tile, never a single
  empty page) · backlog age exceeding threshold (tile turns warning/danger and
  states the oldest age — `RISK-18`'s throughput bottleneck made visible) ·
  region error.
- **Responsive**: tiles 5→3→2 up; rows stack.
- **Desktop/mobile**: desktop only.

### 32.2 `studio-clients` — Client list
- **Objective**: Find and enter a client (`FR-S01`).
- **Primary action**: Open a client.
- **Hierarchy**: search → status → list.
- **Regions**: context bar (search, status filter, plan filter) · data grid ·
  client drawer.
- **Key components**: `DataGrid` (TanStack), `TenantRow`, `StatusChip`,
  `ConsumptionMiniMeter`, `ClientDrawer`.
- **States**: loading (grid skeleton) · empty · filtered-empty · error ·
  suspended client (row danger tint, still openable).
- **Responsive**: grid at `lg`+, stacked rows at `md`.
- **Desktop/mobile**: desktop only.

### 32.3 `studio-client` — Client detail
- **Objective**: One client's whole configuration and production state
  (`FR-S01`).
- **Primary action**: `Set as scope` — the action that makes every other Studio
  screen about this client.
- **Hierarchy**: identity and plan → pipeline → configuration → history.
- **Regions**: `L-object`. Header (name, status, plan, scope action) · tabs
  (Overview · Configuration · Identity · Knowledge · Content · Audit).
- **Key components**: `ObjectHeader`, `TabSet`, `ConfigForm`, `TwinPresence`,
  `ConsumptionMeter`, `AuditTable`.
- **States**: active · suspended · consent revoked (all generation actions
  disabled across every tab with the reason) · twin revoked · loading · error.
- **Responsive**: tabs to select at `md`.
- **Desktop/mobile**: desktop only.

### 32.4 `studio-requests` — Requests and briefings
- **Objective**: Manage incoming requests, briefings and agendas (`FR-S02`).
- **Primary action**: Open a request.
- **Hierarchy**: unprocessed → in progress → recent.
- **Regions**: context bar · grid or board · request drawer with the briefing.
- **Key components**: `DataGrid`, `RequestDrawer`, `BriefingPanel`,
  `CampaignChip`, `PriorityChip`.
- **States**: loading · empty · filtered-empty · briefing failed (`FAILED` with
  the retry path that is legal for the state) · error.
- **Responsive**: as §32.2.
- **Desktop/mobile**: desktop only.

### 32.5 `studio-script` — Script workspace
- **Objective**: Author, revise and submit scripts (`FR-S02`, `FR-S07`, §25).
- **Primary action**: `Submit for approval`.
- **Hierarchy**: script canvas → submit → brief and knowledge → versions and
  compliance.
- **Regions**: `L-workspace` exactly as §25.3, plus a pinned submit bar.
- **Key components**: `ScriptEditor` (Tiptap), `BriefPanel`, `KnowledgeUsedList`,
  `VersionRail`, `ScriptDiff`, `BrandComplianceSummary`, `RuntimeEstimate`,
  `AutosaveIndicator`, `TakeOverDialog`.
- **States**: draft (autosaving) · saved · saving failed (inline, retains local
  content, never loses the buffer) · submitted (read-only) · rejected by client
  (shows the reason at the top of the canvas) · revision budget exhausted ·
  compliance failed (jump-to-range) · locked by another operator (read-only with
  `Take over`) · offline (editor keeps working, submit disabled with the reason).
- **Responsive**: inspector to tab at `md`; below `md` unsupported.
- **Desktop/mobile**: desktop only — this is the clearest case for §22.1's
  refusal.

### 32.6 `studio-knowledge` — Sources
- **Objective**: Manage knowledge sources and their processing state (`FR-S03`).
- **Primary action**: `Add source`.
- **Hierarchy**: processing problems → sources → coverage.
- **Regions**: context bar · source grid · upload drawer · source drawer.
- **Key components**: `DataGrid`, `KnowledgeUploader`, `ProcessingStateChip`,
  `SourceDrawer`, `ChunkPreview`, `CoverageSummary`.
- **States**: `uploaded` / `processing` / `indexed` / `partial` / `failed`
  (§21.4) · upload in progress (per-file) · unsupported type (rejected before
  transfer) · size exceeded · empty · error · **data-region isolation notice**
  making explicit that a source belongs to exactly one tenant (`FF-27`, `RISK-06`).
- **Responsive**: grid at `lg`+.
- **Desktop/mobile**: desktop only.

### 32.7 `studio-knowledge-trace` — Retrieval trace
- **Objective**: Show exactly which chunks supported a generated output
  (`knowledge-engine.md` §4).
- **Primary action**: Open the source of the top-ranked chunk.
- **Hierarchy**: query → ranked chunks → source → the generated text they
  supported.
- **Regions**: split — query and ranked chunk list left, chunk content and its
  source right; the generated output above with `term` marks linking down.
- **Key components**: `TraceQueryHeader`, `RankedChunkList`, `ChunkViewer`,
  `SourceLink`, `ScoreBar`.
- **States**: loading · no trace recorded (`absent-by-design`) · chunk source
  deleted (states it rather than 404ing the row) · error.
- **Responsive**: stacks at `md`.
- **Desktop/mobile**: desktop only.

### 32.8 `studio-twins` — Digital Twins
- **Objective**: Manage Digital Twin lifecycle (`FR-S04`).
- **Primary action**: `Provision twin` for a client that has consent and none.
- **Hierarchy**: state → capabilities → versions → revocation.
- **Regions**: grid across clients when unscoped; object detail when scoped.
- **Key components**: `DataGrid`, `TwinPresence`, `CapabilityList`,
  `IdentityVersionTimeline`, `DestructiveConfirm`, `PropagationStatus`,
  `GateNotice` (`GATE-HG01`, `GATE-HG02`, `GATE-HG03`).
- **States**: five twin states (§30.2) · provisioning blocked by absent consent
  (action disabled with the reason, `FF-30`) · capability snapshot stale ·
  revocation in propagation · gate-blocked (provider contract unresolved —
  states it, offers nothing false).
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 32.9 `studio-voices` — Voice clones
- **Objective**: Manage voice clone lifecycle (`FR-S04`).
- **Primary action**: `Create voice clone`.
- **Hierarchy**: state → verification → samples → revocation.
- **Regions**: grid · object detail with the sample list and a waveform player.
- **Key components**: `DataGrid`, `VoicePresence`, `AudioWaveformPlayer`,
  `SampleList`, `VerificationNotice`, `DestructiveConfirm`.
- **States**: as twins, plus — awaiting provider verification (`FF-12`: no
  mechanism bypasses provider voice verification; the UI offers no override,
  and says why) · sample rejected · `GATE-EL01` unresolved.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 32.10 `studio-queue` — Generation queue console
- **Objective**: Observe and control generation queues — retry, cancel, requeue
  (`FR-S05`).
- **Primary action**: Retry the oldest failed job (where legal).
- **Hierarchy**: age and failures → queue depth → individual jobs.
- **Regions**: queue summary tiles (per queue from `aws-topology.md` §6, with
  oldest-message age against `NFR-07`) · job grid · job drawer · DLQ section.
- **Key components**: `QueueTile`, `AgeIndicator`, `DataGrid`, `JobDrawer`,
  `AttemptTimeline`, `DlqPanel`, `BulkActionBar`.
- **States**: healthy · age threshold exceeded (`NFR-07`, warning then danger) ·
  DLQ non-empty (danger tile, redrive action per the `P16.03` runbook) ·
  job retrying · job cancelled · **retry refused** where `FF-32`/G-5 forbid it
  (an ingestion failure never triggers a new billable render — the control is
  absent, and the drawer explains that recovery is ingestion-only) · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 32.11 `studio-qa` — QA workspace
- **Objective**: Perform QA and record an explicit human verdict (`FR-S06`, T13,
  T14, `ADR-0033`).
- **Primary action**: `Pass QA`.
- **Hierarchy**: video → checklist → verdict → queue.
- **Regions**: `L-workspace` — queue rail 3 / player 6 / checklist and verdict 3.
- **Key components**: `QaQueueRail`, `VideoPlayer`, `TimestampAnnotation`,
  `QaChecklist`, `VerdictBar`, `ScriptReader`, `AiAssistedPrefill`.
- **States**: pending · in review (claimed by this reviewer) · claimed by another
  reviewer (read-only) · passed · failed with reason (T14) · AI-assisted
  pre-population present (clearly marked as a suggestion requiring a human
  verdict — `FF-33`, `ADR-0033`) · queue empty · media error · age warning
  (`RISK-18`).
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 32.12 `studio-calendar`
- **Objective**: Manage the editorial calendar across clients (`FR-S08`).
- **Primary action**: Schedule an unscheduled `READY` item.
- **Hierarchy**: today → this period → unscheduled.
- **Regions**: as §31.9 plus a client dimension: chips are client-coloured only
  when unscoped, and the unscheduled rail groups by client.
- **Key components**: as §31.9 plus `ClientChip`, `BulkScheduleBar`.
- **States**: as §31.9 plus — cross-client conflict (same channel, different
  clients is fine; same channel same client is warned) · bulk schedule.
- **Responsive**: `lg`+ month/week; `md` week only.
- **Desktop/mobile**: desktop only; drag is the primary interaction with the
  §26.4 keyboard equivalent.

### 32.13 `studio-publishing`
- **Objective**: Observe and control publication (`FR-S08`).
- **Primary action**: Retry a failed publication.
- **Hierarchy**: failures → publishing now → scheduled → published.
- **Regions**: `L-board` with lanes `Scheduled`, `Publishing`, `Published`,
  `Failed` · publication drawer · connection health strip.
- **Key components**: `PublishingBoard`, `PublicationCard`, `ChannelMark`,
  `ConnectionHealthStrip`, `PublicationDrawer`, `ExternalPostLink`,
  `RestrictedChannelBadge`, `DisclosureStateChip`.
- **States**: scheduled · publishing (`glow-live`) · published (links to the
  external post) · failed with error class and the retry path · token expired
  or invalid (`connection_invalid`, links to reconnection) · TikTok
  `SELF_ONLY` restriction (`GATE-TT01`) shown before and after publication ·
  AIGC disclosure mechanism unconfirmed (`GATE-TT02`) — **publication blocked,
  with the reason stated, never guessed** (`FF-15`).
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 32.14 `studio-performance`
- **Objective**: Observe performance across tenants (`FR-S09`).
- **Primary action**: None — reading screen. Secondary: scope to a client.
- **Hierarchy**: cross-client KPIs → trend by client or channel → item table.
- **Regions**: as §31.11 plus a client dimension and a client column.
- **Key components**: as §31.11 plus `ClientDimensionToggle`.
- **States**: as §31.11; additionally, a client with no publications is present
  in the table with explicit zeros rather than absent, so it cannot be
  overlooked.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

---

## 33. Screen blueprints — VYRA Control

### 33.0 Shell (applies to every Control screen)

- **Objective**: Give administration and governance a dense, auditable,
  cross-tenant surface where every dangerous action is deliberate.
- **Primary action**: `⌘K`.
- **Hierarchy**: platform status → the object being administered.
- **Regions**: topbar (mark, `Control`, `⌘K`, bell, account) · rail (Status,
  Tenancy, Commercial, Providers, Governance) · content · drawer.
- **Key components**: `AppShell`, `CommandPalette`, `MfaReassertionDialog`,
  `AuditNotice`.
- **States**: normal · MFA re-assertion required for a sensitive action
  (`RISK-11`) · restricted admin role (rail renders only permitted sections).
- **Responsive**: `lg`+ full; `md` read-only; below `md` unsupported.
- **Desktop/mobile**: desktop only.

### 33.1 `control-status` — Operational and security status
- **Objective**: One screen answering "is the platform healthy and is anything
  unsafe" (`FR-C09`).
- **Primary action**: Open the highest-severity active alarm.
- **Hierarchy**: active alarms → provider health → queue and DB pressure →
  environment gate register.
- **Regions**: `L-dashboard`. Row 1: alarm list. Row 2: provider health strip +
  queue tiles. Row 3: NFR pressure indicators (`NFR-06`, `NFR-07`, `NFR-08`,
  `NFR-09`). Row 4: launch gate register (all 12 `GATE-*`).
- **Key components**: `AlarmList`, `ProviderHealthStrip`, `QueueTile`,
  `PressureGauge`, `GateRegisterTable`, `RunbookLink`.
- **States**: all clear · alarms active (sorted by severity, each linking to its
  runbook — `P16.03`) · provider degraded/unavailable · balance low/depleted ·
  pressure threshold crossed · gate open (all 12 are open by design at MVP and
  the register says so rather than looking like a defect) · loading · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.2 `control-tenants` / `control-tenant`
- **Objective**: Manage tenants (`FR-C01`).
- **Primary action**: `Create tenant` (list) / `Suspend` or `Reactivate`
  (detail, both destructive-guarded).
- **Hierarchy**: status → plan → consumption → configuration → audit.
- **Regions**: grid; detail as `L-object` with tabs (Overview · Plan ·
  Users · Integrations · Audit).
- **Key components**: `DataGrid`, `ObjectHeader`, `TenantForm`,
  `DestructiveConfirm`, `MfaReassertionDialog`, `AuditTable`.
- **States**: active · suspended (states downstream effect: content requests and
  approvals blocked, T22) · loading · empty · error · MFA re-assertion pending.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.3 `control-users` — Internal users and roles
- **Objective**: Manage internal users and role assignments (`FR-C02`).
- **Primary action**: `Invite user`.
- **Hierarchy**: role → user → sessions.
- **Regions**: grid · user drawer (roles, sessions, MFA state, audit).
- **Key components**: `DataGrid`, `RoleMatrix`, `UserDrawer`, `SessionList`,
  `DestructiveConfirm`, `MfaReassertionDialog`.
- **States**: invited / active / disabled · role change (requires MFA
  re-assertion and is audited) · self-demotion prevented with an explanation ·
  last-admin protection · loading · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.4 `control-plans` — Plans and entitlements
- **Objective**: Manage plans, entitlements and subscription state (`FR-C03`).
- **Primary action**: `Create plan`.
- **Hierarchy**: plan → entitlements → assigned tenants → change impact.
- **Regions**: plan list · plan detail with the entitlement table and the tenant
  assignment list.
- **Key components**: `DataGrid`, `EntitlementTable`, `PlanForm`,
  `ImpactPreview`, `PaymentExtensionNotice`.
- **States**: draft / active / retired · a change that would reduce an
  entitlement below a tenant's current consumption shows an impact preview and
  requires explicit acknowledgement · payment provider absent (`ADR-0029`,
  `FR-BL05` — the extension point is stated as deliberately unimplemented, not
  as "coming soon") · loading · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.5 `control-usage` — Consumption ledgers
- **Objective**: View consumption ledgers per tenant (`FR-C04`).
- **Primary action**: None — this is an append-only record (`FF-11`).
  Secondary: `Record adjustment`, which creates a new entry.
- **Hierarchy**: period → tenant → entries.
- **Regions**: context bar (tenant, period, entry type) · ledger grid with a
  running balance · entry drawer showing the reserve/commit/release chain.
- **Key components**: `DataGrid` (virtualised), `LedgerRow`, `BalanceColumn`,
  `EntryDrawer`, `ReservationChain`, `AdjustmentDialog`,
  `AppendOnlyNotice`.
- **States**: loading · empty period · reservation held vs committed vs released
  rendered as distinct entry types · adjustment recorded (never an edit) ·
  export requested · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only; `md` renders read-only.

### 33.6 `control-costs` — Provider cost and contribution
- **Objective**: View provider cost ledgers and derived contribution
  (`FR-C05`, `ADR-0025`).
- **Primary action**: None. Secondary: export.
- **Hierarchy**: contribution → cost by provider → cost by tenant → entries.
- **Regions**: KPI row (revenue proxy, provider cost, contribution) ·
  contribution chart (diverging) · cost grid · entry drawer.
- **Key components**: `MetricCard`, `DivergingBarChart`, `DataGrid`,
  `EstimatedValueChip`, `EntryDrawer`.
- **States**: reported cost vs **estimated** cost visually distinct in every
  view (`GATE-COST01`, `RISK-14`, §29.4) · provider without a cost field
  (states it per provider rather than showing zero) · loading · empty · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.7 `control-providers` — Health and balance
- **Objective**: View provider health and provider balance/credits (`FR-C06`).
- **Primary action**: Open the runbook for a depleted or degraded provider.
- **Hierarchy**: unhealthy first → balance → recent errors → configuration.
- **Regions**: provider cards (one per provider) · error-class breakdown ·
  balance history chart · circuit-breaker state.
- **Key components**: `ProviderCard`, `BalanceMeter`, `BreakerStateChip`,
  `ErrorClassBreakdown`, `BalanceHistoryChart`, `RunbookLink`.
- **States**: `healthy` / `degraded` / `unavailable` / `balance_low` /
  `balance_depleted` (§21.4) · breaker open/half-open/closed · balance sync
  stale (states the last successful sync — the balance is polled, `P16.05`) ·
  depleted balance moving items to `BLOCKED` is stated with the affected count ·
  loading · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.8 `control-integrations`
- **Objective**: Manage social connections and provider configuration
  (`FR-C08`).
- **Primary action**: `Connect channel` / `Reconnect`.
- **Hierarchy**: broken connections → connections by tenant → provider config.
- **Regions**: connection grid (tenant × channel × state × expiry) ·
  connection drawer · provider configuration panel.
- **Key components**: `DataGrid`, `ChannelMark`, `ConnectionStateChip`,
  `TokenExpiryIndicator`, `ConnectionDrawer`, `ProviderConfigForm`,
  `GateNotice`.
- **States**: connected · expiring (warning threshold) · expired ·
  `connection_invalid` · scope mismatch (`GATE-MT02` — scopes resolve from
  configuration; the UI names the missing scope) · app review pending
  (`GATE-MT01`) · audit pending (`GATE-TT01`, publication restricted to
  `SELF_ONLY` and said so) · loading · error.
- **Note**: a token value is never displayed, never copyable, never partially
  revealed. `FF-10` encrypts it at rest; the UI shows only state and expiry.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

### 33.9 `control-audit` — Audit trail
- **Objective**: View the audit trail (`FR-C07`).
- **Primary action**: None — read-only and append-only.
- **Hierarchy**: filters → chronological entries → entry detail.
- **Regions**: filter bar (actor, action, object, tenant, date range,
  correlation id) · virtualised chronological grid · entry drawer.
- **Key components**: `DataGrid` (virtualised), `AuditRow`, `ActorChip`,
  `CorrelationIdChip`, `EntryDrawer`, `DiffViewer`, `AppendOnlyNotice`.
- **States**: loading · empty · filtered-empty · entry with a before/after diff ·
  sensitive-action entries (consent revocation, usage adjustment, role change)
  visually elevated · redacted fields shown as `[redacted]` per `FF-20`, never
  as blank · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only; `md` read-only.

### 33.10 `control-security`
- **Objective**: Security posture and controls (`FR-C09`, `FF-23`).
- **Primary action**: Revoke a session or force MFA re-enrolment.
- **Hierarchy**: active risks → sessions → lockouts and rate limits → policy.
- **Regions**: risk summary · active session grid · lockout and rate-limit
  panel · security policy panel (read-only, sourced from configuration).
- **Key components**: `RiskSummary`, `SessionGrid`, `LockoutPanel`,
  `RateLimitPanel`, `PolicyPanel`, `DestructiveConfirm`,
  `MfaReassertionDialog`.
- **States**: normal · elevated failed-login rate · account locked out ·
  session revoked (takes effect on the next request) · MFA re-assertion
  required for every action on this screen (`RISK-11`) · loading · error.
- **Responsive**: `lg`+.
- **Desktop/mobile**: desktop only.

---

## 34. Conformance — how a screen is judged done

A screen story is complete only when all of the following are demonstrable.
This list is the source of the acceptance-criteria template used by every
visual story in the backlog.

| # | Criterion | Verified by |
|---|---|---|
| C-01 | Visual hierarchy matches its blueprint: one primary action, correct type roles, correct region order | Blueprint review + component test |
| C-02 | Tokens only — no raw colour, no off-scale spacing, no primitive-token reference | Token lint (§23.6.6) |
| C-03 | Responsive at every breakpoint the surface commits to (§22.1), no horizontal page scroll | Viewport test at 320/640/768/1024/1440/1760 |
| C-04 | Full keyboard operability, DOM-order traversal, focus return from every overlay | Keyboard traversal test (§23.6.2) |
| C-05 | Focus visible on every interactive element in both themes | Focus snapshot test |
| C-06 | Loading state implemented, geometry-matched, ≥ 200ms and ≤ 8s | Component test |
| C-07 | Empty state implemented and of the correct kind (§19.1) | Component test |
| C-08 | Error state implemented per scope with `code` + correlation id, no provider text | Component test + a fixture per `code` |
| C-09 | Denied/not-found state indistinguishable where §20.3 requires it | Authorization test (class 6) |
| C-10 | Reduced-motion behaviour correct | Reduced-motion test (§23.6.4) |
| C-11 | Contrast pairs pass §5.5 in both themes | Token contrast test |
| C-12 | Zero serious/critical axe violations | axe assertion |
| C-13 | Status vocabulary drawn from §21, never paraphrased | String-source test |
| C-14 | No client-side authorization; every hidden control is also server-denied | `FF-17` + `EX-P15-02` |

---

## 35. Traceability

| Requirement / decision | Section | Backlog owner |
|---|---|---|
| `ADR-0003` stack unchanged | §0.2, §3.3 (of ADR-0035) | `P18.01` |
| `ADR-0028` no page-stories | §23.6 | `P18.16` |
| `ADR-0035` toolkit | §12.1, §14.1, §25.2, §26.3, §10.6 | `P19.*` |
| `ASM-BR01` superseded | §0.1, §4, §5, §6 | `P18.01`, `P18.02` |
| `NFR-03` critical screen load | §18.3 | `P24.06`, `P16.09` |
| `NFR-14` responsive + accessible | §22, §23 | `P24.01`–`P24.05` |
| `FF-15` AI disclosure | §24.4 | `P21.06` |
| `FF-16` no provider call on read | §29.1 | `P21.08` |
| `FF-17` server-side authorization | §3.2, §34 C-14 | `P15.20`, `P15.22` |
| `FF-20` no sensitive material | §20.3 | `P20.08` |
| `FF-32` no auto re-render | §21.3, §32.10 | `P22.05` |
| `FF-33` QA not skippable | §28.6, §32.11 | `P22.06` |
| `api-contracts.md` §1.1 codes | §13.3, §20 | `P20.08` |
| `api-contracts.md` §2 `404` not `403` | §3.2, §19.2, §20.3 | `P15.20` |
| `workflows-state-machines.md` §2.1 | §21.1 | `P18.13` |
| `security-architecture.md` §6 signed URLs | §24.1 | `P19.05` |
| `performance.md` §5 gaps | §12.4 | `P19.02` |
| `prd.md` §5 FR-P/S/C | §31–§33 | `P21`, `P22`, `P23` |

---

## 36. Open items

| Id | Item | Disposition |
|---|---|---|
| `OQ-PX-01` | pt-BR is the first locale; en is planned. The string layer is built for two locales from day one, but only pt-BR is authored at MVP. | Accepted; `P18.03` builds the layer. |
| `OQ-PX-02` | The tenant's words-per-minute for runtime estimation (§25.4) is configuration with a documented default, not a fixed constant. | Accepted; `P22.02`. |
| `OQ-PX-03` | Channel minimum-interval for calendar conflict warning (§27.4) is configuration per channel. | Accepted; `P21.07`. |
| `OQ-PX-04` | Light theme is defined (§4.6) but is not a launch commitment; it ships behind the same token layer and is verified by the contrast test. | Accepted; `P18.02`, `P24.04`. |
| `OQ-PX-05` | The geometric empty-state mark family (§19.2) is a small set of token-built compositions; the exact set is fixed in `P18.14`. | Accepted. |

**Public-safety exclusions**: this document contains no credential, license key,
provider API key, customer PII or raw vendor corpus.
