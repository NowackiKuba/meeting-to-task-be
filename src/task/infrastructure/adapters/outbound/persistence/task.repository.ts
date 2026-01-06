import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Task } from '@task/domain/entities/task.entity';
import {
  GetTasksPaginatedOptions,
  ITaskRepository,
} from '@task/domain/ports/task.repository.port';
import { TaskEntity } from '@task/infrastructure/entities/task.entity';
import { TaskMapper } from '@task/infrastructure/mappers/task.mapper';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { Page, paginate } from 'src/utils/pagination';

@Injectable()
export class TaskRepository implements ITaskRepository {
  private readonly dbSource: EntityRepository<TaskEntity>;

  constructor(
    private readonly mapper: TaskMapper,
    private readonly em: EntityManager,
  ) {
    this.dbSource = this.em.getRepository(TaskEntity);
  }

  async create(task: Task): Promise<Task> {
    const meeting = await this.em.getRepository(MeetingEntity).findOneOrFail({
      id: task.meetingId,
    });
    const user = await this.em.getRepository(UserEntity).findOneOrFail({
      id: task.userId,
    });
    const entity = this.mapper.toEntity(task, meeting, user);
    this.em.persist(entity);
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }

  async update(task: Task): Promise<void> {
    await this.dbSource.nativeUpdate({ id: task.id }, this.mapperToPlain(task));
  }

  private mapperToPlain(task: Task) {
    return {
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      status: task.status,
      order: task.order,
      isAiGenerated: task.isAiGenerated,
    };
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async getById(id: string): Promise<Task | null> {
    const entity = await this.dbSource.findOne({ id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getByMeeting(
    meetingId: string,
    opts: GetTasksPaginatedOptions,
  ): Promise<Page<Task>> {
    const filters: FilterQuery<TaskEntity> = { meeting: meetingId };
    if (opts.status) filters.status = opts.status;

    const [entities, totalCount] = await this.dbSource.findAndCount(filters, {
      limit: opts.limit,
      offset: opts.offset,
      orderBy: { order: 'ASC' },
    });

    return paginate(
      entities.map((entity) => this.mapper.toDomain(entity)),
      { totalCount, limit: opts.limit, offset: opts.offset },
    );
  }

  async bulkUpdate(ids: string[], updates: Partial<Task>): Promise<void> {
    await this.dbSource.nativeUpdate({ id: { $in: ids } }, updates as any);
  }
}
