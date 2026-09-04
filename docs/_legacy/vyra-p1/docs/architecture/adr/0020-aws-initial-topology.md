# ADR-0020 — Lean EC2 + RDS + S3 + SQS baseline

**Status**: Accepted · **Authority**: brief §26

## Context
Start lean; be ready to grow; do not pay in advance for future scale. Kubernetes
and microservices are forbidden.

## Decision
Baseline: **EC2 with Docker, RDS PostgreSQL Single-AZ, S3, SQS + DLQ, ECR,
CloudFront, Secrets Manager, KMS, CloudWatch, GitHub Actions.** No ALB, no ECS,
no EKS, no ElastiCache, no EventBridge, no Multi-AZ at MVP.

## Alternatives rejected
- **ECS/Fargate from day one** — rejected: added cost and indirection before any
  multi-instance need; promotion gate G-B exists.
- **EKS/Kubernetes** — rejected: explicitly forbidden by the brief and vastly
  disproportionate.
- **Multi-AZ RDS at MVP** — rejected: roughly doubles database cost for an
  availability target already met; gate G-D governs.
- **Serverless-first (Lambda)** — rejected: long-running renders and polling fit
  poorly.

## Consequences
- Every omitted service has a named promotion gate; adding one without its
  trigger is an architecture violation.
- Applications must be genuinely stateless for G-A to be a simple step.
