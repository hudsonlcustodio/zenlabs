'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { simulateProduction, type ProductionDraft, type ProductionSimulation } from './production-simulator';

const initialDraft: ProductionDraft = { client: 'Aurora Saúde', objective: '', audience: '', material: '', deadline: '', qualityPreference: 'STANDARD', budgetLimitReais: 10, consentConfirmed: false };

export function NewProductionFlow() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState('');
  const [simulation, setSimulation] = useState<ProductionSimulation | null>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  function update<K extends keyof ProductionDraft>(key: K, value: ProductionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = simulateProduction(draft);
    if (!result.ok) {
      setSimulation(null);
      setError(result.reason === 'consent_required' ? 'Confirme o consentimento válido antes de planejar a produção.' : 'O orçamento informado não cobre o custo estimado desta rota.');
      return;
    }
    setSimulation(result.simulation);
  }

  function close() { setOpen(false); setError(''); setSimulation(null); }

  return <>
    <button type="button" className="primary-action" onClick={() => setOpen(true)}>Nova produção</button>
    {open && <div className="dialog-backdrop" role="presentation">
      <section className="production-dialog" role="dialog" aria-modal="true" aria-labelledby="production-title">
        <header className="dialog-header"><div><p className="kicker">Planejamento simulado</p><h2 id="production-title">Nova produção</h2></div><button className="close-action" style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)' }} type="button" onClick={close}>Fechar</button></header>
        {!simulation ? <form onSubmit={submit} className="production-form">
          <div className="form-grid">
            <label>Cliente<select value={draft.client} onChange={(event) => update('client', event.target.value)}><option>Aurora Saúde</option><option>Norte Educação</option><option>Estúdio Horizonte</option></select></label>
            <label>Prazo<input required type="datetime-local" value={draft.deadline} onChange={(event) => update('deadline', event.target.value)} /></label>
            <label className="full-field">Objetivo<input required maxLength={2000} placeholder="Ex.: boletim semanal para clientes" value={draft.objective} onChange={(event) => update('objective', event.target.value)} /></label>
            <label className="full-field">Público<input required maxLength={1000} placeholder="Ex.: gestores de clínicas parceiras" value={draft.audience} onChange={(event) => update('audience', event.target.value)} /></label>
            <label className="full-field">Material<textarea required maxLength={10000} rows={4} placeholder="Cole o roteiro ou descreva o conteúdo-base." value={draft.material} onChange={(event) => update('material', event.target.value)} /></label>
          </div>
          <fieldset className="choice-group"><legend>Qualidade</legend><label><input type="radio" name="quality" checked={draft.qualityPreference === 'STANDARD'} onChange={() => update('qualityPreference', 'STANDARD')} /><span><strong>Padrão</strong><small>Rota direta, estimativa de R$ 5,00</small></span></label><label><input type="radio" name="quality" checked={draft.qualityPreference === 'PREMIUM'} onChange={() => update('qualityPreference', 'PREMIUM')} /><span><strong>Premium</strong><small>Rota cinematográfica, estimativa de R$ 9,00</small></span></label></fieldset>
          <label className="budget-field">Limite de orçamento (R$)<input required min="0" step="1" type="number" value={draft.budgetLimitReais} onChange={(event) => update('budgetLimitReais', Number(event.target.value))} /></label>
          <label className="consent-check"><input type="checkbox" checked={draft.consentConfirmed} onChange={(event) => update('consentConfirmed', event.target.checked)} /><span><strong>Consentimento válido confirmado</strong><small>A produção continuará sujeita às políticas e à aprovação humana.</small></span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <footer className="dialog-footer"><button className="secondary-action" style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)' }} type="button" onClick={close}>Cancelar</button><button className="primary-action" type="submit">Simular planejamento</button></footer>
        </form> : <div className="simulation-result" aria-live="polite">
          <div className="result-mark">Pronto</div><h3>Plano gerado com segurança</h3><p>O orçamento foi reservado em ambiente simulado. Nenhum provedor externo foi acionado.</p>
          <dl><div><dt>Rota</dt><dd>{simulation.route}</dd></div><div><dt>Duração estimada</dt><dd>{simulation.estimatedDurationSeconds} segundos</dd></div><div><dt>Custo reservado</dt><dd>R$ {simulation.estimatedCostReais.toFixed(2).replace('.', ',')}</dd></div><div><dt>Próxima decisão</dt><dd>Aprovação humana</dd></div></dl>
          <footer className="dialog-footer"><button className="secondary-action" style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)' }} type="button" onClick={() => setSimulation(null)}>Revisar dados</button><button className="primary-action" type="button" onClick={close}>Concluir simulação</button></footer>
        </div>}
      </section>
    </div>}
  </>;
}
