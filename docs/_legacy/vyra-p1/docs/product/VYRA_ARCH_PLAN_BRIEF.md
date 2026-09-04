# VYRA — Brief Canônico do Arch-Plan

> **Fonte de autoridade desta etapa.** Este documento é a transcrição íntegra e verbatim da
> instrução de arquitetura emitida em 2026-08-26 para o `*arch-plan` da VYRA.
> Ele existe porque o intent normalizado do pipeline foi truncado na seção 45, deixando de fora
> as seções 45 a 54 (executabilidade por Sonnet, artefatos §46, ADRs obrigatórios §47,
> research gate de providers §48, premissas §49, fitness functions §50, definition of done §51,
> proibições §52, autorrevisão §53 e relatório final §54).
>
> **Precedência das fontes** (conforme §2 abaixo):
> este brief > `docs/product/VYRA_DECISOES_CANONICAS_MVP.md` > dossiê comercial >
> documentação oficial dos providers > README e documentos auxiliares.
>
> Todo estágio do arch-plan deve ler este arquivo integralmente antes de produzir artefatos.
> Nenhum conteúdo abaixo foi editado, resumido ou reordenado.

---

## Instrução verbatim

Você está atuando como arquiteto principal da VYRA.

Este é um projeto greenfield, iniciado em um repositório novo. Sua responsabilidade nesta etapa é produzir a arquitetura técnica canônica completa e executável do produto antes que qualquer implementação seja iniciada.

Trabalhe com profundidade de nível production-grade.

REGRA ABSOLUTA DESTA ETAPA

NÃO IMPLEMENTE A APLICAÇÃO.

Não crie frontend funcional, backend funcional, migrations executáveis, integrações reais, workers, endpoints, componentes, containers de produção ou qualquer código de produto.

Esta etapa é exclusivamente:

análise;
arquitetura;
decisões técnicas;
ADRs;
modelo de domínio;
modelo de dados;
contratos;
máquinas de estado;
segurança;
infraestrutura;
observabilidade;
estratégia de testes;
critérios de escalabilidade;
riscos;
sequenciamento arquitetural.

O resultado deverá preparar o projeto para a etapa posterior de criação dos épicos e stories, que será realizada separadamente.

Não crie os épicos ou stories agora.

1. REPOSITÓRIO

Projeto:

aurumsoltec/vyra

Diretório local:

~/Documentos/Projetos/Vyra

Branch canônica:

main

O projeto é greenfield.

Leia integralmente o repositório antes de tomar qualquer decisão.

Existe atualmente:

docs/product/VYRA_DECISOES_CANONICAS_MVP.md

Este documento contém decisões de produto já aprovadas.

Se existir no repositório um dossiê comercial completo da VYRA, utilize-o também como fonte funcional e conceitual.

2. ORDEM DE PRECEDÊNCIA DAS FONTES

A autoridade deve ser:

esta instrução atual;
docs/product/VYRA_DECISOES_CANONICAS_MVP.md;
eventual dossiê comercial VYRA presente no repositório;
documentação oficial e atual dos providers;
README e demais documentos auxiliares;
qualquer documentação futura ou histórica.

Se houver conflito:

instrução atual > decisões canônicas > dossiê > documentação auxiliar.

Nunca resolva conflitos silenciosamente.

Documente a divergência e adote a fonte de maior precedência.

3. VISÃO DO PRODUTO

A VYRA é uma plataforma de:

Digital Twin as a Service

Seu produto não é simplesmente um avatar.

A VYRA deve transformar:

identidade + voz + conhecimento + posicionamento + regras + contexto

em uma capacidade contínua de produção audiovisual.

A operação conceitual é:

conhecimento → briefing → pauta → roteiro → aprovação → voz → vídeo → QA → aprovação → calendário → publicação → performance

O cliente não deve precisar operar:

prompts;
motores de IA;
HeyGen;
ElevenLabs;
filas;
renderizadores;
APIs;
processos técnicos.

A complexidade pertence à VYRA.

4. SUPERFÍCIES DO PRODUTO

Projete três superfícies lógicas.

VYRA Portal

Aplicação utilizada pelo cliente.

Deve permitir inicialmente:

Dashboard;
solicitar novo conteúdo;
acompanhar conteúdos;
aprovar/reprovar roteiros;
aprovar/reprovar vídeos;
visualizar calendário;
visualizar biblioteca;
visualizar performance;
visualizar consumo do plano;
visualizar situação da conta;
acompanhar estado do Digital Twin.

O cliente terá inicialmente um único usuário.

VYRA Studio

Operação interna da VYRA.

Deve permitir controlar:

clientes;
solicitações;
pautas;
roteiros;
conhecimento;
Digital Twins;
Voice Clones;
geração;
filas;
QA;
revisões;
aprovação;
calendário;
publicação;
performance.
VYRA Control

