import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { PacketEntity } from '../entities/packet.entity';
import { Packet } from 'src/packet/domain/entities/packet.entity';
import { PacketFeatures } from 'src/packet/domain/value-objects/packet-features.vo';

@Injectable()
export class PacketMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: PacketEntity): Packet {
    // Ensure features is always a PacketFeatures instance
    // When retrieved from DB as JSONB, it might be a plain object
    let features: PacketFeatures;
    if (entity.features instanceof PacketFeatures) {
      features = entity.features;
    } else {
      // Convert plain object to PacketFeatures instance
      features = new PacketFeatures(entity.features as any);
    }

    return new Packet({
      ...entity,
      features,
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
