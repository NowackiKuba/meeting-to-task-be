import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { NotFoundError } from 'src/errors';
import { Payment } from 'src/payment/domain/entities/payment.entity';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import { orFail } from 'src/utils/or-fail';

@Injectable()
export class GetPaymentByIdUseCase {
  constructor(
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async handle(id: string) {
    const payment = await orFail(
      this.paymentRepository.getById(id),
      new NotFoundError(Payment.name, id),
    );

    return payment;
  }
}
