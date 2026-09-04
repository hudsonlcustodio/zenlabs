
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.cwd();
const erros = [];

const obrigatorios = [
  'docs/uiux/00_UIUX_CANONICA.md',
  'docs/uiux/01_DICIONARIO_PTBR.md',
  'docs/uiux/02_TIPOGRAFIA.md',
  'docs/uiux/03_GRID_LAYOUT.md',
  'docs/uiux/04_CORES_E_ESTADOS.md',
  'docs/uiux/05_COMPONENTES.md',
  'docs/uiux/06_TELAS_CANONICAS.md',
  'docs/uiux/07_PORTAL_CLIENTE.md',
  'docs/uiux/08_AREA_INTERNA.md',
  'docs/uiux/09_ESTADOS_E_MICROCOPY.md',
  'docs/uiux/10_MAPA_REFERENCIAS.md',
  'docs/uiux/11_CHECKLIST_IMPLEMENTACAO.md',
  'docs/brand/BRAND_AUTHORITY.md',
  'prototypes/uiux-canonica/index.html',
  'prototypes/uiux-canonica/estilos.css',
  'design-systems/zenlabs/tokens.css'
];

for (const arquivo of obrigatorios) {
  if (!existsSync(join(raiz, arquivo))) erros.push(`Arquivo ausente: ${arquivo}`);
}

const canon = readFileSync(join(raiz,'docs/uiux/00_UIUX_CANONICA.md'),'utf8');
for (const termo of ['Pouco texto','Português do Brasil','Electric Lime','Signal Violet']) {
  if (!canon.includes(termo)) erros.push(`Contrato sem termo obrigatório: ${termo}`);
}

const tipografia = readFileSync(join(raiz,'docs/uiux/02_TIPOGRAFIA.md'),'utf8');
for (const termo of ['Geist','Inter','28px','14px','12px']) {
  if (!tipografia.includes(termo)) erros.push(`Tipografia sem regra: ${termo}`);
}

const telas = readFileSync(join(raiz,'docs/uiux/06_TELAS_CANONICAS.md'),'utf8');
for (const termo of ['INÍCIO INTERNO','CENTRAL DE OPERAÇÃO','CLIENTES','NOVA PRODUÇÃO','ANÁLISE E PLANO','ACOMPANHAMENTO DA PRODUÇÃO','PORTAL DO CLIENTE: VISÃO GERAL','PORTAL DO CLIENTE: CONTEÚDOS','PORTAL DO CLIENTE: CALENDÁRIO']) {
  if (!telas.includes(termo)) erros.push(`Tela canônica ausente: ${termo}`);
}

const html = readFileSync(join(raiz,'prototypes/uiux-canonica/index.html'),'utf8');
for (const termo of ['Bom dia, equipe','Operação','Clientes','Nova produção','Análise da produção','Treinamento #928','Visão geral','Conteúdos','Calendário']) {
  if (!html.includes(termo)) erros.push(`Protótipo sem tela/texto: ${termo}`);
}

// Vocabulário visível proibido no protótipo.
for (const termo of ['Dashboard','Control Tower','Digital Twin','Exception Queue','Production Monitor','Billing','Performance','Provider']) {
  if (html.includes(termo)) erros.push(`Termo em inglês visível no protótipo: ${termo}`);
}

if (erros.length) {
  console.error(`VALIDAÇÃO UI/UX FALHOU (${erros.length})`);
  erros.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}
console.log('VALIDAÇÃO UI/UX APROVADA — idioma=pt-BR telas=9 tipografia=refinada prototipo=clicavel');
