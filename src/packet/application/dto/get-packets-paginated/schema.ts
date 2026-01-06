import z from 'zod';
import { PAGE_INPUT_SCHEMA } from 'src/utils/pagination';
import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';

export const GET_PACKETS_PAGINATED_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  search: z.string().max(255).optional(),
  tier: z.nativeEnum(SubscriptionTier).optional(),
  highlight: z.boolean().optional(),
  isActive: z.boolean().optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
  orderByField: z.string().max(255).optional(),
});

export type GetPacketsPaginatedInput = z.input<
  typeof GET_PACKETS_PAGINATED_SCHEMA
>;
export type GetPacketsPaginatedTransformed = z.output<
  typeof GET_PACKETS_PAGINATED_SCHEMA
>;

