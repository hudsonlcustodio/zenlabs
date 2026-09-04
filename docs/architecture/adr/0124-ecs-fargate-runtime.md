# ADR-0124 — ECS/Fargate as initial compute platform

**Status:** Proposed

## Decision
Run web, API and workers as separate ECS services/tasks on AWS Fargate, using images from ECR.

This preserves process isolation and independent worker scaling without introducing Kubernetes.
