import { describe, expect, it } from 'vitest';
import { productionPlanSchema } from '../src/production/planning';

const id = 'a3d1a2c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
describe('Wave 2 mock production plan', () => {
  it('accepts a chapter-scene-shot hierarchy with routing class', () => {
    const plan = productionPlanSchema.parse({ id, tenantId: id, productionRequestId: id, productionPackId: 'starter', productionPackVersion: 1, chapters: [{ id, order: 0, title: 'Intro', scenes: [{ id, order: 0, shots: [{ id, tenantId: id, productionId: id, sceneId: id, order: 0, type: 'PRESENTER', targetDurationSeconds: 10, routingClass: 'presenter.standard', qualityTier: 'STANDARD', status: 'READY' }] }] }], provenance: { planner: 'mock-planner', model: 'deterministic', templateVersion: 'v1' } });
    expect(plan.chapters[0]?.scenes[0]?.shots[0]?.routingClass).toBe('presenter.standard');
  });
});
