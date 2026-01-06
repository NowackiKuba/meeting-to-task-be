import { Injectable } from '@nestjs/common';
import { Meeting } from '@meeting/domain/entities/meeting.entity';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Injectable()
export class MeetingMapper {
  toDomain(entity: MeetingEntity): Meeting {
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