Administração e governança.

Deve contemplar:

tenants;
usuários internos;
papéis;
planos;
entitlements;
consumo;
custos;
provider health;
provider balance;
auditoria;
integrações;
configurações;
segurança;
status operacional.

Estas superfícies podem pertencer à mesma aplicação/web codebase se arquiteturalmente apropriado.

Não crie três sistemas desnecessariamente.

5. ARQUITETURA DE SOFTWARE

A preferência arquitetural é:

monólito modular bem particionado.

Não introduza microsserviços sem necessidade comprovada.

Não introduza Kubernetes.

Os limites de domínio devem permitir extração futura de componentes somente caso métricas reais justifiquem.

Defina claramente módulos e dependências.

Considere no mínimo os domínios:

Identity;
Tenancy;
Client;
Digital Identity;
Digital Twin;
Voice Identity;
Knowledge;
Content;
Intelligence;
Workflow;
Render;
Media;
Calendar;
Social Publishing;
Performance;
Plans;
Subscription;
Usage;
Provider Cost;
Notifications;
Governance;
Audit;
Administration;
Observability.

Defina regras claras impedindo acoplamentos indevidos entre esses módulos.

6. STACK PREFERENCIAL

Avalie e consolide a seguinte base.

Monorepo

Preferência por:

TypeScript;
pnpm workspace;
estrutura monorepo;
compartilhamento explícito de contratos.

Uma organização possível é:

/apps
  /web
  /api
  /worker-ai
  /worker-media
  /worker-social

/packages
  /contracts
  /database
  /providers
  /ui
  /config
  /security
  /observability

Adapte somente se houver justificativa arquitetural concreta.

Frontend

Preferência:

Next.js;
TypeScript;
App Router;
Tailwind CSS;
shadcn/ui;
Lucide;
biblioteca apropriada de gráficos;
Motion apenas quando agregar valor.

A interface deve ter acabamento SaaS premium.

Evite aparência de painel administrativo genérico.

Construa um Design System VYRA sobre primitives controlados pelo próprio projeto.

Não invente identidade visual definitiva caso ainda não exista material canônico de branding.

Garanta responsividade e acessibilidade desde a arquitetura.

Backend

Preferência:

NestJS;
TypeScript;
API modular;
OpenAPI/documentação de contratos;
validação rigorosa de entrada.
Dados

Banco relacional principal:

PostgreSQL

Knowledge Engine:

PostgreSQL + pgvector, salvo forte motivo documentado em ADR para alternativa.

Mídia nunca deve depender do filesystem do servidor.

7. MULTI-TENANCY

A VYRA deve nascer multi-tenant.

Mesmo que inicialmente cada cliente possua:

1 usuário;
1 Digital Twin;

o isolamento entre organizações deve existir desde o primeiro schema.

Toda entidade pertencente ao cliente deve ter tenancy explícita.

Defina estratégias contra:

broken object authorization;
IDOR;
consultas sem tenant;
vazamento entre tenants;
jobs executados no tenant errado;
assets acessíveis entre clientes;
embeddings recuperados de outra organização.

As limitações comerciais de:

1 usuário + 1 Digital Twin

devem ser políticas do MVP, e não uma arquitetura impossível de evoluir no futuro.

Ao mesmo tempo, não implemente funcionalidades de múltiplos usuários ou múltiplos Twins no MVP.

8. AUTENTICAÇÃO E AUTORIZAÇÃO

Defina uma ADR para a solução de autenticação apropriada.

Não assuma automaticamente Cognito nem autenticação própria sem análise.

Requisitos obrigatórios:

sessões seguras;
autorização server-side;
RBAC real;
proteção CSRF quando aplicável;
cookies HttpOnly/Secure/SameSite quando aplicável;
MFA obrigatório para papéis administrativos sensíveis;
rate limiting;
proteção contra brute force;
gerenciamento seguro de sessão;
revogação de sessão.

Papéis internos iniciais conceituais:

SUPER_ADMIN;
ADMIN;
OPERATIONS_MANAGER;
CONTENT_STRATEGIST;
QA_REVIEWER;
PUBLISHER.

Não implemente autorização apenas ocultando elementos no frontend.

9. DIGITAL IDENTITY

Trate a identidade digital como composição de ativos.

Conceitualmente:

Digital Identity
 ├── Visual Identity
 ├── Voice Identity
 ├── Knowledge Identity
 ├── Brand Identity
 └── Behavioral / Communication Rules

Esses elementos devem poder evoluir e possuir versões.

10. HEYGEN

Provider inicial de vídeo:

HeyGen Enterprise API

A contratação Enterprise ainda será realizada.

A ausência das credenciais reais não pode bloquear arquitetura, desenvolvimento local ou testes automatizados.

