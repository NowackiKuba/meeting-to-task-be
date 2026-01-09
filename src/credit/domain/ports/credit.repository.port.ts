import { Credit } from '../entities/credit.entity';

export interface ICreditRepository {
  create(credit: Credit): Promise<Credit>;
  update(credit: Credit): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Credit | null>;
  getByUserId(userId: string): Promise<Credit | null>;
}
