import { CurrencyCode } from 'src/shared/core/types';
import { Subscription } from 'src/subscription/domain/entities/subscription.entity';

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  BANK = 'bank',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export type PaymentProto = {
  id?: string;
  gross: number;
  net: number;
  currency: CurrencyCode;
  taxRate: number;
  taxAmount: number;
  subscription?: Subscription;
  subscriptionId?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
};

export type PaymentJSON = {
  id: string;
  gross: number;
  net: number;
  currency: CurrencyCode;
  taxRate: number;
  taxAmount: number;
  subscription?: Subscription;
  subscriptionId?: string;
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
  createdAt: Date;
  updatedAt: Date;
};

export class Payment {
  private readonly _id?: string;
  private readonly _gross: number;
  private readonly _net: number;
  private readonly _currency: CurrencyCode;
  private readonly _taxRate: number;
  private readonly _taxAmount: number;
  private readonly _subscription?: Subscription;
  private readonly _subscriptionId?: string;
  private readonly _status: PaymentStatus;
  private readonly _notes?: string;
  private readonly _providerId: string;
  private readonly _method?: PaymentMethod; // e.g., card, paypal, etc.
  private readonly _receiptUrl?: string;
  private readonly _paidAt?: Date;
  private readonly _invoiceId?: string;
  private readonly _refundedAmount?: number;
  private readonly _refundReason?: string;
  private readonly _attemptedAt?: Date;
  private readonly _failureCode?: string;
  private readonly _failureMessage?: string;
  private readonly _metadata?: Record<string, any>;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: PaymentProto) {
    this._id = proto.id;
    this._gross = proto.gross;
    this._net = proto.net;
    this._currency = proto.currency;
    this._taxRate = proto.taxRate;
    this._taxAmount = proto.taxAmount;
    this._subscription = proto.subscription;
    this._subscriptionId = proto.subscriptionId;
    this._status = proto.status;
    this._notes = proto.notes;
    this._providerId = proto.providerId;
    this._method = proto.method;
    this._receiptUrl = proto.receiptUrl;
    this._paidAt = proto.paidAt;
    this._invoiceId = proto.invoiceId;
    this._refundedAmount = proto.refundedAmount;
    this._refundReason = proto.refundReason;
    this._attemptedAt = proto.attemptedAt;
    this._failureCode = proto.failureCode;
    this._failureMessage = proto.failureMessage;
    this._metadata = proto.metadata;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get gross(): number {
    return this._gross;
  }
  get net(): number {
    return this._net;
  }
  get currency(): CurrencyCode {
    return this._currency;
  }
  get taxRate(): number {
    return this._taxRate;
  }
  get taxAmount(): number {
    return this._taxAmount;
  }
  get subscription(): Subscription {
    return this._subscription;
  }
  get subscriptionId(): string {
    return this._subscriptionId;
  }
  get status(): PaymentStatus {
    return this._status;
  }
  get notes(): string {
    return this._notes;
  }
  get providerId(): string {
    return this._providerId;
  }
  get method(): PaymentMethod {
    return this._method;
  }
  get receiptUrl(): string {
    return this._receiptUrl;
  }
  get paidAt(): Date {
    return this._paidAt;
  }
  get invoiceId(): string {
    return this._invoiceId;
  }
  get refundedAmount(): number {
    return this._refundedAmount;
  }
  get refundReason(): string {
    return this._refundReason;
  }
  get attemptedAt(): Date {
    return this._attemptedAt;
  }
  get failureCode(): string {
    return this._failureCode;
  }
  get failureMessage(): string {
    return this._failureMessage;
  }
  get metadata(): Record<string, any> {
    return this._metadata;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON() {
    return {
      id: this._id,
      gross: this._gross,
      net: this._net,
      currency: this._currency,
      taxRate: this._taxRate,
      taxAmount: this._taxAmount,
      subscription: this._subscription,
      subscriptionId: this._subscriptionId,
      status: this._status,
      notes: this._notes,
      providerId: this._providerId,
      method: this._method,
      receiptUrl: this._receiptUrl,
      paidAt: this._paidAt,
      invoiceId: this._invoiceId,
      refundedAmount: this._refundedAmount,
      refundReason: this._refundReason,
      attemptedAt: this._attemptedAt,
      failureCode: this._failureCode,
      failureMessage: this._failureMessage,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
