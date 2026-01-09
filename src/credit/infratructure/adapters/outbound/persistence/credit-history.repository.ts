import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreditHistory } from 'src/credit/domain/entities/credit-history.entity';
import {
  ICreditHistoryRepository,
  CreditHistoryFilters,
} from 'src/credit/domain/ports/credit-history.repository.port';
import { CreditHistoryEntity } from 'src/credit/infratructure/entities/credit-history.entity';
import { CreditHistoryMapper } from 'src/credit/infratructure/mappers/credit-history.mapper';
import { Page, paginate } from 'src/utils/pagination';

@Injectable()
export class CreditHistoryRepository implements ICreditHistoryRepository {
  private readonly dbSource: EntityRepository<CreditHistoryEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: CreditHistoryMapper,
  ) {
    this.dbSource = this.em.getRepository(CreditHistoryEntity);
  }

  async create(history: CreditHistory): Promise<CreditHistory> {
    const res = this.dbSource.create(this.mapper.toEntity(history));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async update(history: CreditHistory): Promise<void> {
    const existingEntity = await this.dbSource.findOne({ id: history.id });

    if (!existingEntity) {
      throw new Error(`CreditHistory with id ${history.id} not found`);
    }

    // Update only the properties that can change, not relations
    const historyJSON = history.toJSON();
    existingEntity.amount = historyJSON.amount;
    existingEntity.type = historyJSON.type;
    existingEntity.balanceBefore = historyJSON.balanceBefore;
    existingEntity.balanceAfter = historyJSON.balanceAfter;
    existingEntity.reason = historyJSON.reason;
    existingEntity.description = historyJSON.description;
    existingEntity.referenceId = historyJSON.referenceId;
    existingEntity.metadata = historyJSON.metadata;

    await this.em.flush();
  }

  async getByCreditId(
    creditId: string,
    filters: CreditHistoryFilters,
  ): Promise<Page<CreditHistory>> {
    const orderBy = filters.orderBy ?? 'desc';
    const orderByField = filters.orderByField ?? 'createdAt';

    const query: FilterQuery<CreditHistoryEntity> = {
      credit: creditId,
    };

    if (filters.type) {
      query.type = filters.type as any;
    }

    const [histories, totalCount] = await this.dbSource.findAndCount(query, {
      orderBy: {
        [orderByField]: orderBy,
      },
      limit: filters.limit,
      offset: filters.offset,
    });

    return paginate(
      histories.map((h) => this.mapper.toDomain(h)),
      {
        totalCount,
        limit: filters.limit,
        offset: filters.offset,
      },
    );
  }
}
