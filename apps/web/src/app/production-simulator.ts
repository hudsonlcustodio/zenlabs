export type QualityPreference = 'STANDARD' | 'PREMIUM';

export interface ProductionDraft {
  client: string;
  objective: string;
  audience: string;
  material: string;
  deadline: string;
  qualityPreference: QualityPreference;
  budgetLimitReais: number;
  consentConfirmed: boolean;
}

export interface ProductionSimulation {
  estimatedCostReais: number;
  estimatedDurationSeconds: number;
  route: string;
  status: 'READY';
}

export type SimulationResult =
  | { ok: true; simulation: ProductionSimulation }
  | { ok: false; reason: 'consent_required' | 'budget_guard_triggered' };

export function simulateProduction(draft: ProductionDraft): SimulationResult {
  if (!draft.consentConfirmed) return { ok: false, reason: 'consent_required' };
  const estimatedCostReais = draft.qualityPreference === 'PREMIUM' ? 9 : 5;
  if (estimatedCostReais > draft.budgetLimitReais) {
    return { ok: false, reason: 'budget_guard_triggered' };
  }
  return {
    ok: true,
    simulation: {
      estimatedCostReais,
      estimatedDurationSeconds: 10,
      route: draft.qualityPreference === 'PREMIUM' ? 'Cinemática premium' : 'Apresentador direto',
      status: 'READY',
    },
  };
}
