import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { PacketEntity } from '../entities/packet.entity';
import { Packet } from 'src/packet/domain/entities/packet.entity';

@Injectable()
export class PacketMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: PacketEntity): Packet {
    return new Packet({
      ...entity,
      subscriptions: undefined,
    });
  }

  toEntity(packet: Packet): PacketEntity {
    const packetJSON = packet.toJSON();

    return new PacketEntity({
      ...packetJSON,
      subscriptions: undefined,
    });
  }
}
