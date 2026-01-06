import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IPacketRepository } from 'src/packet/domain/ports/packet.repository.port';
import { Packet } from 'src/packet/domain/entities/packet.entity';
import {
  PacketFeatures,
  PacketFeaturesProps,
} from 'src/packet/domain/value-objects/packet-features.vo';
import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';

@Injectable()
export class SeedPacketsUseCase {
  constructor(
    @Inject(Token.PacketRepository)
    private readonly packetRepository: IPacketRepository,
  ) {}

  /**
   * Seed default packets for each tier if they do not yet exist.
   * Idempotent: skips creation when a packet with the same tier already exists.
   */
  async handle() {
    const seeds: Array<{
      name: string;
      tier: SubscriptionTier;
      monthlyAmount: number;
      yearlyAmount: number;
      monthlyPriceId: string;
      yearlyPriceId: string;
      description?: string;
      sortOrder?: number;
      highlight?: boolean;
      features?: PacketFeaturesProps;
    }> = [
      {
        name: 'Free',
        tier: SubscriptionTier.FREE,
        monthlyAmount: 0,
        yearlyAmount: 0,
        monthlyPriceId: 'price_free_monthly',
        yearlyPriceId: 'price_free_yearly',
        description: 'Kick the tires with the essentials.',
        sortOrder: 1,
        highlight: false,
      },
      {
        name: 'Basic',
        tier: SubscriptionTier.BASIC,
        monthlyAmount: 1500, // $15.00
        yearlyAmount: 15000, // $150.00
        monthlyPriceId: 'price_basic_monthly',
        yearlyPriceId: 'price_basic_yearly',
        description: 'For regular usage with generous limits.',
        sortOrder: 2,
        highlight: false,
      },
      {
        name: 'Pro',
        tier: SubscriptionTier.PRO,
        monthlyAmount: 3000, // $30.00
        yearlyAmount: 30000, // $300.00
        monthlyPriceId: 'price_pro_monthly',
        yearlyPriceId: 'price_pro_yearly',
        description: 'For teams needing the full power and support.',
        sortOrder: 3,
        highlight: true,
      },
    ];

    const created: Packet[] = [];

    for (const seed of seeds) {
      const existing = await this.packetRepository.getAll({
        tier: seed.tier,
        limit: 1,
        offset: 0,
      });

      if (existing.data.length > 0) {
        continue;
      }

      const packet = new Packet({
        ...seed,
        isActive: true,
        features: PacketFeatures.createFrom(seed.tier, seed.features ?? {}),
      });

      const saved = await this.packetRepository.create(packet);
      created.push(saved);
    }

    return { createdCount: created.length, created };
  }
}
