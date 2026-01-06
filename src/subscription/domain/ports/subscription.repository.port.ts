import { Page } from 'src/utils/pagination';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionTier,
} from '../entities/subscription.entity';

export type FilterOptions = {
  limit?: number;
  offset?: number;
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
  supportSeats?: boolean;
};

export interface ISubscriptionRepository {
  create(subscription: Subscription): Promise<Subscription>;
  update(subscription: Subscription): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Subscription | null>;
  getByStripeId(id: string): Promise<Subscription | null>;
  getAll(filters: FilterOptions): Promise<Page<Subscription>>;
  getByUserId(id: string): Promise<Subscription | null>;
}
