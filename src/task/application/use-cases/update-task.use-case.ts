import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from '@task/domain/ports/task.repository.port';
import { UpdateTaskTransformed } from '../dto/update-task';
import { NotFoundError } from 'src/errors';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async handle(id: string, payload: UpdateTaskTransformed) {
    const task = await this.taskRepository.getById(id);
    if (!task) throw new NotFoundError('Task', 'id');
    if (payload.description !== undefined)
      task.setDescription(payload.description);
    if (payload.status !== undefined) task.setStatus(payload.status);
    if (payload.order !== undefined) task.setOrder(payload.order);
    if (payload.priority !== undefined) task.setPriority(payload.priority);
    if (payload.assignee !== undefined) task.setAssignee(payload.assignee);
    if (payload.dueDate !== undefined) task.setDueDate(payload.dueDate);
    if (payload.category !== undefined) task.setCategory(payload.category);
    await this.taskRepository.update(task);
    return task;
  }
}
