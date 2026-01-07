import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { FeedbackEntity } from '../entities/feedback.entity';
import { Feedback } from 'src/feedback/domain/entities/feedback.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';

@Injectable()
export class FeedbackMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: FeedbackEntity): Feedback {
    return new Feedback({
      ...entity,
      user: undefined,
      userId: entity.user.id,
    });
  }

  toEntity(feedback: Feedback): FeedbackEntity {
    const feedbackJSON = feedback.toJSON();

    return new FeedbackEntity({
      ...feedbackJSON,
      user: this.em.getReference(UserEntity, feedbackJSON.userId),
    });
  }
}
