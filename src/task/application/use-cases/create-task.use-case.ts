import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from '@task/domain/ports/task.repository.port';
import { CreateTaskTransformed } from '../dto/create-task';
import { Task, TaskStatus } from '@task/domain/entities/task.entity';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async handle(
    payload: CreateTaskTransformed,
    meetingId: string,
    userId: string,
    order: number = 0,
  ): Promise<Task> {
    const task = new Task({
      meetingId,
      userId,
      description: payload.description,
      assignee: payload.assignee,
      dueDate: payload.dueDate,
      priority: payload.priority,
      category: payload.category,
      status: TaskStatus.TODO,
      order,
    });
    return this.taskRepository.create(task);
  }
}
