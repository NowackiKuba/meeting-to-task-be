import z from 'zod';

export const UPDATE_CREDIT_SCHEMA = z.strictObject({
  balance: z.coerce.number().int().optional(),
  baseBalance: z.coerce.number().int().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  totalUsed: z.coerce.number().int().optional(),
  lastUsedAt: z.coerce.date().optional(),
  lastResetAt: z.coerce.date().optional(),
  resetReason: z.string().optional(),
});

export const INPUT_VERSION = '1.0.0';

export type UpdateCreditInput = z.input<typeof UPDATE_CREDIT_SCHEMA>;
export type UpdateCreditTransformed = z.output<typeof UPDATE_CREDIT_SCHEMA>;
