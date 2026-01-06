import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Packet } from 'src/packet/domain/entities/packet.entity';
import {
  IPacketRepository,
  PacketFilters,
} from 'src/packet/domain/ports/packet.repository.port';
import { PacketEntity } from 'src/packet/infrastructure/entities/packet.entity';
import { PacketMapper } from 'src/packet/infrastructure/mappers/packet.mapper';
import { Page, paginate } from 'src/utils/pagination';

@Injectable()
export class PacketRepository implements IPacketRepository {
  private readonly dbSource: EntityRepository<PacketEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: PacketMapper,
  ) {
    this.dbSource = this.em.getRepository(PacketEntity);
  }

  async create(packet: Packet): Promise<Packet> {
    const res = this.dbSource.create(this.mapper.toEntity(packet));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
  }

  async getAll(opts: PacketFilters): Promise<Page<Packet>> {
    const filters: FilterQuery<PacketEntity> = {};

    const { highlight, isActive, limit, offset, search, tier } = opts;

    if (typeof highlight === 'boolean') {
      filters.highlight = highlight;
    }

    if (typeof isActive === 'boolean') {
      filters.isActive = isActive;
    }

    if (search) {
      filters.name = { $like: `%${search}%` };
    }

    if (tier) {
      filters.tier = tier;
    }

    const orderBy = opts.orderBy ?? 'asc';
    const orderByField = opts.orderByField ?? 'sortOrder';

    const [packets, totalCount] = await this.dbSource.findAndCount(filters, {
      limit,
      offset,
      orderBy: {
        [orderByField]: orderBy,
      },
    });

    return paginate(
      packets.map((packet) => this.mapper.toDomain(packet)),
      { totalCount, limit, offset },
    );
  }

  async getById(id: string): Promise<Packet | null> {
    const packet = await this.dbSource.findOne({ id });

    return packet ? this.mapper.toDomain(packet) : null;
  }

  async update(packet: Packet): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: packet.id },
      this.mapper.toEntity(packet),
    );
  }
}
