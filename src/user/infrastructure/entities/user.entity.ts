import { Entity, ManyToOne, OneToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { SubscriptionEntity } from 'src/subscription/infrastructure/entities/subscription.entity';

export type UserEntityProps = {
  id?: string;
  email: string;
  password: string;
  name?: string | null;
  currentTier?: 'free' | 'basic' | 'pro';
  stripeCustomerId?: string | null;
  meetingsProcessedThisMonth?: number;
  meetingsLimit?: number;
  billingCycleStart?: Date;
  subscription?: SubscriptionEntity;
  seatAccess?: SubscriptionEntity;
};

@Entity({ tableName: 'users' })
export class UserEntity extends BaseEntity implements UserEntityProps {
  @Property({ length: 255 })
  @Unique()
  email!: string;

  @Property({ length: 255 })
  password!: string;

  @Property({ length: 255, nullable: true })
  name?: string | null;

  @Property({ length: 20, default: 'free' })
  currentTier: 'free' | 'basic' | 'pro' = 'free';

  @Property({ length: 255, nullable: true, unique: true })
  stripeCustomerId?: string | null;

  @Property({ type: 'int', default: 0 })
  meetingsProcessedThisMonth: number = 0;

  @Property({ type: 'int', default: 5 })
  meetingsLimit: number = 5;

  @Property({ type: 'date', nullable: true })
  billingCycleStart?: Date;

  // Inverse side; FK lives on subscriptions.user_id
  @OneToOne(() => SubscriptionEntity, { mappedBy: 'user', nullable: true })
  subscription?: SubscriptionEntity;
  @ManyToOne(() => SubscriptionEntity, { nullable: true })
  seatAccess?: SubscriptionEntity;

  constructor(props: UserEntityProps) {
    super();
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.name = props.name;
    this.currentTier = props.currentTier ?? this.currentTier;
    this.stripeCustomerId = props.stripeCustomerId;
    this.meetingsProcessedThisMonth =
      props.meetingsProcessedThisMonth ?? this.meetingsProcessedThisMonth;
    this.meetingsLimit = props.meetingsLimit ?? this.meetingsLimit;
    this.billingCycleStart = props.billingCycleStart;
  }

  //
}
