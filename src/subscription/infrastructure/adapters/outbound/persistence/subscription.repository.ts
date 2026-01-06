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
    await this.dbSource.nativeUpdate(
      { id: subscription.id },
      this.mapper.toEntity(subscription),
    );
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