Deve existir:

provider mock;
configuração por ambiente;
modo live somente quando credenciais forem disponibilizadas.

A arquitetura de produção deve ser API-first.

Não baseie o produto em operação manual do dashboard HeyGen.

A criação/provisionamento do Digital Twin deve utilizar API quando disponível dentro do contrato Enterprise.

Engine

Engine desejado:

Avatar V

Nunca suponha que qualquer look suporta Avatar V.

Antes da geração, a implementação futura deverá validar as capabilities do look/avatar disponibilizadas pela API do HeyGen.

Modele um:

Provider Capability Registry

O domínio VYRA não deve conhecer diretamente DTOs específicos do HeyGen.

Crie uma porta/abstração conceitual:

VideoProvider
AvatarProvider
ProviderCapabilityRegistry

e:

HeyGenProvider

como adapter.

Não invente endpoints.

Consulte documentação oficial e atual.

Quando um contrato específico não puder ser confirmado durante a arquitetura, registre explicitamente um implementation verification gate.

Geração

Planeje:

submissão idempotente;
provider job ID;
estados internos independentes;
retries seguros;
timeout;
polling ou webhook conforme capacidade oficial;
deduplicação;
DLQ;
concorrência controlada;
rate limit;
backpressure;
reconciliação;
recuperação após crash.

Não hardcode limites de concorrência do provider.

Devem ser configuráveis.

Créditos HeyGen

A VYRA deve acompanhar:

balance;
credits;
consumo;
jobs em andamento;
erros;
sincronização do saldo;
alertas de saldo baixo.

Web/Studio credits e API credits não devem ser confundidos.

11. ELEVENLABS

Provider inicial de voz:

ElevenLabs

A voz deve ser um subsistema separado do vídeo.

Crie abstrações conceituais:

VoiceProvider
VoiceClone
VoiceSynthesis

e:

ElevenLabsProvider
Voice Clone

Suportar conceitualmente:

INSTANT
PROFESSIONAL
IVC

Instant Voice Clone será o caminho padrão inicial.

PVC

Professional Voice Clone será opção premium.

PVC deve respeitar integralmente as regras atuais de:

propriedade da voz;
verificação da pessoa;
Voice CAPTCHA quando aplicável;
consentimento;
restrições de conta/workspace;
treinamento;
status assíncrono.

Nunca desenhe mecanismo para burlar a verificação da ElevenLabs.

A arquitetura deve permitir que a própria pessoa proprietária da voz participe da verificação exigida pelo provider.

Se o modelo de conta Enterprise/workspace da ElevenLabs exigir etapas específicas, documente como um integration gate.

Não invente permissões que a API não oferece.

12. PIPELINE VOZ → VÍDEO

O pipeline desejado é conceitualmente:

Script aprovado
       ↓
ElevenLabs
       ↓
Voice synthesis
       ↓
S3
       ↓
HeyGen
       ↓
Avatar V + áudio
       ↓
Vídeo
       ↓
S3 privado
       ↓
QA

Valide na documentação oficial atual do HeyGen qual é a maneira canônica de enviar áudio externo para geração/lip-sync.

Pode envolver URL temporária ou asset do provider.

Não invente detalhes.

A mídia gerada por providers externos deve ser ingerida para armazenamento controlado pela VYRA sempre que apropriado.

Não trate URLs temporárias de providers como armazenamento permanente.

13. INTELLIGENCE ENGINE

Pauta e roteiro são gerados por IA.

Não acople o Content Engine diretamente a modelos específicos.

Projete:

IntelligenceProvider
ModelRouter
ModelPolicy
PromptTemplate
PromptVersion
ContextBuilder
OutputValidator
Providers/modelos iniciais

Use como política inicial:

DeepSeek V4 Flash

como opção padrão de grande volume/custo controlado.

Utilize OpenAI como provider alternativo.

Preferência:

GPT-5.6 Terra

como alternativa de maior qualidade/equilíbrio.

Permita:

GPT-5.6 Sol

como escalation opcional para tarefas críticas, complexas ou premium.

Não torne Sol o padrão de todas as chamadas.

Todos os IDs reais de modelos devem ser configuráveis.

Nunca espalhe nomes de modelos pelo domínio.

Exemplo conceitual:

TASK_IDEA_GENERATION
TASK_BRIEF_GENERATION
TASK_SCRIPT_GENERATION
TASK_SCRIPT_REVIEW
TASK_CAPTION_GENERATION
TASK_BRAND_COMPLIANCE

Cada tarefa resolve uma policy.

O roteamento poderá considerar:

tarefa;
cliente;
perfil de qualidade;
custo;
fallback;
disponibilidade;
ambiente.

Os modelos utilizados por Claude Code/Neocortex durante desenvolvimento não são providers runtime da aplicação.

