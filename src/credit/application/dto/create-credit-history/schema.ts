import z from 'zod';

export const CREATE_CREDIT_SCHEMA = z.strictObject({
  balance: z.coerce.number().int(),
  baseBalance: z.coerce.number().int(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const INPUT_VERSION = '1.0.0';

export type CreateCreditInput = z.input<typeof CREATE_CREDIT_SCHEMA>;
export type CreateCreditTransformed = z.output<typeof CREATE_CREDIT_SCHEMA>;
