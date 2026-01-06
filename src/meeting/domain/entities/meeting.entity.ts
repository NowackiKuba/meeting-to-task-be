export type MeetingProto = {
  id?: string;
  userId: string;
  title?: string | null;
  notes: string;
  status?: 'processing' | 'completed' | 'failed';
  errorMessage?: string | null;
  processedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MeetingJSON = {
  id: string;
  userId: string;
  title?: string | null;
  notes: string;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string | null;
  processedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Meeting {
  private readonly _id?: string;
  private readonly _userId: string;
  private _title?: string | null;
  private _notes: string;
  private _status: 'processing' | 'completed' | 'failed';
  private _errorMessage?: string | null;
  private _processedAt?: Date | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(proto: MeetingProto) {
    this._id = proto.id;
    this._userId = proto.userId;
    this._title = proto.title;
    this._notes = proto.notes;
    this._status = proto.status ?? 'processing';
    this._errorMessage = proto.errorMessage;
    this._processedAt = proto.processedAt;
    this._createdAt = proto.createdAt;
    this._updatedAt = proto.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get status(): 'processing' | 'completed' | 'failed' {
    return this._status;
  }

  get title(): string | null | undefined {
    return this._title;
  }

  get notes(): string {
    return this._notes;
  }

  get processedAt(): Date | null | undefined {
    return this._processedAt;
  }

  get errorMessage(): string | null | undefined {
    return this._errorMessage;
  }

  markCompleted(processedAt: Date = new Date()) {
    this._status = 'completed';
    this._processedAt = processedAt;
  }

  markFailed(message: string) {
    this._status = 'failed';
    this._errorMessage = message;
  }

  setTitle(title?: string | null) {
    this._title = title;
  }

  setNotes(notes: string) {
    this._notes = notes;
  }

  toJSON(): MeetingJSON {
    return {
      id: this._id,
      userId: this._userId,
      title: this._title,
      notes: this._notes,
      status: this._status,
      errorMessage: this._errorMessage,
      processedAt: this._processedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

