import { Collection, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { PacketFeatures } from 'src/packet/domain/value-objects/packet-features.vo';
import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';
import { SubscriptionEntity } from 'src/subscription/infrastructure/entities/subscription.entity';
import { generateUUID } from 'src/utils/generate-uuid';

export type PacketEntityProps = {
  id?: string; // unique packet id, e.g. uuid
  name: string; // display name of the packet
  tier: SubscriptionTier; // tier label, e.g. 'free' | 'basic' | 'pro'
  monthlyAmount: number; // monthly subscription amount in minor currency units
  yearlyAmount: number; // yearly subscription amount in minor currency units
  monthlyPriceId: string; // Stripe monthly price ID or similar
  yearlyPriceId: string; // Stripe yearly price ID or similar
  features: PacketFeatures; // key-value map for packet features
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
  iconUrl?: string; // url to an icon/image for the packet
  trialDays?: number; // number of free trial days for this packet
  highlight?: boolean; // whether to visually highlight/recommend this packet
  subscriptions?: Collection<SubscriptionEntity>;
};

@Entity({ tableName: 'packets' })
export class PacketEntity extends BaseEntity implements PacketEntityProps {
  @Property({ type: 'text' })
  name: string;
  @Property({ type: 'text' })
  tier: SubscriptionTier;
  @Property({ type: 'int' })
  monthlyAmount: number;
  @Property({ type: 'int' })
  yearlyAmount: number;
  @Property({ type: 'text' })
  monthlyPriceId: string;
  @Property({ type: 'text' })
  yearlyPriceId: string;
  @Property({ type: 'jsonb' })
  features: PacketFeatures;
  @Property({ type: 'boolean', default: false })
  isActive?: boolean;
  @Property({ type: 'text', nullable: true })
  description?: string;
  @Property({ type: 'int', autoincrement: true })
  sortOrder?: number;
  @Property({ type: 'text', nullable: true })
  iconUrl?: string;
  @Property({ type: 'int', nullable: true })
  trialDays?: number;
  @Property({ type: 'boolean', default: false })
  highlight?: boolean;
  @ManyToOne(() => SubscriptionEntity, { nullable: true })
  subscriptions?: Collection<SubscriptionEntity>;

  constructor(props: PacketEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.name = props.name;
    this.tier = props.tier;
    this.monthlyAmount = props.monthlyAmount;
    this.yearlyAmount = props.yearlyAmount;
    this.monthlyPriceId = props.monthlyPriceId;
    this.yearlyPriceId = props.yearlyPriceId;
    this.features = props.features;
    this.isActive = props.isActive;
    this.description = props.description;
    this.sortOrder = props.sortOrder;
    this.iconUrl = props.iconUrl;
    this.trialDays = props.trialDays;
    this.highlight = props.highlight;
    this.subscriptions = props.subscriptions;
  }
}
