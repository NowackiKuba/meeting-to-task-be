import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { Page } from 'src/utils/pagination';
import { CreditHistory } from 'src/credit/domain/entities/credit-history.entity';
import { ICreditHistoryRepository } from 'src/credit/domain/ports/credit-history.repository.port';
import { GetCreditHistoryPaginatedTransformed } from '../dto/get-credit-history-paginated';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { NotFoundError } from 'src/errors';
import { Credit } from 'src/credit/domain/entities/credit.entity';

@Injectable()
export class GetCreditHistoryPaginatedUseCase {
  constructor(
    @Inject(Token.CreditHistoryRepository)
    private readonly creditHistoryRepository: ICreditHistoryRepository,
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async handle(
    userId: string,
    filters: GetCreditHistoryPaginatedTransformed,
  ): Promise<Page<CreditHistory>> {
    // Get user's credit account
    const credit = await this.creditRepository.getByUserId(userId);

    if (!credit) {
      throw new NotFoundError(Credit.name, userId);
    }

    return this.creditHistoryRepository.getByCreditId(credit.id, {
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      orderBy: filters.orderBy ?? 'desc',
      orderByField: filters.orderByField ?? 'createdAt',
      type: filters.type,
    });
  }
}
