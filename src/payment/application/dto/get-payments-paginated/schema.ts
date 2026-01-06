import z from 'zod';
import { PAGE_INPUT_SCHEMA } from 'src/utils/pagination';
import {
  PaymentMethod,
  PaymentStatus,
} from 'src/payment/domain/entities/payment.entity';
import { CurrencyCode } from 'src/shared/core/types';

export const GET_PAYMENTS_PAGINATED_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  search: z.string().max(255).optional(),
  orderByField: z.string().max(255).optional(),
  currency: z.nativeEnum(CurrencyCode).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
});

export type GetPaymentsPaginatedInput = z.input<
  typeof GET_PAYMENTS_PAGINATED_SCHEMA
>;
export type GetPaymentsPaginatedTransformed = z.output<
  typeof GET_PAYMENTS_PAGINATED_SCHEMA
>;
