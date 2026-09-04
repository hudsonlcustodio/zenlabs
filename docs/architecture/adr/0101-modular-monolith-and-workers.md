# ADR-0101 — Modular monolith + asynchronous workers

**Status:** Proposed / preserved architecture

## Decision
Keep one modular API/control plane plus web and specialized async workers. Strong module boundaries precede any service extraction.

## Trigger to revisit
Measured independent scaling, deploy autonomy, fault isolation or ownership need.
