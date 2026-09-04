# ADR-0117 — Compact UI with Progressive Disclosure

**Status:** Accepted

## Context
ZENLABS is an operational system expected to handle many clients and productions. Large blocks of explanation and oversized UI reduce scan speed and create visual confusion.

## Decision
Primary interfaces use compact typography, short labels, restrained surfaces and progressive disclosure.

Default desktop operational text is 13–14px. Metadata may use 12px. Meaningful UI text below 12px is forbidden.

Technical/provider detail is hidden until needed.

## Consequences
- higher information density without card overload;
- faster operational scanning;
- explicit accessibility checks remain mandatory;
- mobile uses larger practical control/body sizes;
- critical risk/cost/consent data may never be hidden solely inside tooltips.
