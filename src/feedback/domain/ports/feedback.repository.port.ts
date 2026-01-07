import { Page } from 'src/utils/pagination';
import { Feedback } from '../entities/feedback.entity';

export type FeedbackFilters = {
  offset?: number;
  limit?: number;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
  area?: string;
  rate?: number;
  search?: string;
};

export interface IFeedbackRepository {
  create(feedback: Feedback): Promise<Feedback>;
  getById(id: string): Promise<Feedback | null>;
  getAll(opts: FeedbackFilters): Promise<Page<Feedback>>;
}
