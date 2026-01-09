import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CreditsController } from './infratructure/adapters/inbound/http/credits.controller';
import {
  GetCreditByUserIdUseCase,
  GetCreditHistoryPaginatedUseCase,
} from './application/use-cases';
import { Token } from 'src/constant';
import { CreditRepository } from './infratructure/adapters/outbound/persistence/credit.repository';
import { CreditHistoryRepository } from './infratructure/adapters/outbound/persistence/credit-history.repository';
import { CreditMapper } from './infratructure/mappers/credit.mapper';
import { CreditHistoryMapper } from './infratructure/mappers/credit-history.mapper';
import { CreditEntity } from './infratructure/entities/credit.entity';
import { CreditHistoryEntity } from './infratructure/entities/credit-history.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([CreditEntity, CreditHistoryEntity, UserEntity]),
  ],
  controllers: [CreditsController],
  providers: [
    GetCreditByUserIdUseCase,
    GetCreditHistoryPaginatedUseCase,
    CreditMapper,
    CreditHistoryMapper,
    {
      provide: Token.CreditRepository,
      useClass: CreditRepository,
    },
    {
      provide: Token.CreditHistoryRepository,
      useClass: CreditHistoryRepository,
    },
  ],
  exports: [Token.CreditRepository, Token.CreditHistoryRepository],
})
export class CreditsModule {}
