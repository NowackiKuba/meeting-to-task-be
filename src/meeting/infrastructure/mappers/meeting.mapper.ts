import { Injectable } from '@nestjs/common';
import { Meeting } from '@meeting/domain/entities/meeting.entity';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { Task } from 'src/task/domain/entities/task.entity';

@Injectable()
export class MeetingMapper {
  toDomain(entity: MeetingEntity): Meeting {
    console.log('IS INITIALIZED: ', entity?.tasks?.isInitialized());
    return new Meeting({
      id: entity.id,
      userId: entity.user.id,
      title: entity.title,
      notes: entity.notes,
      status: entity.status,
      errorMessage: entity.errorMessage,
      processedAt: entity.processedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      tasks: entity?.tasks?.isInitialized()
        ? entity?.tasks?.getItems().map(
            (task) =>
              new Task({
                ...task,
                meetingId: task.meeting.id,
                userId: task.user.id,
              }),
          )
        : [],
    });
  }

  toEntity(meeting: Meeting, user: UserEntity): MeetingEntity {
    return new MeetingEntity({
      id: meeting.id,
      user,
      title: meeting.title,
      notes: meeting.notes,
      status: meeting.status,
      errorMessage: meeting.errorMessage,
      processedAt: meeting.processedAt,
    });
  }
}
