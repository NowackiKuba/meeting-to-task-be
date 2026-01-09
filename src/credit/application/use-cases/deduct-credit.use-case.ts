import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { CreateCreditHistoryUseCase } from './create-credit-history.use-case';
import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';
import { NotFoundError, ProcessingError } from 'src/errors';
import { Credit } from 'src/credit/domain/entities/credit.entity';

@Injectable()
export class DeductCreditUseCase {
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

    if (credit.balance < amount) {
      throw new ProcessingError(
        `Insufficient credits. Required: ${amount}, Available: ${credit.balance}`,
      );
    }

    const balanceBefore = credit.balance;

    await this.createCreditHistoryUseCase.handle({
      creditId: credit.id,
      amount,
      type: CreditHistoryType.DEDUCT,
      balanceBefore,
      balanceAfter: balanceBefore - amount,
      reason: reason ?? 'meeting_processing',
      description:
        description ?? `Credit deducted for meeting processing (${amount} credit${amount > 1 ? 's' : ''})`,
      referenceId,
      metadata: {
        userId,
        deductedAt: new Date().toISOString(),
      },
    });

    // Reload credit to get updated balance
    const updatedCredit = await this.creditRepository.getByUserId(userId);
    if (!updatedCredit) {
      throw new ProcessingError('Failed to reload credit after deduction');
    }

    return updatedCredit;
  }
}