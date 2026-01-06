import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IMeetingRepository } from '@meeting/domain/ports/meeting.repository.port';

@Injectable()
export class DeleteMeetingUseCase {
  constructor(
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
  ) {}

  async handle(id: string): Promise<void> {
    await this.meetingRepository.delete(id);
  }
}
