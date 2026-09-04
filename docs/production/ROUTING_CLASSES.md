# ROUTING CLASSES

## Canonical classes

- `TALKING_STANDARD`
- `TALKING_PREMIUM`
- `BODY_MOTION`
- `CINEMATIC_BROLL`
- `PRODUCT_SHOT`
- `STATIC_VISUAL`
- `SLIDE`
- `GRAPHIC`
- `SCREEN_CAPTURE`
- `LIPSYNC_REPAIR`
- `AUDIO_SYNTHESIS`
- `IMAGE_IDENTITY_MASTER`
- `IMAGE_SCENE_VARIANT`

## Routing principle

AI Production Director define **intenção**.

Media Router define **execução**.

```text
Shot.routingClass
    +
QualityTarget
    +
Budget
    +
TenantPolicy
    +
ProviderHealth
    +
Capacity
    ↓
ProviderCapabilityRegistry
    ↓
eligible adapters
    ↓
deterministic routing score/policy
```

## Hard constraints before scoring

- capability supported;
- consent valid;
- tenant/provider allowed;
- duration supported;
- resolution supported;
- budget available;
- provider healthy enough;
- region/data restrictions satisfied.

## Soft optimization

Depois dos hard constraints:
- quality fit;
- historical acceptance;
- cost;
- latency;
- provider availability.

LLM não escolhe livremente provider.
