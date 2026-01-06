import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IMeetingRepository } from '@meeting/domain/ports/meeting.repository.port';
import { NotFoundError } from 'src/errors';
import { Meeting } from '@meeting/domain/entities/meeting.entity';

@Injectable()
export class GetMeetingByIdUseCase {
  constructor(
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(id: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.getById(id);
    if (!meeting) {
      throw new NotFoundError('Meeting', 'id');
    }
    return meeting;
  }
}

