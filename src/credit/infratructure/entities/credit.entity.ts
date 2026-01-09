import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';
import { CreditHistoryEntity } from './credit-history.entity';
import { generateUUID } from 'src/utils/generate-uuid';

export type CreditEntityProps = {
  id?: string;
  user: UserEntity;
  balance: number; // Current available balance
  baseBalance: number; // Current available balance
  totalUsed?: number; // Lifetime total amount used
  lastUsedAt?: Date; // When credit was last used
  lastResetAt?: Date; // When balance was last reset
  resetReason?: string; // Reason for last reset (e.g., 'monthly_reset', 'admin_reset')
  metadata?: Record<string, any>; // Additional flexible data
  history?: Collection<CreditHistoryEntity>; // Credit transaction history
};

@Entity({ tableName: 'credits' })
export class CreditEntity extends BaseEntity implements CreditEntityProps {
  // Owning side to keep user_id column on credits table
  @OneToOne(() => UserEntity, { inversedBy: 'credit' as keyof UserEntity })
  user: UserEntity;

  @Property({ type: 'int', default: 0 })
  balance: number;

  @Property({ type: 'int', default: 0 })
  baseBalance: number;

  @Property({ type: 'int', default: 0 })
  totalUsed?: number;

  @Property({ type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  lastResetAt?: Date;

  @Property({ type: 'text', nullable: true })
  resetReason?: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => CreditHistoryEntity, (history) => history.credit)
  history?: Collection<CreditHistoryEntity>;

  constructor(props: CreditEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.baseBalance = props.baseBalance;
    this.balance = props.balance;
    this.totalUsed = props.totalUsed ?? 0;
    this.lastUsedAt = props.lastUsedAt;
    this.lastResetAt = props.lastResetAt;
    this.resetReason = props.resetReason;
    this.metadata = props.metadata;
  }
}
