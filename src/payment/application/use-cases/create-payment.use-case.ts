import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import { CreatePaymentTransformed } from '../dto';
import { Payment } from 'src/payment/domain/entities/payment.entity';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async handle(payload: CreatePaymentTransformed) {
    const payment = new Payment({
      currency: payload.currency,
      gross: payload.gross,
      net: payload.net,
      providerId: payload.providerId,
      status: payload.status,
      taxAmount: payload.taxAmount,
      taxRate: payload.taxRate,
      attemptedAt: payload.attemptedAt,
      failureCode: payload.failureCode,
      failureMessage: payload.failureMessage,
      invoiceId: payload.invoiceId,
      metadata: payload.metadata,
      method: payload.method,
      notes: payload.notes,
      paidAt: payload.paidAt,
      receiptUrl: payload.receiptUrl,
    });

    const newPayment = await this.paymentRepository.create(payment);

    return newPayment;
  }
}
