# SCENE GRAPH

## Canonical hierarchy

```text
Production
└── Chapter
    └── Scene
        └── Shot
```

## Production
Representa o vídeo final.

## Chapter
Macro bloco semântico de long-form.

## Scene
Unidade narrativa/visual coerente.

## Shot
Menor unidade roteável para execução.

## Shot contract

Campos mínimos:

- `id`
- `tenantId`
- `productionId`
- `sceneId`
- `order`
- `type`
- `scriptRange`
- `audioRange`
- `targetDurationSeconds`
- `visualIntent`
- `framing`
- `environment`
- `action`
- `cameraDirection`
- `qualityTier`
- `routingClass`
- `identityRequired`
- `voiceRequired`
- `motionReferenceId?`
- `estimatedCost`
- `actualCost?`
- `status`

## Important boundary

`providerId` e `providerJobId` não pertencem ao Shot editorial.

Eles pertencem ao `MediaJob`.

Isso permite rerouting sem alterar a intenção criativa.
