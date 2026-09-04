# ADR-0118 — UI/UX canônica em Português do Brasil

**Status:** Proposed for approval

## Contexto
As primeiras fundações visuais estavam corretas em estrutura, mas ainda pareciam protótipo técnico e continham termos em inglês.

O usuário forneceu referências visuais concretas para área interna e portal do cliente e determinou:
- interface intuitiva;
- pouco texto;
- tipografia menor e refinada;
- todo conteúdo visível em Português do Brasil.

## Decisão proposta
Adotar `docs/uiux/` como contrato canônico de implementação visual.

Regras:
- PT-BR em toda interface comum;
- Geist para títulos/métricas;
- Inter para corpo;
- hierarquia mais editorial/premium;
- pouca microcopy permanente;
- progressive disclosure;
- layout inspirado nas referências anexadas;
- área interna mais densa;
- portal mais leve;
- provider oculto do fluxo padrão.

## Consequência
Frontend deve ser implementado a partir desse contrato e não de interpretações livres do design anterior.
