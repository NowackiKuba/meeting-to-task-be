import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { UpdateCreditTransformed } from '../dto/update-credit';
import { orFail } from 'src/utils/or-fail';
import { NotFoundError } from 'src/errors';
import { Credit } from 'src/credit/domain/entities/credit.entity';
import { CreateCreditHistoryUseCase } from './create-credit-history.use-case';
import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';

@Injectable()
export class UpdateCreditUseCase {
  constructor(
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
    private readonly createCreditHistoryUseCase: CreateCreditHistoryUseCase,
  ) {}

  async handle(payload: UpdateCreditTransformed, id: string) {
    const credit = await orFail(
      this.creditRepository.getById(id),
      new NotFoundError(Credit.name, id),
    );

    const updated = new Credit({
      balance: payload.balance ?? credit.balance,
      baseBalance: payload.baseBalance ?? credit.baseBalance,
      metadata: payload.metadata ?? credit.metadata,
      totalUsed: payload.totalUsed ?? credit.totalUsed,
      lastUsedAt: payload.lastUsedAt ?? credit.lastUsedAt,
      lastResetAt: payload.lastResetAt ?? credit.lastResetAt,
      resetReason: payload.resetReason ?? credit.resetReason,
      id,
      userId: credit.userId,
    });

    await this.creditRepository.update(updated);

    await this.createCreditHistoryUseCase.handle({
      amount: payload.balance ?? 0,
      balanceAfter: updated.balance,
      balanceBefore: credit.balance,
      creditId: id,
      referenceId: credit.id,
      type:
        credit.balance > updated.balance
          ? CreditHistoryType.DEDUCT
          : CreditHistoryType.ADD,
    });

    return updated;
  }
}
