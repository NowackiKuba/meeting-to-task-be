import z from 'zod';
import { PAGE_INPUT_SCHEMA } from 'src/utils/pagination';
import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';

export const GET_CREDIT_HISTORY_PAGINATED_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  type: z.nativeEnum(CreditHistoryType).optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
  orderByField: z.string().max(255).optional(),
});

export type GetCreditHistoryPaginatedInput = z.input<
  typeof GET_CREDIT_HISTORY_PAGINATED_SCHEMA
>;
export type GetCreditHistoryPaginatedTransformed = z.output<
  typeof GET_CREDIT_HISTORY_PAGINATED_SCHEMA
>;
