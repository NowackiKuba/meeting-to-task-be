import { CreditHistory } from '../entities/credit-history.entity';
import { Page } from 'src/utils/pagination';

export type CreditHistoryFilters = {
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
  type?: string;
  creditId?: string;
};

export interface ICreditHistoryRepository {
  create(history: CreditHistory): Promise<CreditHistory>;
  update(history: CreditHistory): Promise<void>;
  delete(id: string): Promise<void>;
  getByCreditId(
    creditId: string,
    filters: CreditHistoryFilters,
  ): Promise<Page<CreditHistory>>;
}
