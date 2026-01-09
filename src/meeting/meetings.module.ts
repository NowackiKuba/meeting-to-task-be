import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MeetingsController } from './infrastructure/adapters/inbound/http/meetings.controller';
import { Token } from 'src/constant';
import {
  CreateMeetingUseCase,
  DeleteMeetingUseCase,
  GetMeetingByIdUseCase,
  GetMeetingsPaginatedUseCase,
  UpdateMeetingUseCase,
} from './application/use-cases';
import { MeetingMapper } from './infrastructure/mappers/meeting.mapper';
import { MeetingRepository } from './infrastructure/adapters/outbound/persistence/meeting.repository';
import { MeetingEntity } from './infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { TasksModule } from '@task/tasks.module';
import { MeetingQueueConsumer } from './infrastructure/queues/processors/meeting-queue.processor';
import { AIProviderFactory } from 'src/shared/ai/infrastructure/adapters/outbound/factory/ai-provider.factory';
import { OpenAIService } from 'src/shared/ai/infrastructure/adapters/outbound/persistence/openai.service';
import { AnthropicService } from 'src/shared/ai/infrastructure/adapters/outbound/persistence/anthropic.service';
import { ConfigService } from 'src/config/config.service';
import { GetMeetingTasksUseCase } from 'src/task/application/use-cases';
import { TaskRepository } from 'src/task/infrastructure/adapters/outbound/persistence/task.repository';
import { TaskMapper } from 'src/task/infrastructure/mappers/task.mapper';
import { UserMapper } from 'src/user/infrastructure/mappers/user.mapper';
import { UserRepository } from 'src/user/infrastructure/adapters/outbound/persistence/user.repository';
import { ExportTasksUseCase } from 'src/task/application/use-cases/export-tasks.use-case';
import { SubscriptionRepository } from 'src/subscription/infrastructure/adapters/outbound/persistence/subscription.repository';
import { SubscriptionMapper } from 'src/subscription/infrastructure/mappers/subscription.mapper';
import {
  DeductCreditUseCase,
  RefundCreditUseCase,
  CreateCreditHistoryUseCase,
} from 'src/credit/application/use-cases';
import { CreditRepository } from 'src/credit/infratructure/adapters/outbound/persistence/credit.repository';
import { CreditMapper } from 'src/credit/infratructure/mappers/credit.mapper';
import { CreditHistoryRepository } from 'src/credit/infratructure/adapters/outbound/persistence/credit-history.repository';
import { CreditHistoryMapper } from 'src/credit/infratructure/mappers/credit-history.mapper';
import { CreditEntity } from 'src/credit/infratructure/entities/credit.entity';
import { CreditHistoryEntity } from 'src/credit/infratructure/entities/credit-history.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      MeetingEntity,
      UserEntity,
      CreditEntity,
      CreditHistoryEntity,
    ]),
    BullModule.registerQueue({
      name: 'meeting-queue',
    }),
    TasksModule,
  ],
  controllers: [MeetingsController],
  providers: [
    CreateMeetingUseCase,
    DeleteMeetingUseCase,
    GetMeetingTasksUseCase,
    ConfigService,
    GetMeetingByIdUseCase,
    GetMeetingsPaginatedUseCase,
    UpdateMeetingUseCase,
    MeetingMapper,
    MeetingQueueConsumer,
    AIProviderFactory,
    OpenAIService,
    AnthropicService,
    ExportTasksUseCase,
    TaskMapper,
    SubscriptionMapper,
    UserMapper,
    CreditMapper,
    CreditHistoryMapper,
    DeductCreditUseCase,
    RefundCreditUseCase,
    CreateCreditHistoryUseCase,
    {
      provide: Token.MeetingRepository,
      useClass: MeetingRepository,
    },
    {
      provide: Token.UserRepository,
      useClass: UserRepository,
    },
    {
      provide: Token.SubscriptionRepository,
      useClass: SubscriptionRepository,
    },
    {
      provide: Token.TaskRepository,
      useClass: TaskRepository,
    },
    {
      provide: Token.CreditRepository,
      useClass: CreditRepository,
    },
    {
      provide: Token.CreditHistoryRepository,
      useClass: CreditHistoryRepository,
    },
  ],
  exports: [Token.MeetingRepository],
})
export class MeetingsModule {}
