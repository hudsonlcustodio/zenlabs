# DADOS, STORAGE E FILAS

## PostgreSQL

### Major
`PostgreSQL 17` em Amazon RDS.

Minor inicial de referência: `17.11`, suportado pelo RDS na verificação de 2026-09-01.

### Por que 17 e não 18
Não existe requisito ZENLABS que dependa de PostgreSQL 18. A linha 17 oferece maturidade suficiente e suporte atual no RDS.

### Acesso
- `pg` como driver;
- Drizzle ORM como camada tipada;
- SQL explícito permitido;
- migrations versionadas;
- SQL de migration revisado em PR;
- RLS no mesmo change da tabela/policy;
- app role sem ownership/BYPASSRLS.

### Semântica
- transação de domínio + outbox = mesma transação;
- optimistic version quando aggregate exigir;
- `SELECT ... FOR UPDATE` apenas em invariantes concorrentes que realmente precisem.

## S3

- buckets privados;
- Block Public Access;
- SSE-KMS;
- uma chave por ambiente inicialmente;
- upload direto apenas via URL assinada curta;
- upload entra em área de quarentena;
- validação antes de virar MediaAsset canônico;
- provider URL nunca é mídia canônica.

## SQS

### Default
SQS Standard + DLQ.

A entrega é at-least-once, portanto consumer deve ser idempotente.

### Não usar FIFO inicialmente
Ordering global não é requisito.

Quando uma etapa depende de outra, o source-of-truth PostgreSQL decide elegibilidade; a fila apenas transporta trabalho.

### DLQ
Toda fila crítica possui:
- redrive policy;
- alarme;
- runbook;
- reprocessamento explícito.
