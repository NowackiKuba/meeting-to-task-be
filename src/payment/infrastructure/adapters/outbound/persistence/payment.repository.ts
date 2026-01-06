import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import {
  Filters,
  IPaymentRepository,
} from 'src/payment/domain/ports/payment.repository.port';
import { PaymentEntity } from 'src/payment/infrastructure/entities/payment.entity';
import { PaymentMapper } from 'src/payment/infrastructure/mappers/payment.mapper';
import { Payment } from 'src/payment/domain/entities/payment.entity';
import { Page, paginate } from 'src/utils/pagination';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  private readonly dbSource: EntityRepository<PaymentEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: PaymentMapper,
  ) {
    this.dbSource = this.em.getRepository(PaymentEntity);
  }

  async create(payment: Payment): Promise<Payment> {
    const entity = this.mapper.toEntity(payment);
    this.em.persist(entity);
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }

  async update(payment: Payment): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: payment.id },
      this.mapper.toEntity(payment),
    );
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async getById(id: string): Promise<Payment | null> {
    const entity = await this.dbSource.findOne(
      { id },
      { populate: ['subscription'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getByProviderId(providerId: string): Promise<Payment | null> {
    const entity = await this.dbSource.findOne(
      { providerId },
      { populate: ['subscription'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getByUserId(opts: Filters, userId: string): Promise<Page<Payment>> {
    const filters: FilterQuery<PaymentEntity> = {
      subscription: { user: userId },
    };

    const { currency, limit, method, offset, search, status } = opts;

    if (currency) {
      filters.currency = currency;
    }

    if (method) {
      filters.method = method;
    }

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [
        { providerId: { $like: `%${search}%` } },
        { id: { $like: `%${search}%` } },
      ];
    }

    const orderBy = opts.orderBy ?? 'desc';
    const orderByField = opts.orderByField ?? 'createdAt';

    const [entities, totalCount] = await this.dbSource.findAndCount(filters, {
      populate: ['subscription'],
      limit,
      offset,
      orderBy: {
        [orderByField]: orderBy,
      },
    });

    return paginate(
      entities.map((e) => this.mapper.toDomain(e)),
      { totalCount, limit, offset },
    );
  }
}
