import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreditHistoryEntity } from '../entities/credit-history.entity';
import { CreditHistory } from 'src/credit/domain/entities/credit-history.entity';
import { CreditEntity } from '../entities/credit.entity';

@Injectable()
export class CreditHistoryMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: CreditHistoryEntity): CreditHistory {
    return new CreditHistory({
      ...entity,
      creditId: entity.credit.id,
      credit: undefined,
    });
  }

  toEntity(credit: CreditHistory): CreditHistoryEntity {
    const creditJSON = credit.toJSON();

    return new CreditHistoryEntity({
      ...creditJSON,
      credit: this.em.getReference(CreditEntity, creditJSON.creditId),
    });
  }
}
