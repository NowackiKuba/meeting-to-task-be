import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FeedbackController } from './infrastructure/adapters/inbound/http/feedback.controller';
import { Token } from 'src/constant';
import {
  CreateFeedbackUseCase,
  GetFeedbackByIdUseCase,
  GetFeedbacksPaginatedUseCase,
} from './application/use-cases';
import { FeedbackMapper } from './infrastructure/mappers/feedback.mapper';
import { FeedbackRepository } from './infrastructure/adapters/outbound/persistence/feedback.repository';
import { FeedbackEntity } from './infrastructure/entities/feedback.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([FeedbackEntity, UserEntity])],
  controllers: [FeedbackController],
  providers: [
    CreateFeedbackUseCase,
    GetFeedbackByIdUseCase,
    GetFeedbacksPaginatedUseCase,
    FeedbackMapper,
    {
      provide: Token.FeedbackRepository,
      useClass: FeedbackRepository,
    },
  ],
  exports: [Token.FeedbackRepository],
})
export class FeedbackModule {}
