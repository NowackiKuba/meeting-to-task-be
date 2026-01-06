import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { TaskPriority, TaskStatus } from 'src/task/domain/entities/task.entity';

export type TaskEntityProps = {
  id?: string;
  meeting: MeetingEntity;
  user: UserEntity;
  description: string;
  assignee?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  category?: string | null;
  status?: TaskStatus;
  order?: number;
  isAiGenerated?: boolean;
};

@Entity({ tableName: 'tasks' })
export class TaskEntity extends BaseEntity implements TaskEntityProps {
  @ManyToOne(() => MeetingEntity)
  meeting!: MeetingEntity;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Property({ type: 'text' })
  description!: string;

  @Property({ length: 255, nullable: true })
  assignee?: string | null;

  @Property({ nullable: true })
  dueDate?: Date | null;

  @Property({ length: 20, default: 'medium' })
  priority: TaskPriority;

  @Property({ length: 255, nullable: true })
  category?: string | null;

  @Property({ length: 20, default: 'todo' })
  status: TaskStatus;

  @Property({ type: 'int', default: 0 })
  order: number = 0;

  @Property({ default: true })
  isAiGenerated: boolean = true;

  constructor(props: TaskEntityProps) {
    super();
    this.id = props.id;
    this.meeting = props.meeting;
    this.user = props.user;
    this.description = props.description;
    this.assignee = props.assignee;
    this.dueDate = props.dueDate;
    this.priority = props.priority ?? this.priority;
    this.category = props.category;
    this.status = props.status ?? this.status;
    this.order = props.order ?? this.order;
    this.isAiGenerated = props.isAiGenerated ?? this.isAiGenerated;
  }
}
