import {
  Subscription,
  SubscriptionTier,
} from 'src/subscription/domain/entities/subscription.entity';
import { PacketFeatures } from '../value-objects/packet-features.vo';

export type PacketProto = {
  id?: string;
  name: string;
  tier: SubscriptionTier;
  monthlyAmount: number;
  yearlyAmount: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
  features: PacketFeatures;
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
  iconUrl?: string;
  trialDays?: number;
  highlight?: boolean;
  subscriptions?: Subscription[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type PacketJSON = {
  id: string;
  name: string;
  tier: SubscriptionTier;
  monthlyAmount: number;
  yearlyAmount: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
  features: PacketFeatures;
  isActive?: boolean;
  description?: string;
  sortOrder?: number;
  iconUrl?: string;
  trialDays?: number;
  highlight?: boolean;
  subscriptions?: Subscription[];
  createdAt: Date;
  updatedAt: Date;
};

export class Packet {
  private readonly _id?: string;
  private readonly _name: string;
  private readonly _tier: SubscriptionTier;
  private readonly _monthlyAmount: number;
  private readonly _yearlyAmount: number;
  private readonly _monthlyPriceId: string;
  private readonly _yearlyPriceId: string;
  private readonly _features: PacketFeatures;
  private readonly _isActive?: boolean;
  private readonly _description?: string;
  private readonly _sortOrder?: number;
  private readonly _iconUrl?: string;
  private readonly _trialDays?: number;
  private readonly _highlight?: boolean;
  private readonly _subscriptions?: Subscription[];
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: PacketProto) {
    this._id = proto.id;
    this._name = proto.name;
    this._tier = proto.tier;
    this._monthlyAmount = proto.monthlyAmount;
    this._yearlyAmount = proto.yearlyAmount;
    this._monthlyPriceId = proto.monthlyPriceId;
    this._yearlyPriceId = proto.yearlyPriceId;
    this._features = proto.features ?? PacketFeatures.createFrom(this._tier);
    this._isActive = proto.isActive;
    this._description = proto.description;
    this._sortOrder = proto.sortOrder;
    this._iconUrl = proto.iconUrl;
    this._trialDays = proto.trialDays;
    this._highlight = proto.highlight;
    this._subscriptions = proto.subscriptions;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get tier(): string {
    return this._tier;
  }
  get monthlyAmount(): number {
    return this._monthlyAmount;
  }
  get yearlyAmount(): number {
    return this._yearlyAmount;
  }
  get monthlyPriceId(): string {
    return this._monthlyPriceId;
  }
  get yearlyPriceId(): string {
    return this._yearlyPriceId;
  }
  get features(): PacketFeatures {
    return this._features;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get description(): string {
    return this._description;
  }
  get sortOrder(): number {
    return this._sortOrder;
  }
  get iconUrl(): string {
    return this._iconUrl;
  }
  get trialDays(): number {
    return this._trialDays;
  }
  get highlight(): boolean {
    return this._highlight;
  }
  get subscriptions(): Subscription[] {
    return this._subscriptions;
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
      name: this._name,
      tier: this._tier,
      monthlyAmount: this._monthlyAmount,
      yearlyAmount: this._yearlyAmount,
      monthlyPriceId: this._monthlyPriceId,
      yearlyPriceId: this._yearlyPriceId,
      features: this._features,
      isActive: this._isActive,
      description: this._description,
      sortOrder: this._sortOrder,
      iconUrl: this._iconUrl,
      trialDays: this._trialDays,
      highlight: this._highlight,
      subscriptions: this._subscriptions,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
