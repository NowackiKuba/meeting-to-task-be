import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MeetingQueueService {
  constructor(@InjectQueue('meeting') private readonly meetingQueue: Queue) {}
}
