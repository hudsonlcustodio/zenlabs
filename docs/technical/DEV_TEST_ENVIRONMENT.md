# AMBIENTE DE DESENVOLVIMENTO E TESTES

## Desenvolvimento local

Obrigatório:
- Node 24.20.0
- pnpm 11.24.0
- Docker
- PostgreSQL 17 local

Não exigir AWS para unit tests.

## Testes

### Unit
Sem rede.

### Integration
PostgreSQL real em container/test environment.

### Provider contract
Mocks determinísticos em CI.

### Live provider
Somente staging explícito, budgetado.

## Serviços AWS locais

Não introduzir LocalStack como dependência obrigatória no primeiro slice.

Ports para S3/SQS permitem:
- fake em unit;
- AWS real em staging;
- integração local dedicada somente quando necessário.

## Primeiro vertical slice

```text
Tenant
→ Client
→ Consent
→ Clone Digital
→ Perfil de Identidade
→ Política de Produção
→ Solicitação
→ Plano
→ Estimativa de custo
→ Aprovação/autoaprovação
→ Auditoria
```

Sem provider real.
