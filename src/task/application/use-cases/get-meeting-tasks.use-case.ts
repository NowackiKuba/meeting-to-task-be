import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from '@task/domain/ports/task.repository.port';
import { Page } from 'src/utils/pagination';
import { Task } from '@task/domain/entities/task.entity';

@Injectable()
export class GetMeetingTasksUseCase {
  constructor(
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async handle(
    meetingId: string,
    opts: { limit?: number; offset?: number },
  ): Promise<Page<Task>> {
    return this.taskRepository.getByMeeting(meetingId, {
      limit: opts.limit ?? 50,
      offset: opts.offset ?? 0,
    });
  }
}

