import z from 'zod';
import {
  PaymentMethod,
  PaymentStatus,
} from 'src/payment/domain/entities/payment.entity';
import { CurrencyCode } from 'src/shared/core/types';

export const PAYMENT_MONEY_SCHEMA = z.strictObject({
  gross: z.coerce.number().int().nonnegative(),
  net: z.coerce.number().int().nonnegative(),
  currency: z.nativeEnum(CurrencyCode),
  taxRate: z.coerce.number(),
  taxAmount: z.coerce.number().int().nonnegative(),
});

export const PAYMENT_DETAILS_SCHEMA = z.strictObject({
  status: z.nativeEnum(PaymentStatus),
  providerId: z.string().min(1).max(255),
  method: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  paidAt: z.coerce.date().optional(),
  invoiceId: z.string().max(255).optional(),
  refundedAmount: z.coerce.number().int().nonnegative().optional(),
  refundReason: z.string().max(1000).optional(),
  attemptedAt: z.coerce.date().optional(),
  failureCode: z.string().max(255).optional(),
  failureMessage: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type PaymentMoneyInput = z.input<typeof PAYMENT_MONEY_SCHEMA>;
export type PaymentMoneyTransformed = z.output<typeof PAYMENT_MONEY_SCHEMA>;
export type PaymentDetailsInput = z.input<typeof PAYMENT_DETAILS_SCHEMA>;
export type PaymentDetailsTransformed = z.output<typeof PAYMENT_DETAILS_SCHEMA>;

