import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { CreateCreditTransformed } from '../dto/create-credit-history';
import { ProcessingError } from 'src/errors';
import { Credit } from 'src/credit/domain/entities/credit.entity';

@Injectable()
export class CreateCreditUseCase {
  constructor(
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async handle(payload: CreateCreditTransformed, userId: string) {
    const existingCredit = await this.creditRepository.getByUserId(userId);

    if (existingCredit) {
      throw new ProcessingError('User already has credit repository');
    }

    const credit = new Credit({
      userId,
      balance: payload.balance,
      baseBalance: payload.baseBalance,
    });

    await this.creditRepository.create(credit);

    return credit;
  }
}
