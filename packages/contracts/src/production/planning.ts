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

export type ProductionRequest = z.infer<typeof productionRequestSchema>;
export type ProductionBudget = z.infer<typeof productionBudgetSchema>;
