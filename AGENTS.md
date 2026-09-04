# AGENTS.md — ZENLABS

## Missão
Evoluir ZENLABS preservando contratos, segurança, rastreabilidade, custo e operação por exceção.

## Hard rules
1. Ler `docs/00_GOVERNANCE/DECISIONS.md` antes de mudanças estruturais.
2. `docs/_legacy/` nunca é autoridade.
3. Não chamar SDK de provider dentro de domínio.
4. Provider ID nunca é identidade canônica.
5. IA não autoriza gasto, billing, consentimento, acesso ou publicação.
6. Toda produção possui budget guard.
7. Todo job externo é idempotente.
8. Todo cliente-owned record é tenant-scoped.
9. Todo uso de identidade sintética exige consentimento válido.
10. Auto-release exige política explícita.
11. Retry é limitado por orçamento e attempts.
12. Toda exceção possui reason code.
13. UI cliente não expõe provider internals.
14. Não introduzir microservice/Kafka/Redis sem gatilho mensurado.
15. Não fazer rewrite do scaffold preservado sem evidência.

## Definition of evidence
Uma mudança estrutural só está pronta quando:
- contrato atualizado;
- teste correspondente;
- fitness function quando aplicável;
- decisão registrada;
- risco residual registrado.
