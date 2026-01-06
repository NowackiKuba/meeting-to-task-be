import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { Meeting } from '@meeting/domain/entities/meeting.entity';
import { IMeetingRepository } from '@meeting/domain/ports/meeting.repository.port';
import { CreateMeetingTransformed } from '../dto/create-meeting';

@Injectable()
export class CreateMeetingUseCase {
  constructor(
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(
    payload: CreateMeetingTransformed,
    userId: string,
  ): Promise<Meeting> {
    const meeting = new Meeting({
      userId,
      title: payload.title,
      notes: payload.notes,
      status: 'processing',
    });
    return this.meetingRepository.create(meeting);
  }
}
