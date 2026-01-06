import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from '@user/domain/entities/user.entity';
import { IUserRepository } from '@user/domain/ports/user.repository.port';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly dbSource: EntityRepository<UserEntity>;

  constructor(
    private readonly mapper: UserMapper,
    private readonly em: EntityManager,
  ) {
    this.dbSource = this.em.getRepository(UserEntity);
  }

  async create(user: User): Promise<User> {
    const entity = this.mapper.toEntity(user);
    this.em.persist(entity);
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }

  async update(user: User): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: user.id },
      this.mapper.toEntity(user),
    );
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.dbSource.findOne({ id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.dbSource.findOne({ email });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getByStripeCustomerId(id: string): Promise<User | null> {
    const user = await this.dbSource.findOne({
      stripeCustomerId: id,
    });

    return user ? this.mapper.toDomain(user) : null;
  }
}
