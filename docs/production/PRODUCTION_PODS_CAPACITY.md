# PRODUCTION PODS & CAPACITY

**Status:** [DECISÃO APROVADA]

## Initial operating model

Referência inicial:

- ~100 clientes por Production Supervisor;
- ~120h/mês disponíveis;
- capacidade planejada deve reservar buffer operacional.

Isso é ponto de partida, não regra permanente.

## Supervisor responsibility

- carteira;
- policy;
- exception handling;
- calibration;
- sampling audit;
- risk;
- override autorizado;
- provider incident coordination.

## Capacity is not client count only

Carga deve considerar:
- número de produções;
- final minutes;
- shots;
- pack complexity;
- exception rate;
- risk class;
- number of Twins;
- maturity;
- review policy.

## Operational Load Unit

[PROPOSTA] Criar `OLU` interno, não comercial, para forecast de capacidade.

## Scale KPIs

### Straight-Through Production Rate
Produções que chegam a READY sem intervenção humana / total.

### Exception Rate
Produções/shots que exigem humano / total.

### Human Touch Rate
Percentual de produções tocadas por humano.

### Human Minutes per Final Hour
Minutos humanos / hora final aprovada.

### Cost per Approved Minute
Provider + infra + repair costs / minutos finais aprovados.

## Ratio evolution

O ratio supervisor:clientes pode crescer quando:
- STP ↑;
- Exception Rate ↓;
- Human Minutes/Final Hour ↓;
- QC confidence/audits estáveis.

Não fixar promessa de 1:300 ou 1:500 antes de dados reais.
