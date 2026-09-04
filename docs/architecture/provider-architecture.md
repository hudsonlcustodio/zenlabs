# PROVIDER ARCHITECTURE V2

## Principle

ZENLABS owns identity, workflow, policy and source of truth.

Providers are replaceable execution capabilities.

## Ports

- `VoiceProvider`
- `ImageProvider`
- `TalkingAvatarProvider`
- `MotionProvider`
- `CinematicVideoProvider`
- `LipSyncRepairProvider`
- `PublishingProvider`
- `IntelligenceProvider`

## ProviderCapabilityRegistry

For every adapter maintain:
- capabilities;
- supported durations;
- resolution;
- async mode;
- concurrency/rate limit;
- region/data constraints;
- health;
- historical quality metrics;
- current rate card;
- contract version.

## MediaRouter

Input:
- routingClass;
- quality target;
- duration;
- identity requirements;
- policy;
- budget;
- provider health/capacity.

Output:
- selected adapter;
- execution config;
- fallback order;
- expected cost.

## Mock-first

Every provider port requires deterministic mocks for:
- success;
- timeout;
- rate limit;
- unavailable;
- auth failure;
- quota;
- rejected input;
- malformed callback;
- asset missing.

CI never consumes provider credits.

## Webhooks

Webhook é untrusted hint até:
- signature validation where available;
- dedupe;
- persisted raw event;
- independent reconciliation.

Provider webhook alone never authorizes client usage/billing.
