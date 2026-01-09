import { Credit } from './credit.entity';

export enum CreditHistoryType {
  ADD = 'add',
  DEDUCT = 'deduct',
  RESET = 'reset',
  REFUND = 'refund',
  EXPIRED = 'expired',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export type CreditHistoryProto = {
  id?: string;
  credit?: Credit;
  creditId: string;
  amount: number;
  type: CreditHistoryType;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreditHistoryJSON = {
  id: string;
  credit?: Credit;
  creditId: string;
  amount: number;
  type: CreditHistoryType;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export class CreditHistory {
  private readonly _id?: string;
  private readonly _credit?: Credit;
  private readonly _creditId: string;
  private readonly _amount: number;
  private readonly _type: CreditHistoryType;
  private readonly _balanceBefore: number;
  private readonly _balanceAfter: number;
  private readonly _reason?: string;
  private readonly _description?: string;
  private readonly _referenceId?: string;
  private readonly _metadata?: Record<string, any>;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: CreditHistoryProto) {
    this._id = proto.id;
    this._credit = proto.credit;
    this._creditId = proto.creditId;
    this._amount = proto.amount;
    this._type = proto.type;
    this._balanceBefore = proto.balanceBefore;
    this._balanceAfter = proto.balanceAfter;
    this._reason = proto.reason;
    this._description = proto.description;
    this._referenceId = proto.referenceId;
    this._metadata = proto.metadata;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get credit(): Credit {
    return this._credit;
  }
  get creditId(): string {
    return this._creditId;
  }
  get amount(): number {
    return this._amount;
  }
  get type(): CreditHistoryType {
    return this._type;
  }
  get balanceBefore(): number {
    return this._balanceBefore;
  }
  get balanceAfter(): number {
    return this._balanceAfter;
  }
  get reason(): string {
    return this._reason;
  }
  get description(): string {
    return this._description;
  }
  get referenceId(): string {
    return this._referenceId;
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
      credit: this._credit,
      creditId: this._creditId,
      amount: this._amount,
      type: this._type,
      balanceBefore: this._balanceBefore,
      balanceAfter: this._balanceAfter,
      reason: this._reason,
      description: this._description,
      referenceId: this._referenceId,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
