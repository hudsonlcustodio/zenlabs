import { describe, expect, it } from 'vitest';
import { simulateProduction, type ProductionDraft } from '../src/app/production-simulator';

const draft: ProductionDraft = {
  client: 'Aurora Saúde', objective: 'Boletim', audience: 'Clientes', material: 'Roteiro',
  deadline: '2026-09-10T12:00', qualityPreference: 'STANDARD', budgetLimitReais: 10,
  consentConfirmed: true,
};

describe('simulador de nova produção', () => {
  it('planeja a rota padrão dentro do orçamento', () => {
    expect(simulateProduction(draft)).toMatchObject({ ok: true, simulation: { estimatedCostReais: 5, route: 'Apresentador direto' } });
  });

  it('bloqueia a produção sem consentimento confirmado', () => {
    expect(simulateProduction({ ...draft, consentConfirmed: false })).toEqual({ ok: false, reason: 'consent_required' });
  });

  it('aplica o budget guard antes de reservar a rota premium', () => {
    expect(simulateProduction({ ...draft, qualityPreference: 'PREMIUM', budgetLimitReais: 8 })).toEqual({ ok: false, reason: 'budget_guard_triggered' });
  });
});
