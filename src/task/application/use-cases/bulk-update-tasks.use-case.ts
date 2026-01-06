import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from '@task/domain/ports/task.repository.port';
import { TaskPriority, TaskStatus } from 'src/task/domain/entities/task.entity';

@Injectable()
export class BulkUpdateTasksUseCase {
  constructor(
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async handle(
    ids: string[],
    updates: { status?: TaskStatus; priority?: TaskPriority },
  ) {
    await this.taskRepository.bulkUpdate(ids, updates);
    return { updated: ids.length };
  }
}
