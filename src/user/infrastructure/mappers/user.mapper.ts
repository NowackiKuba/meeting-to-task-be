import { Injectable } from '@nestjs/common';
import { User } from '@user/domain/entities/user.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Injectable()
export class UserMapper {
  toDomain(entity: UserEntity): User {
    return new User({
      id: entity.id,
      email: entity.email,
      password: entity.password,
      name: entity.name,
      currentTier: entity.currentTier,
      stripeCustomerId: entity.stripeCustomerId,
      meetingsProcessedThisMonth: entity.meetingsProcessedThisMonth,
      meetingsLimit: entity.meetingsLimit,
      billingCycleStart: entity.billingCycleStart,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(user: User): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      currentTier: user.currentTier,
      stripeCustomerId: user.stripeCustomerId,
      meetingsProcessedThisMonth: user.meetingsProcessedThisMonth,
      meetingsLimit: user.meetingsLimit,
      billingCycleStart: user.billingCycleStart,
    });
  }
}

