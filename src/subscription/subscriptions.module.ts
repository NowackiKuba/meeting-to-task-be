import { Module } from '@nestjs/common';
import { SubscriptionController } from './infrastructure/adapters/inbound/http/subscription.controller';
import { SubscriptionService } from './subscription.service';
import {
  GetUsageUseCase,
  GetUserPaymentsUseCase,
  GetSubscriptionUseCase,
} from './application/use-cases';
import { Token } from 'src/constant';
import { PaymentRepository } from 'src/payment/infrastructure/adapters/outbound/persistence/payment.repository';
import { UserRepository } from 'src/user/infrastructure/adapters/outbound/persistence/user.repository';
import { SubscriptionRepository } from './infrastructure/adapters/outbound/persistence/subscription.repository';
import { PaymentMapper } from 'src/payment/infrastructure/mappers/payment.mapper';
import { UserMapper } from 'src/user/infrastructure/mappers/user.mapper';
import { SubscriptionMapper } from './infrastructure/mappers/subscription.mapper';

@Module({
  imports: [],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    GetUserPaymentsUseCase,
    GetUsageUseCase,
    GetSubscriptionUseCase,
    PaymentMapper,
    UserMapper,
    SubscriptionMapper,
    { provide: Token.PaymentRepository, useClass: PaymentRepository },
    { provide: Token.UserRepository, useClass: UserRepository },
    { provide: Token.SubscriptionRepository, useClass: SubscriptionRepository },
  ],
  exports: [
    SubscriptionService,
    GetUserPaymentsUseCase,
    GetUsageUseCase,
    GetSubscriptionUseCase,
  ],
})
export class SubscriptionsModule {}
