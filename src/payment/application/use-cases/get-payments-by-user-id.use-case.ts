import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import { GetPaymentsPaginatedTransformed } from '../dto';

@Injectable()
export class GetPaymentsByUserIdUseCase {
  constructor(
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async handle(id: string, opts: GetPaymentsPaginatedTransformed) {
    const payments = await this.paymentRepository.getByUserId(opts, id);

    return payments;
  }
}
