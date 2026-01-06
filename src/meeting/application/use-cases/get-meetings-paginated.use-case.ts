import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IMeetingRepository } from '@meeting/domain/ports/meeting.repository.port';
import { GetMeetingsPaginatedTransformed } from '../dto/get-meetings-paginated';
import { Page } from 'src/utils/pagination';
import { Meeting } from '@meeting/domain/entities/meeting.entity';

@Injectable()
export class GetMeetingsPaginatedUseCase {
  constructor(
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(
    opts: GetMeetingsPaginatedTransformed,
    userId: string,
  ): Promise<Page<Meeting>> {
    return this.meetingRepository.getAll(
      {
        limit: opts.limit ?? 20,
        offset: opts.offset ?? 0,
        status: opts.status,
        search: opts.search,
      },
      userId,
    );
  }
}
