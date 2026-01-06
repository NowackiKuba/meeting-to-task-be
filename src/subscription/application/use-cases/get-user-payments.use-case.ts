import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import { Payment } from 'src/payment/domain/entities/payment.entity';

@Injectable()
export class GetUserPaymentsUseCase {
  constructor(
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async handle(userId: string): Promise<Payment[]> {
    const page = await this.paymentRepository.getByUserId(
      { orderBy: 'desc', orderByField: 'createdAt', limit: 100 },
      userId,
    );
    return page.data;
  }
}

