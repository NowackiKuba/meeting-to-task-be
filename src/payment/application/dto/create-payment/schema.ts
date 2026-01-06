import z from 'zod';
import { PAYMENT_DETAILS_SCHEMA, PAYMENT_MONEY_SCHEMA } from '../common';

export const CREATE_PAYMENT_SCHEMA = PAYMENT_MONEY_SCHEMA.merge(
  PAYMENT_DETAILS_SCHEMA,
).extend({
  subscriptionId: z.string().uuid().optional(),
});

export type CreatePaymentInput = z.input<typeof CREATE_PAYMENT_SCHEMA>;
export type CreatePaymentTransformed = z.output<typeof CREATE_PAYMENT_SCHEMA>;
