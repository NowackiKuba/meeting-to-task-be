import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMeetingDto } from '@meeting/application/dto/create-meeting';
import { UpdateMeetingDto } from '@meeting/application/dto/update-meeting';
import { GetMeetingsPaginatedDto } from '@meeting/application/dto/get-meetings-paginated';
import {
  CreateMeetingUseCase,
  DeleteMeetingUseCase,
  GetMeetingByIdUseCase,
  GetMeetingsPaginatedUseCase,
  UpdateMeetingUseCase,
} from '@meeting/application/use-cases';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';

@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly createMeeting: CreateMeetingUseCase,
    private readonly getMeetingById: GetMeetingByIdUseCase,
    private readonly getMeetingsPaginated: GetMeetingsPaginatedUseCase,
    private readonly updateMeeting: UpdateMeetingUseCase,
    private readonly deleteMeeting: DeleteMeetingUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateMeetingDto, @User() user: AuthUser) {
    return this.createMeeting.handle(body, user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getMeetingById.handle(id);
  }

  @Get()
  async getAll(
    @Query() query: GetMeetingsPaginatedDto,
    @User() user: AuthUser,
  ) {
    return this.getMeetingsPaginated.handle(query, user.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateMeetingDto) {
    return this.updateMeeting.handle(body, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteMeeting.handle(id);
    return { success: true };
  }

  @Post(':id/reprocess')
  async reprocess(@Param('id') id: string) {
    // Placeholder for reprocess logic
    const meeting = await this.getMeetingById.handle(id);
    meeting.markCompleted(new Date());
    await this.updateMeeting.handle({}, id);
    return meeting;
  }
}
