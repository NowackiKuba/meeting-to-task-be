import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import { UpdatePaymentTransformed } from '../dto';
import { orFail } from 'src/utils/or-fail';
import { NotFoundError } from 'src/errors';
import { Payment } from 'src/payment/domain/entities/payment.entity';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async handle(id: string, payload: UpdatePaymentTransformed) {
    const payment = await orFail(
      this.paymentRepository.getById(id),
      new NotFoundError(Payment.name, id),
    );

    const updatedPayment = new Payment({
      id,
      gross: payload.gross ?? payment.gross,
      net: payload.net ?? payment.net,
      currency: payload.currency ?? payment.currency,
      taxRate: payload.taxRate ?? payment.taxRate,
      taxAmount: payload.taxAmount ?? payment.taxAmount,
      subscriptionId: payload.subscriptionId ?? payment.subscriptionId,
      status: payload.status ?? payment.status,
      notes: payload.notes ?? payment.notes,
      providerId: payload.providerId ?? payment.providerId,
      method: payload.method ?? payment.method,
      receiptUrl: payload.receiptUrl ?? payment.receiptUrl,
      paidAt: payload.paidAt ?? payment.paidAt,
      invoiceId: payload.invoiceId ?? payment.invoiceId,
      refundedAmount: payload.refundedAmount ?? payment.refundedAmount,
      refundReason: payload.refundReason ?? payment.refundReason,
      attemptedAt: payload.attemptedAt ?? payment.attemptedAt,
      failureCode: payload.failureCode ?? payment.failureCode,
      failureMessage: payload.failureMessage ?? payment.failureMessage,
      metadata: payload.metadata ?? payment.metadata,
    });

    await this.paymentRepository.update(updatedPayment);

    return updatedPayment;
  }
}
