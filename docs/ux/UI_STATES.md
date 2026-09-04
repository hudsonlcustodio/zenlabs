# UI STATES

Todo screen spec deve prever:

## Loading
- skeleton onde estrutura é conhecida;
- spinner apenas em ação pequena.

## Empty
Título + 1 frase + ação.

## Error
Mensagem humana + retry/action.

## Permission
Sem revelar recurso/tenant indevido.

## Partial data
Mostrar dados válidos e sinalizar ausência.

## Processing
Estado assíncrono não bloqueia tela inteira.

## Provider degraded
Só interno; operação normal continua quando houver route alternativa.

## Budget hold
Bloqueio claro, custo/limite visíveis, ação explícita.

## Consent block
Bloqueio crítico, nunca override de IA.

## Cancelled
Estado final visível sem parecer erro ativo.

## Offline / stale
Mostrar timestamp de atualização quando decisão depender de freshness.
