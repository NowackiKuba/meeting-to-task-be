import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TasksController } from './infrastructure/adapters/inbound/http/tasks.controller';
import { Token } from 'src/constant';
import {
  BulkUpdateTasksUseCase,
  CreateTaskUseCase,
  DeleteTaskUseCase,
  GetMeetingTasksUseCase,
  UpdateTaskUseCase,
} from './application/use-cases';
import { TaskMapper } from './infrastructure/mappers/task.mapper';
import { TaskRepository } from './infrastructure/adapters/outbound/persistence/task.repository';
import { TaskEntity } from './infrastructure/entities/task.entity';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TaskEntity, MeetingEntity, UserEntity])],
  controllers: [TasksController],
  providers: [
    BulkUpdateTasksUseCase,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    GetMeetingTasksUseCase,
    UpdateTaskUseCase,
    TaskMapper,
    {
      provide: Token.TaskRepository,
      useClass: TaskRepository,
    },
  ],
  exports: [Token.TaskRepository],
})
export class TasksModule {}

