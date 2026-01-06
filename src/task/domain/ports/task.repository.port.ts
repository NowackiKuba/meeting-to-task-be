import { Page } from 'src/utils/pagination';
import { Task, TaskStatus } from '../entities/task.entity';

export type GetTasksPaginatedOptions = {
  limit: number;
  offset: number;
  status?: TaskStatus;
};

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Task | null>;
  getByMeeting(
    meetingId: string,
    opts: GetTasksPaginatedOptions,
  ): Promise<Page<Task>>;
  bulkUpdate(ids: string[], updates: Partial<Task>): Promise<void>;
}
