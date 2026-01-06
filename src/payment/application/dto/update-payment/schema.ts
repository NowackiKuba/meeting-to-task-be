import z from 'zod';
import { PAYMENT_DETAILS_SCHEMA, PAYMENT_MONEY_SCHEMA } from '../common';

export const UPDATE_PAYMENT_SCHEMA = PAYMENT_MONEY_SCHEMA.merge(
  PAYMENT_DETAILS_SCHEMA,
)
  .partial()
  .extend({
    subscriptionId: z.string().uuid().optional(),
  });

export type UpdatePaymentInput = z.input<typeof UPDATE_PAYMENT_SCHEMA>;
export type UpdatePaymentTransformed = z.output<typeof UPDATE_PAYMENT_SCHEMA>;

