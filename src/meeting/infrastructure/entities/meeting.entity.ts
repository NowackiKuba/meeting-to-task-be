import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { TaskEntity } from '@task/infrastructure/entities/task.entity';

export type MeetingEntityProps = {
  id?: string;
  user: UserEntity;
  title?: string | null;
  notes: string;
  status?: 'processing' | 'completed' | 'failed';
  errorMessage?: string | null;
  processedAt?: Date | null;
};

@Entity({ tableName: 'meetings' })
export class MeetingEntity extends BaseEntity implements MeetingEntityProps {
  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Property({ length: 255, nullable: true })
  title?: string | null;

  @Property({ type: 'text' })
  notes!: string;

  @Property({ length: 20, default: 'processing' })
  status: 'processing' | 'completed' | 'failed' = 'processing';

  @Property({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @Property({ nullable: true })
  processedAt?: Date | null;

  @OneToMany(() => TaskEntity, (task) => task.meeting)
  tasks = new Collection<TaskEntity>(this);

  constructor(props: MeetingEntityProps) {
    super();
    this.id = props.id;
    this.user = props.user;
    this.title = props.title;
    this.notes = props.notes;
    this.status = props.status ?? this.status;
    this.errorMessage = props.errorMessage;
    this.processedAt = props.processedAt;
  }
}

