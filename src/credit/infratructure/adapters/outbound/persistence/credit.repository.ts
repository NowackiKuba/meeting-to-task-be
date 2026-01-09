import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Credit } from 'src/credit/domain/entities/credit.entity';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { CreditEntity } from 'src/credit/infratructure/entities/credit.entity';
import { CreditMapper } from 'src/credit/infratructure/mappers/credit.mapper';

@Injectable()
export class CreditRepository implements ICreditRepository {
  private readonly dbSource: EntityRepository<CreditEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: CreditMapper,
  ) {
    this.dbSource = this.em.getRepository(CreditEntity);
  }

  async create(credit: Credit): Promise<Credit> {
    const res = this.dbSource.create(this.mapper.toEntity(credit));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async getById(id: string): Promise<Credit | null> {
    const credit = await this.dbSource.findOne({ id });

    return credit ? this.mapper.toDomain(credit) : null;
  }

  async getByUserId(userId: string): Promise<Credit | null> {
    const credit = await this.dbSource.findOne({ user: { id: userId } });

    return credit ? this.mapper.toDomain(credit) : null;
  }

  async update(credit: Credit): Promise<void> {
    const existingEntity = await this.dbSource.findOne({ id: credit.id });

    if (!existingEntity) {
      throw new Error(`Credit with id ${credit.id} not found`);
    }

    // Update only the properties that can change, not relations
    const creditJSON = credit.toJSON();
    existingEntity.balance = creditJSON.balance;
    existingEntity.baseBalance = creditJSON.baseBalance;
    existingEntity.totalUsed = creditJSON.totalUsed;
    existingEntity.lastUsedAt = creditJSON.lastUsedAt;
    existingEntity.lastResetAt = creditJSON.lastResetAt;
    existingEntity.resetReason = creditJSON.resetReason;
    existingEntity.metadata = creditJSON.metadata;

    await this.em.flush();
  }
}
