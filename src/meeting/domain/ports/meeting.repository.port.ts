import { Page } from 'src/utils/pagination';
import { Meeting } from '../entities/meeting.entity';

export type GetMeetingsPaginatedOptions = {
  limit: number;
  offset: number;
  status?: 'processing' | 'completed' | 'failed';
  search?: string;
};

export interface IMeetingRepository {
  create(meeting: Meeting): Promise<Meeting>;
  update(meeting: Meeting): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Meeting | null>;
  getAll(
    opts: GetMeetingsPaginatedOptions,
    userId: string,
  ): Promise<Page<Meeting>>;
}
