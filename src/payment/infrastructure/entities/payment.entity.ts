import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import {
  PaymentMethod,
  PaymentStatus,
} from 'src/payment/domain/entities/payment.entity';
import { CurrencyCode } from 'src/shared/core/types';
import { SubscriptionEntity } from 'src/subscription/infrastructure/entities/subscription.entity';

export type PaymentEntityProps = {
  id?: string;
  gross: number;
  net: number;
  currency: CurrencyCode;
  taxRate: number;
  taxAmount: number;
  subscription?: SubscriptionEntity;
  status: PaymentStatus;
  notes?: string;
  providerId: string;
  method?: PaymentMethod; // e.g., card, paypal, etc.
  receiptUrl?: string;
  paidAt?: Date;
  invoiceId?: string;
  refundedAmount?: number;
  refundReason?: string;
  attemptedAt?: Date;
  failureCode?: string;
  failureMessage?: string;
  metadata?: Record<string, any>;
};

@Entity({ tableName: 'payments' })
export class PaymentEntity extends BaseEntity implements PaymentEntityProps {
  @Property({ type: 'int' })
  gross: number;
  @Property({ type: 'int' })
  net: number;
  @Property({ type: 'text' })
  currency: CurrencyCode;
  @Property({ type: 'int' })
  taxRate: number;
  @Property({ type: 'int' })
  taxAmount: number;
  @ManyToOne(() => SubscriptionEntity, { nullable: true })
  subscription?: SubscriptionEntity;
  @Property({ type: 'text' })
  status: PaymentStatus;
  @Property({ type: 'text', nullable: true })
  notes?: string;
  @Property({ type: 'text' })
  providerId: string;
  @Property({ type: 'text', nullable: true })
  method?: PaymentMethod; // e.g., card, paypal, etc.
  @Property({ type: 'text', nullable: true })
  receiptUrl?: string;
  @Property({ type: 'text', nullable: true })
  paidAt?: Date;
  @Property({ type: 'text', nullable: true })
  invoiceId?: string;
  @Property({ type: 'text', nullable: true })
  refundedAmount?: number;
  @Property({ type: 'text', nullable: true })
  refundReason?: string;
  @Property({ type: 'datetime', nullable: true })
  attemptedAt?: Date;
  @Property({ type: 'text', nullable: true })
  failureCode?: string;
  @Property({ type: 'text', nullable: true })
  failureMessage?: string;
  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  constructor(proto: PaymentEntityProps) {
    super();
    this.gross = proto.gross;
    this.net = proto.net;
    this.currency = proto.currency;
    this.taxRate = proto.taxRate;
    this.taxAmount = proto.taxAmount;
    this.subscription = proto.subscription;
    this.status = proto.status;
    this.notes = proto.notes;
    this.providerId = proto.providerId;
    this.method = proto.method;
    this.receiptUrl = proto.receiptUrl;
    this.paidAt = proto.paidAt;
    this.invoiceId = proto.invoiceId;
    this.refundedAmount = proto.refundedAmount;
    this.refundReason = proto.refundReason;
    this.attemptedAt = proto.attemptedAt;
    this.failureCode = proto.failureCode;
    this.failureMessage = proto.failureMessage;
    this.metadata = proto.metadata;
  }
}
