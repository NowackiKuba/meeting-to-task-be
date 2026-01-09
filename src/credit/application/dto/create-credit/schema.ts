import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';
import z from 'zod';

export const CREATE_CREDIT_HISTORY_SCHEMA = z.strictObject({
  creditId: z.string().uuid(),
  amount: z.coerce.number().int(),
  type: z.nativeEnum(CreditHistoryType),
  balanceBefore: z.coerce.number().int(),
  balanceAfter: z.coerce.number().int(),
  reason: z.string().optional(),
  description: z.string().optional(),
  referenceId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const INPUT_VERSION = '1.0.0';

export type CreateCreditHistoryInput = z.input<
  typeof CREATE_CREDIT_HISTORY_SCHEMA
>;
export type CreateCreditHistoryTransformed = z.output<
  typeof CREATE_CREDIT_HISTORY_SCHEMA
>;
