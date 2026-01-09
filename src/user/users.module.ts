import { Module } from '@nestjs/common';
import { UsersController } from './infrastructure/adapters/inbound/http/users.controller';
import { Token } from 'src/constant';
import { UserRepository } from './infrastructure/adapters/outbound/persistence/user.repository';
import {
  CreateUserUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
} from './application/use-cases';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from './infrastructure/entities/user.entity';
import { ResetLimitsSchedule } from './infrastructure/adapters/outbound/schedules/reset-limits.schedule';
import { SubscriptionRepository } from 'src/subscription/infrastructure/adapters/outbound/persistence/subscription.repository';
import { SubscriptionMapper } from 'src/subscription/infrastructure/mappers/subscription.mapper';
import { CreditMapper } from 'src/credit/infratructure/mappers/credit.mapper';
import { CreditRepository } from 'src/credit/infratructure/adapters/outbound/persistence/credit.repository';
import { CreateCreditUseCase } from 'src/credit/application/use-cases';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserByEmailUseCase,
    GetUserByIdUseCase,
    UserMapper,
    SubscriptionMapper,
    ResetLimitsSchedule,
    CreditMapper,
    CreateCreditUseCase,
    {
      provide: Token.UserRepository,
      useClass: UserRepository,
    },
    {
      provide: Token.CreditRepository,
      useClass: CreditRepository,
    },
    {
      provide: Token.SubscriptionRepository,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [
    Token.UserRepository,
    CreateUserUseCase,
    GetUserByEmailUseCase,
    CreateCreditUseCase,
  ],
})
export class UsersModule {}
//
