export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export type TaskProto = {
  id?: string;
  meetingId: string;
  userId: string;
  description: string;
  assignee?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  category?: string | null;
  status?: TaskStatus;
  order?: number;
  isAiGenerated?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Task {
  private readonly _id?: string;
  private readonly _meetingId: string;
  private readonly _userId: string;
  private _description: string;
  private _assignee?: string | null;
  private _dueDate?: Date | null;
  private _priority: TaskPriority;
  private _category?: string | null;
  private _status: TaskStatus;
  private _order: number;
  private _isAiGenerated: boolean;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: TaskProto) {
    this._id = proto.id;
    this._meetingId = proto.meetingId;
    this._userId = proto.userId;
    this._description = proto.description;
    this._assignee = proto.assignee;
    this._dueDate = proto.dueDate;
    this._priority = proto.priority ?? TaskPriority.MEDIUM;
    this._category = proto.category;
    this._status = proto.status ?? TaskStatus.TODO;
    this._order = proto.order ?? 0;
    this._isAiGenerated = proto.isAiGenerated ?? true;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id() {
    return this._id;
  }
  get meetingId() {
    return this._meetingId;
  }
  get userId() {
    return this._userId;
  }
  get description() {
    return this._description;
  }
  get status() {
    return this._status;
  }
  get order() {
    return this._order;
  }
  get assignee() {
    return this._assignee;
  }
  get dueDate() {
    return this._dueDate;
  }
  get priority() {
    return this._priority;
  }
  get category() {
    return this._category;
  }
  get isAiGenerated() {
    return this._isAiGenerated;
  }

  setDescription(value: string) {
    this._description = value;
  }
  setStatus(value: TaskStatus) {
    this._status = value;
  }
  setOrder(value: number) {
    this._order = value;
  }
  setPriority(value: TaskPriority) {
    this._priority = value;
  }
  setAssignee(value?: string | null) {
    this._assignee = value;
  }
  setDueDate(value?: Date | null) {
    this._dueDate = value;
  }
  setCategory(value?: string | null) {
    this._category = value;
  }

  toJSON() {
    return {
      id: this._id,
      meetingId: this._meetingId,
      userId: this._userId,
      description: this._description,
      assignee: this._assignee,
      dueDate: this._dueDate,
      priority: this._priority,
      category: this._category,
      status: this._status,
      order: this._order,
      isAiGenerated: this._isAiGenerated,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
