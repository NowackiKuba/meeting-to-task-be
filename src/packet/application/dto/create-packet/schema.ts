import z from 'zod';
import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';
import {
  PACKET_FEATURES_SCHEMA,
  PacketFeaturesInput,
  PacketFeaturesTransformed,
} from '../common';

export const CREATE_PACKET_SCHEMA = z.strictObject({
  name: z.string().min(1).max(255),
  tier: z.nativeEnum(SubscriptionTier),
  monthlyAmount: z.coerce.number().int().nonnegative(),
  yearlyAmount: z.coerce.number().int().nonnegative(),
  monthlyPriceId: z.string().min(1).max(255),
  yearlyPriceId: z.string().min(1).max(255),
  features: PACKET_FEATURES_SCHEMA.optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  sortOrder: z.coerce.number().int().optional(),
  iconUrl: z.string().url().optional(),
  trialDays: z.coerce.number().int().nonnegative().optional(),
  highlight: z.boolean().optional(),
});

export type CreatePacketInput = z.input<typeof CREATE_PACKET_SCHEMA> & {
  features?: PacketFeaturesInput;
};
export type CreatePacketTransformed = z.output<typeof CREATE_PACKET_SCHEMA> & {
  features?: PacketFeaturesTransformed;
};

