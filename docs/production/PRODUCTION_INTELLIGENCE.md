# PRODUCTION INTELLIGENCE

## Purpose

Production Intelligence transforma intenção e roteiro em um plano audiovisual executável, versionado, custeável e governável.

## Pipeline

```text
ProductionRequest
  ↓
ProductionAnalysis
  ↓
Pack Recommendation
  ↓
ProductionPlan
  ↓
SceneGraph
  ↓
CostEstimate
  ↓
Policy Decision
  ↓
Execution Plan
```

## Components

### ObjectiveSelector
Classifica finalidade sem escolher provider.

### ScriptAnalyzer
Extrai:
- capítulos;
- conceitos;
- duração estimada;
- riscos;
- oportunidades visuais;
- conteúdo que exige fonte/validação.

### AI Production Director
Cria alternativas de produção e recomenda uma.

### PackCatalog
Recipes versionadas e mensuráveis.

### SceneGraphBuilder
Converte script em Chapter → Scene → Shot.

### VoiceDirector
Cria VoicePerformancePlan e timing.

### CostEstimator
Determinístico. Nunca LLM.

### PolicyEvaluator
Determinístico. Decide auto-approval/human gate.

## LLM output contract

Toda saída probabilística deve:
- ser schema-validated;
- carregar model/version;
- carregar prompt/template version;
- carregar source/provenance refs quando usar conhecimento;
- ter confidence/flags quando aplicável;
- não efetuar side effect diretamente.
