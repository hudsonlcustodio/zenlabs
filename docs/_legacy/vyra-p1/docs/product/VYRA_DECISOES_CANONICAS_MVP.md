# VYRA — Decisões Canônicas do MVP

Status: CANÔNICO para planejamento arquitetural inicial.

## Produto

VYRA é uma plataforma de Digital Twin as a Service com operação gerenciada de conteúdo audiovisual. O produto deve coordenar identidade digital, voz, conhecimento, geração assistida por IA, vídeo, aprovação, calendário, publicação, governança, consumo e performance. O cliente não deve precisar operar diretamente prompts, filas técnicas ou dashboards dos provedores.

## Decisões funcionais

- Pautas e roteiros serão gerados por IA dentro da VYRA.
- O cliente poderá solicitar novos conteúdos diretamente pelo portal.
- Aprovação de roteiro será configurável por cliente: MANUAL ou AUTO.
- Aprovação do vídeo final será configurável por cliente: MANUAL ou AUTO.
- Publicação automática faz parte do MVP para Instagram, Facebook e TikTok.
- Performance/analytics faz parte do MVP.
- Pagamentos serão externos no MVP. Não haverá gateway de pagamento inicialmente.
- Cada cliente terá inicialmente 1 Digital Twin.
- Cada cliente terá inicialmente 1 usuário de portal.
- A equipe interna VYRA terá múltiplos papéis/permissões operacionais.
- O consumo do plano é contabilizado por toda geração de vídeo concluída com sucesso, inclusive regenerações posteriores; falhas técnicas de provider não devem consumir minutos do cliente.

## Planos comerciais atuais

- Essential: 15 minutos/mês.
- Growth: 30 minutos/mês.
- Scale: 60 minutos/mês.
- Enterprise: capacidade personalizada.

A assinatura, ciclo, status financeiro e entitlement devem existir internamente, mas o pagamento será registrado externamente/manual no MVP.

## Vídeo / Digital Twin

- Provider inicial: HeyGen Enterprise API.
- A conta Enterprise ainda será contratada; o desenvolvimento não pode depender de credenciais live para avançar.
- A operação de produção deve ser API-first, inclusive provisionamento do Digital Twin quando suportado pelo contrato/API.
- Engine padrão desejado: Avatar V.
- Antes de renderizar, a aplicação deve validar as capacidades do look/avatar e não assumir suporte a Avatar V.
- Créditos/saldo de API devem ser monitorados pela VYRA.
- HeyGen deve ficar atrás de uma abstração de provider; nenhum domínio central deve depender diretamente de DTOs/endpoints do provider.

## Voz

- Provider inicial: ElevenLabs.
- Instant Voice Clone (IVC) será o caminho padrão inicial.
- Professional Voice Clone (PVC) será suportado como opção premium/calibração avançada, respeitando integralmente verificação de propriedade da voz, consentimento e políticas do provider.
- A voz deve ser tratada como subsistema/provider próprio, separado do provider de vídeo.

## Inteligência Artificial

- A arquitetura deve ser multi-provider e configurável.
- DeepSeek V4 Flash será opção/default de alto volume e baixo custo.
- Deve existir ao menos uma alternativa de maior qualidade, sem acoplamento do domínio a nomes fixos de modelos.
- Model routing deve ser configurável por tarefa, cliente/política e ambiente.
- Modelos usados pelo Neocortex/Claude Code para desenvolvimento não são automaticamente modelos runtime do produto.

## AWS

- A aplicação será hospedada em AWS.
- Começar enxuto e promover infraestrutura somente por métricas observadas.
- Evitar Kubernetes/microsserviços e infraestrutura cara prematuramente.
- Aplicação deve ser stateless; banco e mídia não devem depender do disco do container/host.
- Ambientes development, staging e production devem ser isolados.
- Segredos nunca devem ser versionados.

## Governança

Digital Twin e Voice Clone são ativos de identidade sensíveis. O produto deve nascer com consentimento, autorização, escopo, rastreabilidade, revogação, exclusão, controle de acesso e auditoria como requisitos de produto, não como melhorias futuras.
