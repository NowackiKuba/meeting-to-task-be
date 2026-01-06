import { Module } from '@nestjs/common';
import { PaymentsController } from './infrastructure/adapters/inbound/http/payments.controller';
import { GetPaymentByIdUseCase } from './application/use-cases';
import { PaymentMapper } from './infrastructure/mappers/payment.mapper';
import { Token } from 'src/constant';
import { PaymentRepository } from './infrastructure/adapters/outbound/persistence/payment.repository';

@Module({
  controllers: [PaymentsController],
  providers: [
    GetPaymentByIdUseCase,
    PaymentMapper,
    { provide: Token.PaymentRepository, useClass: PaymentRepository },
  ],
})
export class PaymentsModule {}
