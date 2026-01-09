import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './infra/adapters/stripe.service';
import { ConfigService } from 'src/config/config.service';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { Token } from 'src/constant';
import { StripeWebhookService } from './infra/adapters/stripe.webhook';
import { UserRepository } from '@user/infrastructure/adapters/outbound/persistence/user.repository';
import { SubscriptionsModule } from '@subscription/subscriptions.module';
import { UsersModule } from '@user/users.module';
import { PaymentsModule } from '@payment/payments.module';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { CreateUserUseCase } from '@user/application/use-cases';
import { PacketMapper } from 'src/packet/infrastructure/mappers/packet.mapper';
import { SubscriptionMapper } from 'src/subscription/infrastructure/mappers/subscription.mapper';
import { SubscriptionRepository } from 'src/subscription/infrastructure/adapters/outbound/persistence/subscription.repository';
import { PacketRepository } from 'src/packet/infrastructure/adapters/outbound/persistence/packet.repository';
import { mailerProvider } from 'src/shared/mailer/infra/adapters/mailer.provider';
import { EmailService } from 'src/shared/mailer/infra/adapters/email.service';
import { PaymentRepository } from 'src/payment/infrastructure/adapters/outbound/persistence/payment.repository';
import { PaymentMapper } from 'src/payment/infrastructure/mappers/payment.mapper';
import { CreditRepository } from 'src/credit/infratructure/adapters/outbound/persistence/credit.repository';
import { CreditMapper } from 'src/credit/infratructure/mappers/credit.mapper';
import { CreditHistoryRepository } from 'src/credit/infratructure/adapters/outbound/persistence/credit-history.repository';
import { CreditHistoryMapper } from 'src/credit/infratructure/mappers/credit-history.mapper';
import { UpdateCreditUseCase } from 'src/credit/application/use-cases/update-credit.use-case';
import { CreateCreditHistoryUseCase } from 'src/credit/application/use-cases/create-credit-history.use-case';

@Module({
  imports: [SubscriptionsModule, UsersModule, PaymentsModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    ConfigService,
    CreateCheckoutSessionUseCase,
    StripeWebhookService,
    SubscriptionMapper,
    UserMapper,
    PacketMapper,
    CreditMapper,
    CreditHistoryMapper,
    mailerProvider,
    CreateUserUseCase,
    UpdateCreditUseCase,
    CreateCreditHistoryUseCase,
    PaymentMapper,
    { provide: Token.StripeService, useClass: StripeService },
    { provide: Token.SubscriptionRepository, useClass: SubscriptionRepository },
    { provide: Token.UserRepository, useClass: UserRepository },
    { provide: Token.PacketRepository, useClass: PacketRepository },
    { provide: Token.PaymentRepository, useClass: PaymentRepository },
    { provide: Token.CreditRepository, useClass: CreditRepository },
    {
      provide: Token.CreditHistoryRepository,
      useClass: CreditHistoryRepository,
    },
    { provide: Token.EmailService, useClass: EmailService },
    //
  ],
})
export class StripeModule {}