Não reutilize autenticação OAuth de ferramentas de desenvolvimento no runtime VYRA.

Runtime deve utilizar credenciais apropriadas para APIs comerciais.

14. KNOWLEDGE ENGINE

Materiais do cliente deverão formar contexto para geração de conteúdo.

Planeje ingestão de:

documentos;
PDFs;
apresentações;
FAQs;
metodologias;
ofertas;
links;
textos;
áudios;
conteúdos anteriores;
conhecimento institucional.

Arquitetura conceitual:

Knowledge Source
       ↓
Ingestion
       ↓
Parsing
       ↓
Chunking
       ↓
Embeddings
       ↓
pgvector
       ↓
Retrieval

Todas as operações devem respeitar tenancy.

Defina:

versionamento;
origem da informação;
status de processamento;
reprocessamento;
exclusão;
deduplicação;
provenance;
limites;
falhas.

Considere riscos de:

prompt injection em documentos;
conteúdo malicioso;
documentos enormes;
URLs hostis;
SSRF;
uploads malformados.
15. CONTEXT BUILDER

O roteiro não deve ser gerado apenas a partir do pedido isolado do cliente.

Conceitualmente:

Content Request
      +
Client Profile
      +
Digital Identity
      +
Brand Rules
      +
Knowledge Retrieval
      +
Previous Content
      +
Campaign
      +
Channel
      +
Objective
      ↓
Context Builder
      ↓
Model Router

Planeje versionamento dos prompts e rastreabilidade de qual contexto gerou cada roteiro.

16. CONTENT REQUEST

O cliente poderá solicitar diretamente novos conteúdos.

Modele uma entidade própria para a solicitação.

Considere campos como:

objetivo;
assunto;
canal;
campanha;
referências;
orientação adicional;
formato;
prioridade;
data desejada.

Não transforme todos esses campos em obrigatórios sem necessidade.

A IA poderá transformar a solicitação em:

briefing;
pauta;
roteiro.
17. WORKFLOW DE CONTEÚDO

Projete uma máquina de estados explícita.

Uma referência inicial:

REQUESTED
→ BRIEFING
→ SCRIPTING
→ SCRIPT_REVIEW
→ SCRIPT_APPROVED
→ VOICE_GENERATION
→ RENDER_QUEUED
→ RENDERING
→ QA
→ VIDEO_REVIEW
→ READY
→ SCHEDULED
→ PUBLISHING
→ PUBLISHED
→ ARCHIVED

Estados alternativos devem contemplar:

REVISION_REQUESTED;
REJECTED;
FAILED;
CANCELLED;
BLOCKED.

Não use necessariamente esses nomes se houver nomenclatura melhor.

O importante é que a máquina seja rigorosa.

Defina:

ator autorizado para transição;
pré-condições;
efeitos;
eventos;
retries;
compensações;
idempotência.
18. APROVAÇÕES

Cada tenant possui políticas configuráveis.

Roteiro
MANUAL
AUTO
Vídeo final
MANUAL
AUTO

Mesmo quando automático, controles de qualidade mínimos devem existir.

Defina uma política de QA adequada.

QA pode posteriormente ser:

humano;
automatizado;
AI-assisted.

Não permita que automação elimine requisitos de segurança/governança.

19. CONSUMO DO PLANO

Planos atuais:

Essential   15 minutos/mês
Growth      30 minutos/mês
Scale       60 minutos/mês
Enterprise  personalizado

A capacidade é medida por minutos de conteúdo audiovisual gerado.

O modelo comercial atual considera geração mínima de aproximadamente 60 segundos por peça; modele isso como política configurável, não como pressuposto estrutural impossível de mudar.

Regra crítica

Toda geração de vídeo concluída com sucesso consome capacidade.

Se:

Attempt 1 = success
Attempt 2 = success
Attempt 3 = success

os três attempts consomem minutos, mesmo que apenas o terceiro seja posteriormente aprovado.

Falha técnica do provider que não produziu geração concluída:

não deve consumir minutos do cliente.

Modele isso com um ledger real.

Não utilize apenas:

remaining_minutes

como fonte canônica.

Crie conceitualmente:

UsageLedger
GenerationAttempt
UsageReservation
UsageCommit
UsageAdjustment

Defina exatamente quando ocorre:

reserve;
commit;
release;
adjustment.

Operações precisam ser idempotentes.

20. PROVIDER COST LEDGER

Consumo do cliente e custo da VYRA são conceitos diferentes.

Registre separadamente custo de:

HeyGen;
ElevenLabs;
LLM;
AWS quando apropriadamente alocável;
outras integrações futuras.

Modele:

ProviderCostLedger

Cada tentativa deve possuir rastreabilidade suficiente para calcular posteriormente:

