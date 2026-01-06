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

@Module({
  imports: [
    MikroOrmModule.forFeature([MeetingEntity, UserEntity]),
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
    UserMapper,
    {
      provide: Token.MeetingRepository,
      useClass: MeetingRepository,
    },
    {
      provide: Token.UserRepository,
      useClass: UserRepository,
    },
    {
      provide: Token.TaskRepository,
      useClass: TaskRepository,
    },
  ],
  exports: [Token.MeetingRepository],
})
export class MeetingsModule {}
