import z from 'zod';
import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';
import {
  PACKET_FEATURES_SCHEMA,
  PacketFeaturesInput,
  PacketFeaturesTransformed,
} from '../common';

export const UPDATE_PACKET_SCHEMA = z.strictObject({
  name: z.string().min(1).max(255).optional(),
  tier: z.nativeEnum(SubscriptionTier).optional(),
  monthlyAmount: z.coerce.number().int().nonnegative().optional(),
  yearlyAmount: z.coerce.number().int().nonnegative().optional(),
  monthlyPriceId: z.string().min(1).max(255).optional(),
  yearlyPriceId: z.string().min(1).max(255).optional(),
  features: PACKET_FEATURES_SCHEMA.optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  sortOrder: z.coerce.number().int().optional(),
  iconUrl: z.string().url().optional(),
  trialDays: z.coerce.number().int().nonnegative().optional(),
  highlight: z.boolean().optional(),
});

export type UpdatePacketInput = z.input<typeof UPDATE_PACKET_SCHEMA> & {
  features?: PacketFeaturesInput;
};
export type UpdatePacketTransformed = z.output<typeof UPDATE_PACKET_SCHEMA> & {
  features?: PacketFeaturesTransformed;
};

