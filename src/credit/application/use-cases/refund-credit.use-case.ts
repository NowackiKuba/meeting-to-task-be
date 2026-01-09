import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { CreateCreditHistoryUseCase } from './create-credit-history.use-case';
import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';
import { NotFoundError } from 'src/errors';
import { Credit } from 'src/credit/domain/entities/credit.entity';

@Injectable()
export class RefundCreditUseCase {
  constructor(
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
    private readonly createCreditHistoryUseCase: CreateCreditHistoryUseCase,
  ) {}

  async handle(
    userId: string,
    amount: number = 1,
    reason?: string,
    referenceId?: string,
    description?: string,
  ): Promise<Credit> {
    const credit = await this.creditRepository.getByUserId(userId);

    if (!credit) {
      throw new NotFoundError(Credit.name, userId);
    }

    const balanceBefore = credit.balance;

    await this.createCreditHistoryUseCase.handle({
      creditId: credit.id,
      amount,
      type: CreditHistoryType.REFUND,
      balanceBefore,
      balanceAfter: balanceBefore + amount,
      reason: reason ?? 'meeting_processing_failed',
      description:
        description ??
        `Credit refunded due to meeting processing failure (${amount} credit${amount > 1 ? 's' : ''})`,
      referenceId,
      metadata: {
        userId,
        refundedAt: new Date().toISOString(),
      },
    });

    // Reload credit to get updated balance
    const updatedCredit = await this.creditRepository.getByUserId(userId);
    if (!updatedCredit) {
      throw new NotFoundError(Credit.name, userId);
    }

    return updatedCredit;
  }
}