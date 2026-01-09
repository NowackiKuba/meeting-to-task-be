import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { CreditEntity } from './credit.entity';
import { generateUUID } from 'src/utils/generate-uuid';
import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';

export type CreditHistoryEntityProps = {
  id?: string;
  credit: CreditEntity;
  amount: number; // Amount changed (positive for add, negative for deduct)
  type: CreditHistoryType; // Type of transaction
  balanceBefore: number; // Balance before this transaction
  balanceAfter: number; // Balance after this transaction
  reason?: string; // Reason for the transaction
  description?: string; // Human-readable description
  referenceId?: string; // Reference to related entity (e.g., payment_id, meeting_id)
  metadata?: Record<string, any>; // Additional flexible data
};

@Entity({ tableName: 'credit_history' })
export class CreditHistoryEntity
  extends BaseEntity
  implements CreditHistoryEntityProps
{
  @ManyToOne(() => CreditEntity)
  credit: CreditEntity;

  @Property({ type: 'int' })
  amount: number;

  @Property({ type: 'text' })
  type: CreditHistoryType;

  @Property({ type: 'int' })
  balanceBefore: number;

  @Property({ type: 'int' })
  balanceAfter: number;

  @Property({ type: 'text', nullable: true })
  reason?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'text', nullable: true })
  referenceId?: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  constructor(props: CreditHistoryEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.credit = props.credit;
    this.amount = props.amount;
    this.type = props.type;
    this.balanceBefore = props.balanceBefore;
    this.balanceAfter = props.balanceAfter;
    this.reason = props.reason;
    this.description = props.description;
    this.referenceId = props.referenceId;
    this.metadata = props.metadata;
  }
}
