# VYRA — Intelligence Engine

- **Authority**: brief §13, §15
- **IMPLEMENTATION NOT STARTED**

## 1. Components

```
ContextBuilder → ModelRouter → IntelligenceProvider → OutputValidator
                     ▲
                ModelPolicy (per task, tenant, environment)
```

## 2. Task taxonomy

`TASK_IDEA_GENERATION`, `TASK_BRIEF_GENERATION`, `TASK_SCRIPT_GENERATION`,
`TASK_SCRIPT_REVIEW`, `TASK_CAPTION_GENERATION`, `TASK_BRAND_COMPLIANCE`,
`TASK_EMBEDDING`.

Each task resolves a `ModelPolicy`. Policies are rows, not code.

## 3. Model routing

`ModelPolicy(task, tenantId?, qualityProfile, environment)` →
`{ primaryModelRef, fallbackModelRefs[], maxTokens, temperature, timeoutMs }`

Routing inputs: task, tenant/quality profile, cost class, availability,
environment (brief §13).

**Model identifiers never appear in domain code** (FF-09). `modelRef` is an
opaque key resolved through configuration to a provider + model id. The
canonical policy per brief §13/§49:

| Tier | Role |
|---|---|
| default | high-volume, cost-controlled option |
| secondary | higher-quality/balanced alternative |
| escalation | optional, for critical or premium tasks only — never the default |

The concrete model ids for these tiers are **environment configuration**. This
document deliberately records none, per brief §48 (values that can change are
configuration, not architectural constants).

Development-time tooling credentials are never runtime credentials (brief §13).
Runtime uses dedicated commercial API keys from Secrets Manager (FF-14).

## 4. Context builder (brief §15)

Assembles, in a fixed and versioned order:

```
ContentRequest + ClientProfile + DigitalIdentity(active versions)
+ BrandRules + KnowledgeRetrieval + PreviousContent
+ Campaign + Channel + Objective
```

Output is a `ContextSnapshot` storing **references**, not copies: identity
version ids, `retrieval_trace_id`, `prompt_version_id`, `model_policy_id`. This
gives full reproducibility without duplicating client data.

### 4.1 Trust boundary

The assembled prompt has two regions:

- **instruction region** — VYRA-authored template text only.
- **data region** — client and retrieved content, clearly delimited, never
  interpolated into the instruction region.

Retrieved knowledge is untrusted (I-KN3). Mitigation detail in
`threat-model.md` T-12.

## 5. Prompt versioning

`PromptTemplate(id, task)` → `PromptVersion(id, templateId, version, body, activeFrom)`.

- Templates are versioned and immutable once activated.
- Every generated artifact stores the `prompt_version_id` that produced it.
- Rolling back a prompt is activating a prior version, never editing in place.

## 6. Output validation

`OutputValidator` runs before any state transition accepts model output:

| Check | Failure action |
|---|---|
| Schema conformance (Zod) | retry once with repair prompt, then `FAILED` |
| Length / estimated duration within channel bounds | regenerate |
| Prohibited topics from client profile | `BLOCKED`, notify strategist |
| Brand compliance (`TASK_BRAND_COMPLIANCE`) | `REVISION_REQUESTED` |
| Injection-marker heuristics on output | discard, log, alarm |

`TASK_BRAND_COMPLIANCE` runs even when script approval policy is AUTO
(brief §18 — automation must not remove governance).

## 7. Cost recording

Every model call records a `provider_cost_entry` with token usage from the
response. Token accounting is per call, keyed by provider request id.
