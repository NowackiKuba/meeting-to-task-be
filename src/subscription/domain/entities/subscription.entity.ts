import { Packet } from 'src/packet/domain/entities/packet.entity';
import { User } from 'src/user/domain/entities/user.entity';

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

export enum SubscriptionInterval {
  YEARLY = 'yearly',
  MONTHLY = 'monthly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

export enum SubscriptionRenewalType {
  AUTO = 'auto',
  MANUAL = 'manual',
}

export type SubscriptionProto = {
  id?: string;
  user?: User;
  userId: string;
  tier: SubscriptionTier;
  amount: number;
  interval: SubscriptionInterval;
  customerId: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeId: string;
  packet?: Packet;
  packetId: string;
  status: SubscriptionStatus;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, any>;
  renewalType?: SubscriptionRenewalType;
  couponId?: string;
  paymentMethodId?: string;
  supportSeats?: boolean;
  seats?: User[];
  invoiceId?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  canceledAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  downgradeAt?: Date;
  upgradeAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubscriptionJSON = {
  id: string;
  user?: User;
  userId: string;
  tier: SubscriptionTier;
  amount: number;
  interval: SubscriptionInterval;
  customerId: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeId: string;
  packet?: Packet;
  packetId: string;
  status: SubscriptionStatus;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, any>;
  renewalType?: SubscriptionRenewalType;
  couponId?: string;
  paymentMethodId?: string;
  supportSeats?: boolean;
  seats?: User[];
  invoiceId?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  canceledAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  downgradeAt?: Date;
  upgradeAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class Subscription {
  private readonly _id: string;
  private readonly _user?: User;
  private readonly _userId: string;
  private readonly _tier: SubscriptionTier;
  private readonly _amount: number;
  private readonly _interval: SubscriptionInterval;
  private readonly _customerId: string;
  private readonly _cancelAtPeriodEnd?: boolean;
  private readonly _currentPeriodStart: Date;
  private readonly _currentPeriodEnd: Date;
  private readonly _stripeId: string;
  private readonly _packet?: Packet;
  private readonly _packetId: string;
  private readonly _status: SubscriptionStatus;
  private readonly _trialStart?: Date;
  private readonly _trialEnd?: Date;
  private readonly _metadata?: Record<string, any>;
  private readonly _renewalType?: SubscriptionRenewalType;
  private readonly _couponId?: string;
  private readonly _paymentMethodId?: string;
  private readonly _supportSeats?: boolean;
  private readonly _seats?: User[];
  private readonly _invoiceId?: string;
  private readonly _lastPaymentDate?: Date;
  private readonly _nextPaymentDate?: Date;
  private readonly _canceledAt?: Date;
  private readonly _pausedAt?: Date;
  private readonly _resumedAt?: Date;
  private readonly _downgradeAt?: Date;
  private readonly _upgradeAt?: Date;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(proto: SubscriptionProto) {
    this._id = proto.id;
    this._user = proto.user;
    this._userId = proto.userId;
    this._tier = proto.tier;
    this._amount = proto.amount;
    this._interval = proto.interval;
    this._customerId = proto.customerId;
    this._cancelAtPeriodEnd = proto.cancelAtPeriodEnd;
    this._currentPeriodStart = proto.currentPeriodStart;
    this._currentPeriodEnd = proto.currentPeriodEnd;
    this._stripeId = proto.stripeId;
    this._packet = proto.packet;
    this._packetId = proto.packetId;
    this._status = proto.status;
    this._trialStart = proto.trialStart;
    this._trialEnd = proto.trialEnd;
    this._metadata = proto.metadata;
    this._renewalType = proto.renewalType;
    this._couponId = proto.couponId;
    this._paymentMethodId = proto.paymentMethodId;
    this._supportSeats = proto.supportSeats;
    this._seats = proto.seats;
    this._invoiceId = proto.invoiceId;
    this._lastPaymentDate = proto.lastPaymentDate;
    this._nextPaymentDate = proto.nextPaymentDate;
    this._canceledAt = proto.canceledAt;
    this._pausedAt = proto.pausedAt;
    this._resumedAt = proto.resumedAt;
    this._downgradeAt = proto.downgradeAt;
    this._upgradeAt = proto.upgradeAt;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get user(): User {
    return this._user;
  }
  get userId(): string {
    return this._userId;
  }
  get tier(): SubscriptionTier {
    return this._tier;
  }
  get amount(): number {
    return this._amount;
  }
  get interval(): SubscriptionInterval {
    return this._interval;
  }
  get customerId(): string {
    return this._customerId;
  }
  get cancelAtPeriodEnd(): boolean {
    return this._cancelAtPeriodEnd;
  }
  get currentPeriodStart(): Date {
    return this._currentPeriodStart;
  }
  get currentPeriodEnd(): Date {
    return this._currentPeriodEnd;
  }
  get stripeId(): string {
    return this._stripeId;
  }
  get packet(): Packet {
    return this._packet;
  }
  get packetId(): string {
    return this._packetId;
  }
  get status(): SubscriptionStatus {
    return this._status;
  }
  get trialStart(): Date {
    return this._trialStart;
  }
  get trialEnd(): Date {
    return this._trialEnd;
  }
  get metadata(): Record<string, any> {
    return this._metadata;
  }
  get renewalType(): SubscriptionRenewalType {
    return this._renewalType;
  }
  get couponId(): string {
    return this._couponId;
  }
  get paymentMethodId(): string {
    return this._paymentMethodId;
  }
  get supportSeats(): boolean {
    return this._supportSeats;
  }
  get seats(): User[] {
    return this._seats;
  }
  get invoiceId(): string {
    return this._invoiceId;
  }
  get lastPaymentDate(): Date {
    return this._lastPaymentDate;
  }
  get nextPaymentDate(): Date {
    return this._nextPaymentDate;
  }
  get canceledAt(): Date {
    return this._canceledAt;
  }
  get pausedAt(): Date {
    return this._pausedAt;
  }
  get resumedAt(): Date {
    return this._resumedAt;
  }
  get downgradeAt(): Date {
    return this._downgradeAt;
  }
  get upgradeAt(): Date {
    return this._upgradeAt;
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
      user: this._user,
      userId: this._userId,
      tier: this._tier,
      amount: this._amount,
      interval: this._interval,
      customerId: this._customerId,
      cancelAtPeriodEnd: this._cancelAtPeriodEnd,
      currentPeriodStart: this._currentPeriodStart,
      currentPeriodEnd: this._currentPeriodEnd,
      stripeId: this._stripeId,
      packet: this._packet,
      packetId: this._packetId,
      status: this._status,
      trialStart: this._trialStart,
      trialEnd: this._trialEnd,
      metadata: this._metadata,
      renewalType: this._renewalType,
      couponId: this._couponId,
      paymentMethodId: this._paymentMethodId,
      supportSeats: this._supportSeats,
      seats: this._seats,
      invoiceId: this._invoiceId,
      lastPaymentDate: this._lastPaymentDate,
      nextPaymentDate: this._nextPaymentDate,
      canceledAt: this._canceledAt,
      pausedAt: this._pausedAt,
      resumedAt: this._resumedAt,
      downgradeAt: this._downgradeAt,
      upgradeAt: this._upgradeAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