receita
- provider costs
- infrastructure allocation
= contribuição/margem

Não é necessário construir contabilidade financeira completa no MVP.

21. BILLING

Não haverá gateway de pagamentos no MVP.

Pagamentos ocorrerão externamente.

Mesmo assim devem existir:

Plan;
Subscription;
BillingCycle;
Entitlement;
PaymentStatus;
external/manual payment metadata;
activation;
suspension.

Possíveis estados devem ser arquitetados.

O administrador poderá registrar manualmente situações como:

PENDING
PAID
OVERDUE
SUSPENDED

Não integrar:

Asaas;
Stripe;
Mercado Pago;
Pagar.me;
outro gateway

nesta primeira versão.

A arquitetura pode deixar uma interface futura PaymentProvider, mas não deve implementar providers agora.

22. SOCIAL PUBLISHING

Faz parte do MVP:

Instagram;
Facebook;
TikTok.

Use APIs oficiais.

Meta

Planeje:

OAuth;
Facebook Page;
Instagram Professional Account;
scopes;
token lifecycle;
token refresh;
revogação;
armazenamento criptografado;
publicação;
recuperação de métricas.

Não prometa suporte a contas pessoais quando a API não oferecer.

TikTok

Planeje:

OAuth;
Content Posting API;
Direct Post;
creator information;
permissões;
publicação;
status;
métricas.

Considere desde a arquitetura que aplicativos TikTok não auditados possuem restrições de visibilidade/publicação.

Crie um production launch gate para aprovação/auditoria do aplicativo TikTok.

Conteúdo gerado por IA deve utilizar corretamente os mecanismos oficiais de disclosure/AIGC disponibilizados pelo TikTok.

Não crie mecanismos para esconder a natureza gerada por IA.

23. CALENDÁRIO E PUBLICAÇÃO

Projete calendário editorial.

Um conteúdo pode possuir:

canal;
data;
hora;
campanha;
status;
publicação automática/manual;
external post ID.

Agendamento deve ser confiável e recuperável após restart.

Avalie componentes AWS adequados como:

SQS;
EventBridge;
scheduler;

sem introduzir complexidade desnecessária.

24. PERFORMANCE

Performance faz parte do MVP.

A arquitetura não deve presumir que todas as redes retornam as mesmas métricas.

Modele um snapshot normalizado mais payload original.

Exemplo conceitual:

PerformanceSnapshot

platform
content_id
external_content_id
captured_at

views
reach
likes
comments
shares
saves
watch_time
avg_watch_time
engagement

raw_payload

Campos inexistentes em determinada plataforma podem ser nulos.

Planeje coleta assíncrona em janelas adequadas após publicação.

Evite consultas síncronas aos providers toda vez que o dashboard for aberto.

25. STORAGE E MEDIA

Use AWS S3.

Mídia privada por padrão.

Planeje:

object keys;
tenant boundaries;
lifecycle policies;
presigned URLs;
download seguro;
upload seguro;
MIME validation;
tamanho máximo;
streaming;
thumbnails;
versionamento quando pertinente.

Não coloque vídeos permanentemente no disco do host/container.

Avalie CloudFront para entrega segura quando apropriado.

26. AWS — PRINCÍPIO CANÔNICO

A VYRA deve começar enxuta.

A arquitetura deve estar preparada para crescer, mas não pagar antecipadamente pela escala futura.

Evite:

Kubernetes;
EKS;
dezenas de microsserviços;
infraestrutura redundante sem necessidade;
serviços caros sem métrica que os justifique.
Topologia inicial esperada

Avalie como baseline:

compute EC2 com Docker;
RDS PostgreSQL;
S3;
SQS + DLQ;
ECR;
CloudFront;
Secrets Manager;
KMS;
CloudWatch;
GitHub Actions.

EventBridge pode ser utilizado quando houver justificativa.

Redis/ElastiCache não é obrigatório.

Somente introduza Redis se existir requisito claro que PostgreSQL/SQS não resolvam adequadamente.

Stateless

Aplicações devem ser stateless.

Persistência pertence aos serviços apropriados.

27. AMBIENTES

Separação obrigatória:

development
staging
production

Não compartilhar:

banco;
buckets;
filas;
segredos;
credenciais;
tokens;
provider keys

entre produção e ambientes inferiores.

Providers externos devem suportar mocks/fixtures nos testes.

CI não deve gastar créditos reais.

28. MÉTRICAS AWS E GATES DE ESCALA

Utilize estes valores como baseline inicial de observabilidade e gatilhos de revisão arquitetural.

Compute

Reavaliar capacidade quando houver sustentação de aproximadamente:

CPU > 60%
Memory > 75%
API

Alvos iniciais:

P95 leitura < 500 ms
P95 escrita < 800 ms
Fila

Investigar/escalar quando:

