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
import {
  CreateTaskDto,
  UpdateTaskDto,
  BulkUpdateTasksDto,
  GetTasksPaginatedDto,
} from '@task/application/dto';
import {
  BulkUpdateTasksUseCase,
  CreateTaskUseCase,
  DeleteTaskUseCase,
  GetMeetingTasksUseCase,
  UpdateTaskUseCase,
} from '@task/application/use-cases';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';

@Controller()
export class TasksController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
    private readonly getMeetingTasks: GetMeetingTasksUseCase,
    private readonly bulkUpdateTasks: BulkUpdateTasksUseCase,
  ) {}

  @Get('meetings/:meetingId/tasks')
  async getMeetingTasksRoute(
    @Param('meetingId') meetingId: string,
    @Query() query: GetTasksPaginatedDto,
  ) {
    return this.getMeetingTasks.handle(meetingId, {
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    });
  }

  @Post('meetings/:meetingId/tasks')
  async create(
    @Param('meetingId') meetingId: string,
    @Body() body: CreateTaskDto,
    @User() user: AuthUser,
  ) {
    return this.createTask.handle(body, meetingId, user.id, body['order'] ?? 0);
  }

  @Patch('tasks/:id')
  async update(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.updateTask.handle(id, body);
  }

  @Delete('tasks/:id')
  async delete(@Param('id') id: string) {
    await this.deleteTask.handle(id);
    return { success: true };
  }

  @Post('tasks/bulk-update')
  async bulkUpdate(@Body() body: BulkUpdateTasksDto) {
    return this.bulkUpdateTasks.handle(body.task_ids, body.updates);
  }
}
