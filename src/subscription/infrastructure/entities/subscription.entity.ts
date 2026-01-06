import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { PacketEntity } from 'src/packet/infrastructure/entities/packet.entity';
import {
  SubscriptionInterval,
  SubscriptionRenewalType,
  SubscriptionStatus,
  SubscriptionTier,
} from 'src/subscription/domain/entities/subscription.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';
import { generateUUID } from 'src/utils/generate-uuid';

export type SubscriptionEntityProps = {
  id?: string;
  user: UserEntity;
  tier: SubscriptionTier;
  amount: number;
  interval: SubscriptionInterval;
  customerId: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeId: string;
  packet: PacketEntity;
  status: SubscriptionStatus;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, any>; // for custom/extra info
  renewalType?: SubscriptionRenewalType; // how this subscription renews
  couponId?: string; // applied coupon/promo if any
  paymentMethodId?: string; // the chosen payment method
  supportSeats?: boolean;
  seats?: Collection<UserEntity>; // if supporting team/seat subscriptions
  invoiceId?: string; // last generated invoice
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  canceledAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  downgradeAt?: Date; // scheduled for downgrade
  upgradeAt?: Date; // scheduled for upgrade
};

@Entity({ tableName: 'subscriptions' })
export class SubscriptionEntity
  extends BaseEntity
  implements SubscriptionEntityProps
{
  // Owning side to keep user_id column on subscriptions table
  @OneToOne(() => UserEntity, { inversedBy: 'subscription' })
  user: UserEntity;
  @Property({ type: 'text' })
  tier: SubscriptionTier;
  @Property({ type: 'text' })
  interval: SubscriptionInterval;
  @Property({ type: 'int' })
  amount: number;
  @Property({ type: 'text' })
  customerId: string;
  @Property({ type: 'boolean', default: false })
  cancelAtPeriodEnd?: boolean;
  @Property({ type: 'datetime' })
  currentPeriodStart: Date;
  @Property({ type: 'datetime' })
  currentPeriodEnd: Date;
  @Property({ type: 'text' })
  stripeId: string;
  @ManyToOne(() => PacketEntity)
  packet: PacketEntity;
  @Property({ type: 'text' })
  status: SubscriptionStatus;
  @Property({ type: 'datetime', nullable: true })
  trialStart?: Date;
  @Property({ type: 'datetime', nullable: true })
  trialEnd?: Date;
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // for custom/extra info
  @Property({ type: 'text', nullable: true })
  renewalType?: SubscriptionRenewalType; // how this subscription renews
  @Property({ type: 'text', nullable: true })
  couponId?: string; // applied coupon/promo if any
  @Property({ type: 'text', nullable: true })
  paymentMethodId?: string; // the chosen payment method
  @Property({ type: 'boolean', default: false })
  supportSeats?: boolean;
  @OneToMany(() => UserEntity, (u) => u.seatAccess, { nullable: true })
  seats?: Collection<UserEntity>; // if supporting team/seat subscriptions
  @Property({ type: 'text', nullable: true })
  invoiceId?: string; // last generated invoice
  @Property({ type: 'datetime', nullable: true })
  lastPaymentDate?: Date;
  @Property({ type: 'datetime', nullable: true })
  nextPaymentDate?: Date;
  @Property({ type: 'datetime', nullable: true })
  canceledAt?: Date;
  @Property({ type: 'datetime', nullable: true })
  pausedAt?: Date;
  @Property({ type: 'datetime', nullable: true })
  resumedAt?: Date;
  @Property({ type: 'datetime', nullable: true })
  downgradeAt?: Date; // scheduled for downgrade
  @Property({ type: 'datetime', nullable: true })
  upgradeAt?: Date; // scheduled for upgrade

  constructor(props: SubscriptionEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.tier = props.tier;
    this.amount = props.amount;
    this.interval = props.interval;
    this.customerId = props.customerId;
    this.cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this.currentPeriodStart = props.currentPeriodStart;
    this.currentPeriodEnd = props.currentPeriodEnd;
    this.stripeId = props.stripeId;
    this.packet = props.packet;
    this.status = props.status;
    this.trialStart = props.trialStart;
    this.trialEnd = props.trialEnd;
    this.metadata = props.metadata;
    this.renewalType = props.renewalType;
    this.couponId = props.couponId;
    this.paymentMethodId = props.paymentMethodId;
    this.supportSeats = props.supportSeats;
    this.seats = props.seats;
    this.invoiceId = props.invoiceId;
    this.lastPaymentDate = props.lastPaymentDate;
    this.nextPaymentDate = props.nextPaymentDate;
    this.canceledAt = props.canceledAt;
    this.pausedAt = props.pausedAt;
    this.resumedAt = props.resumedAt;
    this.downgradeAt = props.downgradeAt;
    this.upgradeAt = props.upgradeAt;
  }
}
