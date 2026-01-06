import { SubscriptionInterval } from 'src/subscription/domain/entities/subscription.entity';
import z from 'zod';

export const CREATE_CHECKOUT_SESSION_SCHEMA = z.strictObject({
  expiresInMs: z.number().int().positive().optional(),
  packetId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  interval: z.nativeEnum(SubscriptionInterval),
  email: z.string().email(),
});

export const INPUT_VERSION = '1.0.0';

export type CreateCheckoutSessionInput = z.input<
  typeof CREATE_CHECKOUT_SESSION_SCHEMA
>;
export type CreateCheckoutSessionTransformed = z.output<
  typeof CREATE_CHECKOUT_SESSION_SCHEMA
>;
