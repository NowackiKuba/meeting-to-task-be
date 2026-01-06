import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MeetingsController } from './infrastructure/adapters/inbound/http/meetings.controller';
import { Token } from 'src/constant';
import {
  CreateMeetingUseCase,
  DeleteMeetingUseCase,
  GetMeetingByIdUseCase,
  GetMeetingsPaginatedUseCase,
  UpdateMeetingUseCase,
} from './application/use-cases';
import { MeetingMapper } from './infrastructure/mappers/meeting.mapper';
import { MeetingRepository } from './infrastructure/adapters/outbound/persistence/meeting.repository';
import { MeetingEntity } from './infrastructure/entities/meeting.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([MeetingEntity, UserEntity])],
  controllers: [MeetingsController],
  providers: [
    CreateMeetingUseCase,
    DeleteMeetingUseCase,
    GetMeetingByIdUseCase,
    GetMeetingsPaginatedUseCase,
    UpdateMeetingUseCase,
    MeetingMapper,
    {
      provide: Token.MeetingRepository,
      useClass: MeetingRepository,
    },
  ],
  exports: [Token.MeetingRepository],
})
export class MeetingsModule {}

