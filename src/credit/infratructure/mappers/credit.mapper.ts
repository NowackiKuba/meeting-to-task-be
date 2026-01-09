import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CreditEntity } from '../entities/credit.entity';
import { Credit } from 'src/credit/domain/entities/credit.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';

@Injectable()
export class CreditMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: CreditEntity): Credit {
    return new Credit({
      ...entity,
      user: undefined,
      userId: entity.user.id,
      history: [],
    });
  }

  toEntity(credit: Credit): CreditEntity {
    const creditJSON = credit.toJSON();

    return new CreditEntity({
      ...creditJSON,
      user: this.em.getReference(UserEntity, creditJSON.userId),
      history: null,
    });
  }
}
