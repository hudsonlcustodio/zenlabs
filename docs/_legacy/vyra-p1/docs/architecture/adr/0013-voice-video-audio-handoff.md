# ADR-0013 — Hand external audio to HeyGen via uploaded asset id

**Status**: Accepted · **Authority**: brief §12, §25

## Context
Confirmed from official HeyGen documentation: avatar video may be driven by
external audio for lip-sync, supplied as `audio_url` **or** `audio_asset_id` —
exactly one of the two, both obtainable from the Upload Asset API.

## Decision
**Prefer `audio_asset_id`**: VYRA synthesises audio with ElevenLabs, ingests it
into private S3 as the canonical copy, uploads it to HeyGen via the Upload Asset
API, and renders with the returned asset id. A short-lived presigned
`audio_url` is the documented fallback.

## Alternatives rejected
- **Presigned S3 `audio_url` as the primary path** — rejected: exposes a VYRA URL
  to a third party and couples success to URL TTL versus provider fetch timing
  (a signed-URL leakage surface, T-22).
- **Text + provider voice id** — rejected: it would abandon the ElevenLabs voice
  identity that is the product's core asset.
- **Treating the provider's output URL as storage** — rejected: brief §12
  forbids it; all produced media is ingested into VYRA-owned S3 before leaving
  `RENDERING`.

## Consequences
- Two ingestion steps (audio in, video in) — both idempotent.
- VYRA always holds the canonical copy of every asset.
