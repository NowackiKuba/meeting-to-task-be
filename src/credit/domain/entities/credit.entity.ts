import { User } from 'src/user/domain/entities/user.entity';
import { CreditHistory } from './credit-history.entity';

export type CreditProto = {
  id?: string;
  user?: User;
  userId: string;
  balance: number;
  baseBalance: number;
  totalUsed?: number;
  lastUsedAt?: Date;
  lastResetAt?: Date;
  resetReason?: string;
  metadata?: Record<string, any>;
  history?: CreditHistory[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreditJSON = {
  id: string;
  user?: User;
  userId: string;
  balance: number;
  baseBalance: number;
  totalUsed?: number;
  lastUsedAt?: Date;
  lastResetAt?: Date;
  resetReason?: string;
  metadata?: Record<string, any>;
  history?: CreditHistory[];
  createdAt: Date;
  updatedAt: Date;
};

export class Credit {
  private _id?: string;
  private _user?: User;
  private _userId: string;
  private _balance: number;
  private _totalUsed?: number;
  private _baseBalance: number;
  private _lastUsedAt?: Date;
  private _lastResetAt?: Date;
  private _resetReason?: string;
  private _metadata?: Record<string, any>;
  private _history?: CreditHistory[];
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(proto: CreditProto) {
    this._id = proto.id;
    this._user = proto.user;
    this._userId = proto.userId;
    this._balance = proto.balance;
    this._baseBalance = proto.baseBalance;
    this._totalUsed = proto.totalUsed;
    this._lastUsedAt = proto.lastUsedAt;
    this._lastResetAt = proto.lastResetAt;
    this._resetReason = proto.resetReason;
    this._metadata = proto.metadata;
    this._history = proto.history;
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
  get balance(): number {
    return this._balance;
  }
  get baseBalance(): number {
    return this._baseBalance;
  }
  get totalUsed(): number {
    return this._totalUsed;
  }
  get lastUsedAt(): Date {
    return this._lastUsedAt;
  }
  get lastResetAt(): Date {
    return this._lastResetAt;
  }
  get resetReason(): string {
    return this._resetReason;
  }
  get metadata(): Record<string, any> {
    return this._metadata;
  }
  get history(): CreditHistory[] {
    return this._history;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  deduct(v: number) {
    this._balance -= v;
  }

  add(v: number) {
    this._balance += v;
  }

  reset(resetReason = 'annual reset') {
    this._balance = this._baseBalance;
    this._lastResetAt = new Date();
    this._resetReason = resetReason;
  }

  toJSON() {
    return {
      id: this._id,
      user: this._user,
      userId: this._userId,
      balance: this._balance,
      baseBalance: this._baseBalance,
      totalUsed: this._totalUsed,
      lastUsedAt: this._lastUsedAt,
      lastResetAt: this._lastResetAt,
      resetReason: this._resetReason,
      metadata: this._metadata,
      history: this._history,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
