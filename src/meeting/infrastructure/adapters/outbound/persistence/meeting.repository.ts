import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Meeting } from '@meeting/domain/entities/meeting.entity';
import {
  GetMeetingsPaginatedOptions,
  IMeetingRepository,
} from '@meeting/domain/ports/meeting.repository.port';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { MeetingMapper } from '@meeting/infrastructure/mappers/meeting.mapper';
import { Page, paginate } from 'src/utils/pagination';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Injectable()
export class MeetingRepository implements IMeetingRepository {
  private readonly dbSource: EntityRepository<MeetingEntity>;

  constructor(
    private readonly mapper: MeetingMapper,
    private readonly em: EntityManager,
  ) {
    this.dbSource = this.em.getRepository(MeetingEntity);
  }

  async create(meeting: Meeting): Promise<Meeting> {
    const user = await this.em.getRepository(UserEntity).findOneOrFail({
      id: meeting.userId,
    });
    const entity = this.mapper.toEntity(meeting, user);
    this.em.persist(entity);
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }

  async update(meeting: Meeting): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: meeting.id },
      { notes: meeting.notes, title: meeting.title, status: meeting.status },
    );
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async getById(id: string): Promise<Meeting | null> {
    const entity = await this.dbSource.findOne({ id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getAll(
    opts: GetMeetingsPaginatedOptions,
    userId: string,
  ): Promise<Page<Meeting>> {
    const filters: FilterQuery<MeetingEntity> = { user: userId };
    if (opts.status) filters.status = opts.status;

    const [entities, totalCount] = await this.dbSource.findAndCount(filters, {
      limit: opts.limit,
      offset: opts.offset,
      orderBy: { createdAt: 'DESC' },
    });

    return paginate(
      entities.map((entity) => this.mapper.toDomain(entity)),
      { totalCount, limit: opts.limit, offset: opts.offset },
    );
  }
}

