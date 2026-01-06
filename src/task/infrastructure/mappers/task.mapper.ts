import { Injectable } from '@nestjs/common';
import { Task } from '@task/domain/entities/task.entity';
import { TaskEntity } from '@task/infrastructure/entities/task.entity';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Injectable()
export class TaskMapper {
  toDomain(entity: TaskEntity): Task {
    return new Task({
      id: entity.id,
      meetingId: entity.meeting.id,
      userId: entity.user.id,
      description: entity.description,
      assignee: entity.assignee,
      dueDate: entity.dueDate,
      priority: entity.priority,
      category: entity.category,
      status: entity.status,
      order: entity.order,
      isAiGenerated: entity.isAiGenerated,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(task: Task, meeting: MeetingEntity, user: UserEntity): TaskEntity {
    return new TaskEntity({
      id: task.id,
      meeting,
      user,
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      status: task.status,
      order: task.order,
      isAiGenerated: task.isAiGenerated,
    });
  }
}
