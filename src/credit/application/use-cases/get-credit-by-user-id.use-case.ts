import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { Credit } from 'src/credit/domain/entities/credit.entity';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { NotFoundError } from 'src/errors';
import { orFail } from 'src/utils/or-fail';

@Injectable()
export class GetCreditByUserIdUseCase {
  constructor(
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async handle(id: string) {
    const credit = await orFail(
      this.creditRepository.getByUserId(id),
      new NotFoundError(Credit.name, id),
    );

    return credit;
  }
}
