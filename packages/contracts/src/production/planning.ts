import { z } from 'zod';

const uuid = z.string().uuid();
const timestamp = z.string().datetime({ offset: true });

export const productionRequestSchema = z.object({
  id: uuid,
  tenantId: uuid,
  clientId: uuid,
  objective: z.string().trim().min(1).max(2000),
  material: z.string().trim().min(1).max(10000),
  audience: z.string().trim().min(1).max(1000),
  deadline: timestamp,
  qualityPreference: z.enum(['STANDARD', 'PREMIUM']),
  status: z.enum(['DRAFT', 'PLANNED', 'APPROVED', 'CANCELLED']),
  createdAt: timestamp,
});

export const productionBudgetSchema = z.object({
  id: uuid,
  tenantId: uuid,
  productionRequestId: uuid,
  hardLimitMinor: z.number().int().nonnegative(),
  reservedMinor: z.number().int().nonnegative(),
  currency: z.string().length(3).toUpperCase(),
  status: z.enum(['AUTHORIZED', 'EXHAUSTED', 'CANCELLED']),
}).superRefine((value, context) => {
  if (value.reservedMinor > value.hardLimitMinor) context.addIssue({ code: z.ZodIssueCode.custom, path: ['reservedMinor'], message: 'reservation exceeds hard limit' });
});

export const shotSchema = z.object({
  id: uuid, tenantId: uuid, productionId: uuid, sceneId: uuid, order: z.number().int().nonnegative(),
  type: z.enum(['PRESENTER', 'MOTION', 'BROLL', 'SLIDE', 'GRAPHIC', 'SCREEN', 'PRODUCT', 'TRANSITION']),
  targetDurationSeconds: z.number().positive(), routingClass: z.string().trim().min(1),
  qualityTier: z.enum(['STANDARD', 'HIGH', 'PREMIUM']), status: z.enum(['DRAFT', 'READY']),
});

export const productionPlanSchema = z.object({
  id: uuid, tenantId: uuid, productionRequestId: uuid, productionPackId: z.string().min(1),
  productionPackVersion: z.number().int().positive(), estimatedDurationSeconds: z.number().nonnegative().optional(),
  chapters: z.array(z.object({ id: uuid, order: z.number().int().nonnegative(), title: z.string().min(1), scenes: z.array(z.object({ id: uuid, order: z.number().int().nonnegative(), shots: z.array(shotSchema) })) })),
  provenance: z.object({ planner: z.string().min(1), model: z.string().min(1), templateVersion: z.string().min(1), sourceRefs: z.array(z.string()).optional() }),
});

export const productionPolicySchema = z.object({
  id: uuid, tenantId: uuid, qualityFloor: z.enum(['STANDARD', 'HIGH', 'PREMIUM']),
  maxDurationSeconds: z.number().positive(), requiresHumanApproval: z.boolean(), version: z.number().int().positive(),
});

export const costEstimateSchema = z.object({
  id: uuid, tenantId: uuid, productionRequestId: uuid, planId: uuid,
  amountMinor: z.number().int().nonnegative(), currency: z.string().length(3).toUpperCase(), rateCardVersion: z.string().min(1),
  status: z.enum(['DRAFT', 'AUTHORIZED', 'REJECTED']),
});

export type ProductionRequest = z.infer<typeof productionRequestSchema>;
export type ProductionBudget = z.infer<typeof productionBudgetSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type ProductionPlan = z.infer<typeof productionPlanSchema>;
export type ProductionPolicy = z.infer<typeof productionPolicySchema>;
export type CostEstimate = z.infer<typeof costEstimateSchema>;
