import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { Payment } from 'src/payment/domain/entities/payment.entity';
import { SubscriptionEntity } from 'src/subscription/infrastructure/entities/subscription.entity';

@Injectable()
export class PaymentMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: PaymentEntity): Payment {
    return new Payment({
      ...entity,
      subscriptionId: entity?.subscription?.id,
      subscription: undefined,
    });
  }

  toEntity(payment: Payment): PaymentEntity {
    const paymentJSON = payment.toJSON();
    return new PaymentEntity({
      ...paymentJSON,
      subscription: paymentJSON?.subscriptionId
        ? this.em.getReference(SubscriptionEntity, paymentJSON?.subscriptionId)
        : null,
    });
  }
}
