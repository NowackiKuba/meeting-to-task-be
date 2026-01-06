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
import { GetMeetingTasksUseCase } from 'src/task/application/use-cases';
import { GetTasksPaginatedDto } from 'src/task/application/dto';
import { ExportTasksUseCase } from 'src/task/application/use-cases/export-tasks.use-case';

@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly createMeeting: CreateMeetingUseCase,
    private readonly getMeetingById: GetMeetingByIdUseCase,
    private readonly getMeetingsPaginated: GetMeetingsPaginatedUseCase,
    private readonly updateMeeting: UpdateMeetingUseCase,
    private readonly deleteMeeting: DeleteMeetingUseCase,
    private readonly getMeetingTasksUseCase: GetMeetingTasksUseCase,
    private readonly exportTasksUseCase: ExportTasksUseCase,
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

  @Get('/:id/tasks')
  async getTasks(@Param('id') id: string, @Query() opts: GetTasksPaginatedDto) {
    return await this.getMeetingTasksUseCase.handle(id, opts);
  }

  @Post('/:id/export')
  async export(
    @Param('id') id: string,
    @Query('mode') mode: 'csv' | 'json' | 'markdown',
  ) {
    switch (mode) {
      case 'csv':
        return await this.exportTasksUseCase.csv(id);
      case 'json':
        return await this.exportTasksUseCase.json(id);
      case 'markdown':
        return await this.exportTasksUseCase.markdown(id);
    }
  }
}
