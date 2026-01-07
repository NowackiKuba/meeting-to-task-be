import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Feedback } from 'src/feedback/domain/entities/feedback.entity';
import {
  FeedbackFilters,
  IFeedbackRepository,
} from 'src/feedback/domain/ports/feedback.repository.port';
import { FeedbackEntity } from 'src/feedback/infrastructure/entities/feedback.entity';
import { FeedbackMapper } from 'src/feedback/infrastructure/mappers/feedback.mapper';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';
import { Page, paginate } from 'src/utils/pagination';

@Injectable()
export class FeedbackRepository implements IFeedbackRepository {
  private readonly dbSource: EntityRepository<FeedbackEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: FeedbackMapper,
  ) {
    this.dbSource = this.em.getRepository(FeedbackEntity);
  }

  async create(feedback: Feedback): Promise<Feedback> {
    const user = await this.em.getRepository(UserEntity).findOneOrFail({
      id: feedback.userId,
    });

    const entity = this.mapper.toEntity(feedback, user);
    this.em.persist(entity);
    await this.em.flush();

    return this.mapper.toDomain(entity);
  }

  async getAll(opts: FeedbackFilters): Promise<Page<Feedback>> {
    const orderBy = opts.orderBy ?? 'desc';
    const orderByField = opts.orderByField ?? 'createdAt';

    const filters: FilterQuery<FeedbackEntity> = {};

    if (opts.area) {
      filters.area = opts.area;
    }

    if (opts.rate !== undefined) {
      filters.rate = opts.rate;
    }

    if (opts.search) {
      filters.$or = [
        { area: { $like: `%${opts.search}%` } },
        { body: { $like: `%${opts.search}%` } },
      ];
    }

    const [feedbacks, totalCount] = await this.dbSource.findAndCount(filters, {
      orderBy: {
        [orderByField]: orderBy,
      },
      limit: opts.limit,
      offset: opts.offset,
    });

    return paginate(
      feedbacks.map((f) => this.mapper.toDomain(f)),
      { totalCount, limit: opts.limit, offset: opts.offset },
    );
  }

  async getById(id: string): Promise<Feedback | null> {
    const feedback = await this.dbSource.findOne({
      id,
    });

    return feedback ? this.mapper.toDomain(feedback) : null;
  }
}
