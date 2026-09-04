# Protótipo canônico ZENLABS

Protótipo estático clicável para validação visual.

Telas incluídas:
- Início
- Operação
- Clientes
- Nova produção
- Análise da produção
- Acompanhamento da produção
- Portal do cliente — Visão geral
- Portal do cliente — Conteúdos
- Portal do cliente — Calendário

## Objetivo
Validar:
- tipografia;
- densidade;
- hierarquia;
- navegação;
- PT-BR;
- proporções;
- uso de Lime/Violeta;
- alinhamento com as referências aprovadas.

Não é código de produção.

## Compatibilidade de visualização

`index.html` agora é **autossuficiente**:
- CSS incorporado no próprio HTML;
- logomarca incorporada em base64;
- não depende de arquivos irmãos para abrir corretamente no preview do ChatGPT ou diretamente no navegador.

Também existe `ABRIR_PROTOTIPO_ZENLABS.html` na raiz do pacote.

## Correção aplicada
- ícones do menu lateral substituídos por ícones vetoriais incorporados via CSS mask.
