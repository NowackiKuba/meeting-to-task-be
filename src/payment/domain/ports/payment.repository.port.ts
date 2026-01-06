import { Page } from 'src/utils/pagination';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../entities/payment.entity';
import { CurrencyCode } from 'src/shared/core/types';

export type Filters = {
  offset?: number;
  limit?: number;
  search?: string;
  currency?: CurrencyCode;
  method?: PaymentMethod;
  status?: PaymentStatus;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
};

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Payment | null>;
  getByProviderId(providerId: string): Promise<Payment | null>;
  getByUserId(opts: Filters, id: string): Promise<Page<Payment>>;
}