oldest message age > 60 s

de maneira sustentada.

Banco

Investigar capacidade quando houver pressão sustentada em CPU/conexões próxima ou superior a aproximadamente 60% ou saturação perceptível.

Disco

Alertar antes de:

70%

quando houver armazenamento local relevante.

UX

Tela crítica:

< 3 segundos

em condições normais.

Disponibilidade

Meta inicial:

>= 99,5%

Meta de maturidade:

>= 99,9%

Não transforme esses números em autoscaling cego.

Eles são gates para análise e promoção da infraestrutura.

Promoções

Somente evoluir para coisas como:

ALB;
múltiplas instâncias;
ECS/Fargate;
RDS Multi-AZ;
ElastiCache;
maior desacoplamento;

quando métricas, disponibilidade ou risco justificarem.

Documente os critérios objetivos.

29. REGIÃO AWS

Avalie sa-east-1 como região principal candidata, considerando localização majoritária inicial e latência.

Se recomendar outra região, crie ADR demonstrando:

custo;
latência;
disponibilidade de serviços;
compliance;
impacto operacional.

Não escolha uma região silenciosamente.

30. SEGREDOS

Nunca versionar:

API keys;
access tokens;
refresh tokens;
passwords;
signing secrets.

Utilize abordagem baseada em:

Secrets Manager;
KMS;
IAM;
least privilege.

Credenciais Meta/TikTok/HeyGen/ElevenLabs/LLM precisam de proteção equivalente a credenciais financeiras sensíveis.

31. GOVERNANÇA DA IDENTIDADE

Digital Twin e Voice Clone são ativos sensíveis.

Governança é requisito P0.

Modele:

consentimento;
versão do consentimento;
proprietário da identidade;
escopo autorizado;
usos proibidos;
validade;
revogação;
suspensão;
exclusão;
auditoria;
quem aprovou;
quando aprovou;
quais versões estavam ativas.

Revogação deve impedir novas gerações.

Planeje propagação de revogação para providers externos.

32. AUDITORIA

Ações sensíveis devem gerar trilha de auditoria.

Exemplos:

criação do cliente;
mudança de plano;
alteração de permissões;
provisionamento do Twin;
verificação de voz;
ativação;
revogação;
aprovação de roteiro;
aprovação de vídeo;
geração;
publicação;
alteração de automação;
acesso administrativo sensível.

Audit logs não devem ser confundidos com application logs.

33. THREAT MODEL

Produza threat model explícito.

Considere no mínimo:

account takeover;
broken authorization;
tenant escape;
IDOR;
API key leakage;
provider token leakage;
OAuth token theft;
replay de webhook;
webhook spoofing;
SSRF;
malicious upload;
prompt injection;
poisoned knowledge source;
quota bypass;
duplicate generation;
duplicate charge;
unauthorized publication;
identity misuse;
voice misuse;
consent bypass;
privilege escalation;
signed URL leakage;
log leakage;
excessive data retention.

Para cada risco relevante, determine mitigação arquitetural.

34. WEBHOOKS

Todos os webhooks devem considerar:

autenticidade;
assinatura quando provider oferecer;
idempotência;
replay protection;
event ID;
deduplicação;
processamento assíncrono;
DLQ;
logs;
reconciliação.

Resposta HTTP do webhook não deve ficar esperando processamento pesado.

35. OBSERVABILIDADE

Defina estratégia usando CloudWatch e componentes adequados.

Obrigatório conceitualmente:

logs estruturados;
correlation ID;
request ID;
job ID;
tenant ID quando seguro;
provider;
latency;
error class;
retries;
queue metrics;
generation metrics;
publication metrics.

Não registre conteúdo sensível desnecessariamente.

Não registre:

tokens;
secrets;
áudio completo;
documentos privados;
prompts inteiros

sem uma política explícita.

Defina dashboards e alarmes fundamentais.

36. PROVIDER RESILIENCE

HeyGen, ElevenLabs, LLMs, Meta e TikTok são sistemas externos.

Nenhum fluxo crítico deve assumir disponibilidade perfeita.

Crie padrão comum para:

ProviderError
ProviderTimeout
ProviderRateLimit
ProviderUnavailable
ProviderRejected
ProviderAuthenticationError
ProviderQuotaExceeded

Defina:

retryability;
backoff;
jitter;
retry budget;
circuit breaker quando justificável;
reconciliation;
dead-letter;
manual recovery.

Não faça retry infinito.

37. IDEMPOTÊNCIA

Idempotência é requisito transversal.

Especialmente em:

geração de voz;
geração de vídeo;
consumo de minutos;
registro de custos;
webhooks;
publicação social;
atualização de métricas.

Projete chaves e regras explicitamente.

38. TESTES

Arquitetura deve prever:

