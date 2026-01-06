import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IMeetingRepository } from '@meeting/domain/ports/meeting.repository.port';
import { UpdateMeetingTransformed } from '../dto/update-meeting';
import { NotFoundError } from 'src/errors';

@Injectable()
export class UpdateMeetingUseCase {
  constructor(
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(payload: UpdateMeetingTransformed, id: string) {
    const meeting = await this.meetingRepository.getById(id);
    if (!meeting) {
      throw new NotFoundError('Meeting', 'id');
    }
    if (payload.title !== undefined) {
      meeting.setTitle(payload.title);
    }
    if (payload.notes !== undefined) {
      meeting.setNotes(payload.notes);
    }
    await this.meetingRepository.update(meeting);
    return meeting;
  }
}
