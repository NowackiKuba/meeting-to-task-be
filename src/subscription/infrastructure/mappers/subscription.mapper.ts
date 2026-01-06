import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from 'src/subscription/domain/entities/subscription.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';
import { PacketEntity } from 'src/packet/infrastructure/entities/packet.entity';

@Injectable()
export class SubscriptionMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: SubscriptionEntity): Subscription {
    return new Subscription({
      ...entity,
      user: undefined,
      packet: undefined,
      packetId: entity.packet.id,
      userId: entity.user.id,
      seats: undefined,
    });
  }

  toEntity(subscription: Subscription): SubscriptionEntity {
    const subscriptionJSON = subscription.toJSON();
    return new SubscriptionEntity({
      ...subscriptionJSON,
      user: this.em.getReference(UserEntity, subscriptionJSON.userId),
      packet: this.em.getReference(PacketEntity, subscriptionJSON.packetId),
      seats: null,
    });
  }
}
