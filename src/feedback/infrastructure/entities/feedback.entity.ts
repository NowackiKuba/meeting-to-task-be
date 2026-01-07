import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';
import { generateUUID } from 'src/utils/generate-uuid';

export type FeedbackEntityProps = {
  id?: string;
  user: UserEntity;
  rate: number;
  area: string;
  body?: string;
};

@Entity({ tableName: 'feedbacks' })
export class FeedbackEntity extends BaseEntity implements FeedbackEntityProps {
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @Property({ type: 'int', check: 'rate >= 1 AND rate <= 5' })
  rate: number;
  @Property({ type: 'text' })
  area: string;
  @Property({ type: 'text', nullable: true })
  body?: string;

  constructor(props: FeedbackEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.rate = props.rate;
    this.area = props.area;
    this.body = props.body;
  }
}
