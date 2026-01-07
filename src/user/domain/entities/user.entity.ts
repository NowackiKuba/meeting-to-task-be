export type UserProto = {
  id?: string;
  email: string;
  password: string;
  name?: string | null;
  currentTier?: 'free' | 'basic' | 'pro';
  stripeCustomerId?: string | null;
  meetingsProcessedThisMonth?: number;
  meetingsLimit?: number;
  billingCycleStart?: Date;
  lastLimitsResetAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserJSON = {
  id: string;
  email: string;
  name?: string | null;
  currentTier: 'free' | 'basic' | 'pro';
  stripeCustomerId?: string | null;
  meetingsProcessedThisMonth: number;
  meetingsLimit: number;
  billingCycleStart?: Date;
  lastLimitsResetAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export class User {
  private readonly _id?: string;
  private readonly _email: string;
  private _password: string;
  private _name?: string | null;
  private _currentTier: 'free' | 'basic' | 'pro';
  private _stripeCustomerId?: string | null;
  private _meetingsProcessedThisMonth: number;
  private _meetingsLimit: number;
  private _billingCycleStart?: Date;
  private _lastLimitsResetAt?: Date;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: UserProto) {
    this._id = proto.id;
    this._email = proto.email;
    this._password = proto.password;
    this._name = proto.name;
    this._currentTier = proto.currentTier ?? 'free';
    this._stripeCustomerId = proto.stripeCustomerId;
    this._meetingsProcessedThisMonth = proto.meetingsProcessedThisMonth ?? 0;
    this._meetingsLimit = proto.meetingsLimit ?? 5;
    this._billingCycleStart = proto.billingCycleStart;
    this._lastLimitsResetAt = proto.lastLimitsResetAt;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get name(): string | null | undefined {
    return this._name;
  }

  get currentTier(): 'free' | 'basic' | 'pro' {
    return this._currentTier;
  }

  get stripeCustomerId(): string | null | undefined {
    return this._stripeCustomerId;
  }

  get meetingsProcessedThisMonth(): number {
    return this._meetingsProcessedThisMonth;
  }

  get meetingsLimit(): number {
    return this._meetingsLimit;
  }

  get billingCycleStart(): Date | undefined {
    return this._billingCycleStart;
  }

  get lastLimitsResetAt(): Date | undefined {
    return this._lastLimitsResetAt;
  }

  setPassword(hash: string) {
    this._password = hash;
  }

  updateTier(tier: 'free' | 'basic' | 'pro', limit: number) {
    this._currentTier = tier;
    this._meetingsLimit = limit;
  }

  incrementMeetingsProcessed() {
    this._meetingsProcessedThisMonth += 1;
  }

  resetUsage(limit: number) {
    this._meetingsProcessedThisMonth = 0;
    this._meetingsLimit = limit;
    this._billingCycleStart = new Date();
    this._lastLimitsResetAt = new Date();
  }

  setStripeCustomerId(id: string) {
    this._stripeCustomerId = id;
  }

  setName(name?: string | null) {
    this._name = name;
  }

  toJSON(): UserJSON {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      currentTier: this._currentTier,
      stripeCustomerId: this._stripeCustomerId,
      meetingsProcessedThisMonth: this._meetingsProcessedThisMonth,
      meetingsLimit: this._meetingsLimit,
      billingCycleStart: this._billingCycleStart,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
