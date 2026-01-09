import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ICreditHistoryRepository } from 'src/credit/domain/ports/credit-history.repository.port';
import { CreateCreditHistoryTransformed } from '../dto/create-credit';
import { orFail } from 'src/utils/or-fail';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { NotFoundError } from 'src/errors';
import { Credit } from 'src/credit/domain/entities/credit.entity';
import {
  CreditHistory,
  CreditHistoryType,
} from 'src/credit/domain/entities/credit-history.entity';

@Injectable()
export class CreateCreditHistoryUseCase {
  constructor(
    @Inject(Token.CreditHistoryRepository)
    private readonly creditHistoryRepository: ICreditHistoryRepository,
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async handle(payload: CreateCreditHistoryTransformed) {
    const credit = await orFail(
      this.creditRepository.getById(payload.creditId),
      new NotFoundError(Credit.name, payload.creditId),
    );

    const creditsSnapshot = credit;

    switch (payload.type) {
      case CreditHistoryType.ADD:
      case CreditHistoryType.REFUND:
        credit.add(payload.amount);
        break;
      case CreditHistoryType.DEDUCT:
        credit.deduct(payload.amount);
        break;
      case CreditHistoryType.RESET:
        credit.reset();
        break;
    }

    const history = new CreditHistory({
      amount: payload.amount,
      balanceAfter: credit.balance,
      balanceBefore: creditsSnapshot.balance,
      creditId: credit.id,
      type: payload.type,
      description: payload.description,
      referenceId: payload.referenceId,
      reason: payload.reason,
      metadata: payload.metadata,
    });

    await this.creditHistoryRepository.create(history);

    await this.creditRepository.update(credit);

    return history;
  }
}
