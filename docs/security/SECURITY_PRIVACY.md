# SECURITY & PRIVACY V2

## Critical assets
- source identity photos/video;
- voice samples;
- consent evidence;
- IdentityPack;
- provider credentials;
- publication credentials;
- final/private media;
- tenant data.

## Principles
- least privilege;
- deny-by-default;
- tenant isolation;
- MFA for sensitive staff roles;
- secrets manager;
- private object storage;
- short-lived signed delivery;
- append-only audit for critical actions;
- dependency/supply-chain scanning;
- secure logs without sensitive payloads.

## Synthetic identity controls
Every identity-bearing media request must prove:
- active DigitalTwin;
- active consent;
- allowed purpose;
- allowed tenant;
- policy not suspended.

## Kill switch
Revocation/suspension blocks new generation immediately.
In-flight jobs are evaluated under policy and may be cancelled/quarantined.

## AI/tool risks
Treat as first-class:
- prompt injection from uploaded documents;
- tool misuse;
- goal hijacking;
- privilege escalation;
- data exfiltration;
- provider supply-chain compromise.

AI workers receive only the minimum tool/data scope needed.

## Data lifecycle
Retention/deletion rules must be explicit per asset class.
Identity source data requires heightened controls and legal review.

## Legal gap
`GATE-LEGAL-001`: finalize consent language, retention, deletion, controller/processor roles and applicable LGPD obligations before production enrollment.
