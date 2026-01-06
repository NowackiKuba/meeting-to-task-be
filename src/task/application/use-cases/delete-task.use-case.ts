import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from '@task/domain/ports/task.repository.port';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async handle(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }
}