unit tests;
integration tests;
API contract tests;
provider adapter tests;
state machine tests;
authorization tests;
tenancy isolation tests;
migration tests;
queue/retry tests;
idempotency tests;
webhook replay tests;
end-to-end tests;
security tests;
load tests antes de produção.

CI deve utilizar mocks/fixtures.

Nenhuma suíte padrão deve depender de crédito real HeyGen, ElevenLabs ou LLM.

Testes reais externos deverão ser explicitamente classificados e controlados.

39. CI/CD

Projete CI/CD usando GitHub Actions.

Pipeline mínimo conceitual:

lint
typecheck
unit tests
integration tests
security/static checks
build
container build
migration validation
deploy
smoke

Produção precisa de gates adequados.

Não aplique migration destrutiva automaticamente sem estratégia segura.

Container images devem ser rastreáveis por commit SHA.

40. MIGRATIONS

O schema deverá possuir migrations versionadas.

Escolha ORM/query layer por ADR.

Considere:

Prisma;
TypeORM;
Drizzle;
SQL-first;

ou alternativa pertinente.

Escolha uma.

Não deixe duas alternativas abertas sem necessidade.

A decisão precisa considerar:

NestJS;
migrations;
PostgreSQL;
pgvector;
transações;
query safety;
manutenção por agentes.
41. API CONTRACTS

Defina contratos por domínio.

Não é necessário implementar controllers.

Arquitetura deve mostrar:

recursos;
operações;
autorização;
eventos;
erros;
idempotency keys;
paginação;
filtros;
uploads;
approval actions;
content request;
generation;
calendar;
metrics.

Evite endpoints RPC genéricos quando existir recurso de domínio claro.

42. EVENTOS DE DOMÍNIO

Avalie eventos internos como:

ContentRequested
ScriptGenerated
ScriptApproved
VoiceGenerated
RenderRequested
RenderCompleted
RenderFailed
VideoApproved
PublicationScheduled
PublicationCompleted
UsageCommitted
TwinActivated
TwinRevoked

Não transforme tudo em arquitetura event-driven distribuída.

Eventos podem existir dentro do monólito modular e alimentar workers/filas quando necessário.

43. NOTIFICAÇÕES

Planeje notificações para eventos relevantes.

Exemplos:

roteiro aguardando aprovação;
vídeo aguardando aprovação;
geração falhou;
conteúdo publicado;
saldo HeyGen baixo;
integração social expirando;
Voice Clone pronto;
Digital Twin ativo.

Não escolha fornecedor de e-mail arbitrariamente sem ADR ou requisito.

44. OUT OF SCOPE DO MVP

Não incluir agora:

gateway de pagamento;
múltiplos Digital Twins por cliente;
múltiplos usuários de cliente;
YouTube;
LinkedIn;
native mobile app;
editor profissional de vídeo;
live/realtime avatar;
white label;
SSO Enterprise;
marketplace;
Kubernetes;
microservices distribuídos;
data lake;
sistema completo de contabilidade;
dezenas de providers equivalentes;
funcionalidades não justificadas pelo produto atual.

Pode deixar extension points.

Não implemente essas features.

45. ARQUITETURA DEVE SER EXECUTÁVEL POR SONNET

A implementação posterior será executada majoritariamente utilizando Sonnet.

Portanto a arquitetura não pode depender de conhecimento implícito.

Cada decisão importante deve ser suficientemente objetiva para que outro agente implemente sem reinterpretar a intenção.

Produza:

contratos claros;
limites de domínio;
invariantes;
máquinas de estado;
decisões;
acceptance gates;
dependencies;
sequência;
definição de pronto.

Evite documentação genérica do tipo:

"usar boas práticas"

sem especificar quais práticas e como verificá-las.

46. ARTEFATOS DE ARQUITETURA

Utilize a estrutura canônica do Neocortex em:

docs/architecture/

Preserve os artefatos nativos gerados pelo *arch-plan, incluindo estado arquitetural/projeto quando aplicável.

Garanta que o conjunto final cubra, no mínimo:

visão executiva;
escopo MVP/out-of-scope;
contexto do sistema;
arquitetura de módulos;
modelo de domínio;
modelo de dados;
tenancy;
workflows e máquinas de estado;
provider architecture;
HeyGen;
ElevenLabs;
Intelligence Engine;
Knowledge Engine;
Social Publishing;
Performance;
Usage Ledger;
Provider Cost Ledger;
API contracts;
security architecture;
threat model;
AWS topology;
scalability gates;
observability;
CI/CD;
testing strategy;
migrations;
ADR index;
risks;
assumptions;
implementation sequencing.

Pode agrupar tópicos de maneira diferente se o formato canônico do Neocortex for melhor.

Não omita conteúdo para reduzir quantidade de arquivos.

47. ADRs OBRIGATÓRIOS

