import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Subscription } from 'src/subscription/domain/entities/subscription.entity';
import {
  FilterOptions,
  ISubscriptionRepository,
} from 'src/subscription/domain/ports/subscription.repository.port';
import { SubscriptionEntity } from 'src/subscription/infrastructure/entities/subscription.entity';
import { SubscriptionMapper } from 'src/subscription/infrastructure/mappers/subscription.mapper';
import { Page, paginate } from 'src/utils/pagination';
import { PacketEntity } from 'src/packet/infrastructure/entities/packet.entity';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  private readonly dbSource: EntityRepository<SubscriptionEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: SubscriptionMapper,
  ) {
    this.dbSource = this.em.getRepository(SubscriptionEntity);
  }

  async create(subscription: Subscription): Promise<Subscription> {
    const res = this.dbSource.create(this.mapper.toEntity(subscription));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async getById(id: string): Promise<Subscription | null> {
    const subscription = await this.dbSource.findOne({ id });

    return subscription ? this.mapper.toDomain(subscription) : null;
  }

  async getByStripeId(id: string): Promise<Subscription | null> {
    const subscription = await this.dbSource.findOne({ stripeId: id });
    return subscription ? this.mapper.toDomain(subscription) : null;
  }

  async getByUserId(id: string): Promise<Subscription | null> {
    const subscription = await this.dbSource.findOne(
      { user: { id } },
      { populate: ['user'] },
    );
    return subscription ? this.mapper.toDomain(subscription) : null;
  }

  async update(subscription: Subscription): Promise<void> {
    const existingEntity = await this.dbSource.findOne(
      { id: subscription.id },
      { populate: ['packet'] },
    );

    if (!existingEntity) {
      throw new Error(`Subscription with id ${subscription.id} not found`);
    }

    // Update only the properties that can change, not relations
    const subscriptionJSON = subscription.toJSON();
    existingEntity.tier = subscriptionJSON.tier;
    existingEntity.amount = subscriptionJSON.amount;
    existingEntity.interval = subscriptionJSON.interval;
    existingEntity.customerId = subscriptionJSON.customerId;
    existingEntity.cancelAtPeriodEnd = subscriptionJSON.cancelAtPeriodEnd;
    existingEntity.currentPeriodStart = subscriptionJSON.currentPeriodStart;
    existingEntity.currentPeriodEnd = subscriptionJSON.currentPeriodEnd;
    existingEntity.stripeId = subscriptionJSON.stripeId;
    existingEntity.status = subscriptionJSON.status;
    existingEntity.trialStart = subscriptionJSON.trialStart;
    existingEntity.trialEnd = subscriptionJSON.trialEnd;
    existingEntity.metadata = subscriptionJSON.metadata;
    existingEntity.renewalType = subscriptionJSON.renewalType;
    existingEntity.couponId = subscriptionJSON.couponId;
    existingEntity.paymentMethodId = subscriptionJSON.paymentMethodId;
    existingEntity.supportSeats = subscriptionJSON.supportSeats;
    existingEntity.invoiceId = subscriptionJSON.invoiceId;
    existingEntity.lastPaymentDate = subscriptionJSON.lastPaymentDate;
    existingEntity.nextPaymentDate = subscriptionJSON.nextPaymentDate;
    existingEntity.canceledAt = subscriptionJSON.canceledAt;
    existingEntity.pausedAt = subscriptionJSON.pausedAt;
    existingEntity.resumedAt = subscriptionJSON.resumedAt;
    existingEntity.downgradeAt = subscriptionJSON.downgradeAt;
    existingEntity.upgradeAt = subscriptionJSON.upgradeAt;

    // Update packet relation if packetId changed
    if (
      subscriptionJSON.packetId &&
      existingEntity.packet.id !== subscriptionJSON.packetId
    ) {
      existingEntity.packet = this.em.getReference(
        PacketEntity,
        subscriptionJSON.packetId,
      );
    }

    await this.em.flush();
  }

  async getAll(opts: FilterOptions): Promise<Page<Subscription>> {
    const filters: FilterQuery<SubscriptionEntity> = {};

    const { limit, offset, status, supportSeats, tier } = opts;

    if (status) {
      filters.status = status;
    }

    if (tier) {
      filters.tier = tier;
    }

    if (typeof supportSeats !== 'boolean') {
      filters.supportSeats = supportSeats;
    }

    const orderBy = opts.orderBy ?? 'desc';
    const orderByField = opts.orderByField ?? 'createdAt';

    const [subscriptions, totalCount] = await this.dbSource.findAndCount(
      filters,
      {
        limit,
        offset,
        orderBy: {
          [orderByField]: orderBy,
        },
      },
    );

    return paginate(
      subscriptions.map((subscription) => this.mapper.toDomain(subscription)),
      { totalCount, limit, offset },
    );
  }
}
