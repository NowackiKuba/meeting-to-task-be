import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';
import { Packet } from '../entities/packet.entity';
import { Page } from 'src/utils/pagination';

export type PacketFilters = {
  limit?: number;
  offset?: number;
  search?: string;
  tier?: SubscriptionTier;
  highlight?: boolean;
  isActive?: boolean;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
};

export interface IPacketRepository {
  create(packet: Packet): Promise<Packet>;
  update(packet: Packet): Promise<void>;
  getById(id: string): Promise<Packet | null>;
  getAll(opts: PacketFilters): Promise<Page<Packet>>;
  delete(id: string): Promise<void>;
}
