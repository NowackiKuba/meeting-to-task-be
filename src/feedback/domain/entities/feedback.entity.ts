import { User } from 'src/user/domain/entities/user.entity';

export type FeedbackProto = {
  id?: string;
  user?: User;
  userId: string;
  rate: number;
  area: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FeedbackJSON = {
  id: string;
  user?: User;
  userId: string;
  rate: number;
  area: string;
  body?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Feedback {
  private readonly _id?: string;
  private readonly _user?: User;
  private readonly _userId: string;
  private readonly _rate: number;
  private readonly _area: string;
  private readonly _body?: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: FeedbackProto) {
    this._id = proto.id;
    this._user = proto.user;
    this._userId = proto.userId;
    this._rate = proto.rate;
    this._area = proto.area;
    this._body = proto.body;
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
  get rate(): number {
    return this._rate;
  }
  get area(): string {
    return this._area;
  }
  get body(): string {
    return this._body;
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
      rate: this._rate,
      area: this._area,
      body: this._body,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
