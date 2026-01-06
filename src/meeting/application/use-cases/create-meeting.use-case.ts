import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { Meeting } from '@meeting/domain/entities/meeting.entity';
import { IMeetingRepository } from '@meeting/domain/ports/meeting.repository.port';
import { CreateMeetingTransformed } from '../dto/create-meeting';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CreateMeetingUseCase {
  constructor(
    @Inject(Token.MeetingRepository)
    private readonly meetingRepository: IMeetingRepository,
    @InjectQueue('meeting-queue') private readonly meetingQueue: Queue,
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
    const newMeeting = this.meetingRepository.create(meeting);

    await this.meetingQueue.add('process', {
      meetingId: (await newMeeting).id,
      userId,
    });

    return newMeeting;
  }
}