Crie ADRs para pelo menos:

modular monolith;
monorepo;
frontend stack;
backend stack;
authentication strategy;
tenancy isolation;
PostgreSQL + vector strategy;
ORM/data access;
asynchronous processing;
SQS/DLQ;
provider abstraction;
HeyGen integration;
ElevenLabs integration;
AI provider/model routing;
media storage;
social publishing;
usage ledger;
provider cost ledger;
AWS initial topology;
scaling/promotion gates;
secrets management;
observability;
audit/governance.

Pode adicionar ADRs adicionais.

48. RESEARCH GATE PARA PROVIDERS

Quando arquitetura depender do comportamento de provider externo:

use documentação oficial e atual.

Prioridade:

HeyGen Developers;
ElevenLabs Developers;
Meta Developers;
TikTok Developers;
OpenAI Developers;
documentação oficial DeepSeek.

Não utilize blogs como autoridade se documentação oficial existir.

Não invente:

endpoints;
fields;
limits;
prices;
rate limits;
permissions;
scopes.

Valores que possam mudar devem ser tratados como configuração ou informação operacional, e não constante arquitetural.

49. DECISÕES ATUAIS IMPORTANTES A VALIDAR

Considere como premissas atuais:

HeyGen:
Enterprise API
Digital Twin
Avatar V

Voice:
ElevenLabs
IVC default
PVC premium

AI:
DeepSeek V4 Flash default
GPT-5.6 Terra secondary/high-quality
GPT-5.6 Sol optional escalation

Social:
Instagram
Facebook
TikTok

Payments:
external/manual

Client:
1 user
1 Digital Twin

Valide somente a viabilidade técnica atual.

Não altere o escopo comercial sem conflito técnico incontornável.

50. ARCHITECTURE FITNESS FUNCTIONS

Defina fitness functions verificáveis para impedir degradação arquitetural durante execução.

Exemplos:

nenhum query tenant-owned sem tenant boundary;
nenhum secret em git;
nenhum domínio importando SDK HeyGen diretamente;
nenhum domínio importando SDK ElevenLabs diretamente;
toda geração idempotente;
todo consumo derivado de ledger;
nenhuma mídia persistente em filesystem local;
CI não realiza provider calls faturáveis;
todo webhook idempotente;
todo social token criptografado;
toda rota administrativa autorizada server-side.

Transforme as regras relevantes em verificações automatizáveis quando possível.

51. DEFINITION OF DONE DO ARCH-PLAN

O *arch-plan estará concluído somente quando:

todos os requisitos desta instrução estiverem mapeados;
todas as decisões canônicas do produto estiverem representadas;
arquitetura de módulos estiver clara;
modelo de dados estiver definido;
máquinas de estado estiverem definidas;
contratos de providers estiverem definidos conceitualmente;
AWS estiver definida;
gates de escala estiverem definidos;
segurança estiver definida;
threat model estiver definido;
usage/cost ledgers estiverem definidos;
observabilidade estiver definida;
estratégia de testes estiver definida;
ADRs estiverem produzidos;
riscos estiverem classificados;
não existirem contradições críticas;
implementação posterior puder ser realizada sem redesenhar a arquitetura.
52. PROIBIÇÕES

NÃO:

implemente a aplicação;
inicialize Next.js;
inicialize NestJS;
instale packages;
crie migrations executáveis;
conecte providers reais;
consuma créditos;
crie épicos;
crie stories;
execute implementação;
faça deploy;
crie infraestrutura AWS real;
altere escopo por conveniência;
invente API de provider;
esconda riscos relevantes.
53. AUTORREVISÃO OBRIGATÓRIA

Antes de concluir:

releia toda esta instrução;
releia os documentos canônicos;
confronte requisitos versus arquitetura;
procure contradições;
procure escopo esquecido;
procure overengineering;
procure acoplamento a providers;
procure problemas de tenancy;
procure problemas de idempotência;
procure riscos de consumo/cobrança duplicados;
procure risco de abuso de Digital Twin/voz;
procure lacunas AWS;
procure lacunas de testes.

Corrija os artefatos antes de declarar conclusão.

54. RESULTADO FINAL ESPERADO

Ao terminar, apresente um relatório conciso contendo:

status do arch-plan;
arquivos criados/alterados;
ADRs produzidos;
decisões arquiteturais principais;
arquitetura AWS inicial;
quantidade de módulos;
principais entidades;
máquinas de estado produzidas;
principais riscos;
assumptions;
itens externos necessários para produção;
qualquer decisão realmente bloqueante.

Diferencie explicitamente:

ARCHITECTURE COMPLETE

de:

IMPLEMENTATION NOT STARTED

Não avance para épicos/stories.

Não faça commit automaticamente.

Pare após concluir e validar o arch-plan.
