import { NewProductionFlow } from './new-production-flow';

const productions = [
  { title: 'Boletim semanal', client: 'Aurora Saúde', stage: 'Planejamento', route: 'Apresentador direto', cost: 'R$ 5,00' },
  { title: 'Treinamento comercial', client: 'Norte Educação', stage: 'Pronto para mídia', route: 'Voice Master + visual', cost: 'R$ 9,00' },
  { title: 'Manifesto de marca', client: 'Estúdio Horizonte', stage: 'Aguardando política', route: 'Cinemática', cost: 'R$ 9,00' },
];

export default function Page() {
  return <main className="shell">
    <aside className="sidebar" aria-label="Navegação principal">
      <div className="brand"><span className="brand-mark">Z</span><span>ZENLABS</span></div>
      <nav><a className="nav-active" href="#visao-geral">Visão geral</a><a href="#producoes">Produções</a><a href="#clones">Clones digitais</a><a href="#media">Media Plane</a><a href="#excecoes">Exceções</a></nav>
      <div className="tenant"><strong>Aurum Soltec</strong><span>Ambiente simulado</span></div>
    </aside>
    <section className="workspace" id="visao-geral">
      <header className="topbar"><div><p className="kicker">Centro de produção</p><h1>Operação sob controle</h1></div><NewProductionFlow /></header>
      <div className="notice" role="status"><strong>Wave 3 ativa em modo simulado.</strong> Providers reais permanecem bloqueados até o gate de mídia.</div>
      <section className="metrics" aria-label="Indicadores operacionais">
        <article><span>Produções abertas</span><strong>12</strong><small>3 exigem atenção</small></article><article><span>Clones ativos</span><strong>8</strong><small>Consentimento válido</small></article><article><span>Jobs de mídia</span><strong>24</strong><small>Sem duplicidade detectada</small></article><article><span>Orçamento reservado</span><strong>R$ 73</strong><small>Dados simulados</small></article>
      </section>
      <div className="content-grid">
        <section className="panel productions" id="producoes"><div className="panel-heading"><div><h2>Produções recentes</h2><p>Planejamento, custo e rota em uma única visão.</p></div><a href="#producoes">Ver todas</a></div><div className="table-wrap"><table><thead><tr><th>Produção</th><th>Etapa</th><th>Rota</th><th>Custo</th></tr></thead><tbody>{productions.map((item) => <tr key={item.title}><td><strong>{item.title}</strong><span>{item.client}</span></td><td><span className="status">{item.stage}</span></td><td>{item.route}</td><td className="money">{item.cost}</td></tr>)}</tbody></table></div></section>
        <aside className="panel attention" id="excecoes"><div className="panel-heading"><div><h2>Requer atenção</h2><p>Operação por exceção.</p></div></div><ol><li><strong>Consentimento expira em 3 dias</strong><span>Aurora Saúde</span></li><li><strong>Política bloqueou custo premium</strong><span>Manifesto de marca</span></li><li><strong>Capability indisponível</strong><span>Rota de lip-sync simulada</span></li></ol></aside>
      </div>
      <section className="pipeline" id="media"><div className="panel-heading"><div><h2>Media Plane</h2><p>Estado atual dos executores simulados.</p></div><span className="mode">MOCK</span></div><div className="providers">{['ElevenLabs', 'HeyGen', 'Runway', 'Sync Labs', 'Kling', 'Veo'].map((name) => <div key={name}><span className="signal" aria-label="Disponível"/><strong>{name}</strong><small>Adapter pronto</small></div>)}</div></section>
    </section>
  </main>;
}
