# PROMPT DE CONTINUIDADE — WORK DESKTOP

Continue o projeto **ZENLABS | Laboratório de Clones** a partir deste repositório.

Leia nesta ordem:
1. `START_HERE_WORK_DESKTOP.md`
2. `docs/00_GOVERNANCE/PROJECT_STATE.md`
3. `docs/00_GOVERNANCE/DECISIONS.md`
4. `docs/product/PRD_ZENLABS_V2.md`
5. `docs/product/ROLES_AUTHORITY_RACI.md`
6. `docs/architecture/architecture.md`
7. `docs/production/PRODUCTION_INTELLIGENCE.md`
8. `docs/production/EXCEPTION_DRIVEN_PRODUCTION.md`
9. `docs/architecture/domain-model.md`
10. `docs/architecture/workflows-state-machines.md`
11. `docs/backlog/WAVES.md`

Regras:
- `docs/_legacy` é histórico, nunca autoridade.
- Não fazer rewrite do scaffold sem evidência.
- Não implementar provider real no primeiro slice.
- Não permitir provider SDK no domínio.
- Não permitir IA autorizar gasto/consent/billing/permissão.
- Todo billable job tem budget guard.
- Retry bounded.
- Tenant scope e consent guard obrigatórios.
- Preserve exception-driven production.
- Production Supervisor trabalha exceções/policies, não todas as produções.

Primeiro valide:
`node scripts/foundation/validate.mjs`

Depois execute `GATE-TECH-FOUNDATION-001`.

Primeiro vertical slice:
`Tenant → Client → Consent → DigitalTwin → IdentityPack → ProductionPolicy → ProductionRequest → ProductionPlan → CostEstimate → Approval/AutoApproval → Audit`

Use provider mocks.
