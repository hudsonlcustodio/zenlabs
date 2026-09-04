# ADR-0014 — ElevenLabs as the initial voice provider; IVC default, PVC premium

**Status**: Accepted · **Authority**: brief §11, §31

## Context
Confirmed from official ElevenLabs documentation: IVC uses roughly 1–5 minutes of
audio and is effectively immediate; PVC needs ~30 minutes minimum (2–3 hours
recommended), **permits cloning only the speaker's own voice**, and requires a
verification process using voice-captcha before fine-tuning submission.

## Decision
`ElevenLabsProvider` implements `VoiceProvider`, as a **subsystem separate from
video**. **IVC is the default path; PVC is a premium option.** The architecture
routes the **identity owner personally** through the provider's verification
flow and stores only the resulting state.

## Alternatives rejected
- **PVC as the default** — rejected: the audio requirement and verification
  latency make it unsuitable for onboarding every client.
- **Any proxying, simulation or automation of verification** — rejected
  absolutely: prohibited by brief §11 and by law/ethics. Enforced as FF-12.
- **Coupling voice into the video provider** — rejected: brief §11 requires voice
  to be a separate subsystem, and it preserves substitutability.

## Consequences
- Voice clone lifecycle includes an `awaiting_verification` state driven by a
  real human action.
- PVC onboarding is a scheduled, human-in-the-loop process, not an API call.
- GATE-EL01 covers workspace/Enterprise specifics.
