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
import { CreateTaskDto } from '@task/application/dto/create-task';
import { UpdateTaskDto } from '@task/application/dto/update-task';
import {
  BulkUpdateTasksUseCase,
  CreateTaskUseCase,
  DeleteTaskUseCase,
  GetMeetingTasksUseCase,
  UpdateTaskUseCase,
} from '@task/application/use-cases';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';
import { TaskPriority, TaskStatus } from 'src/task/domain/entities/task.entity';

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
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.getMeetingTasks.handle(meetingId, {
      limit: Number(limit) || 50,
      offset: Number(offset) || 0,
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
  async bulkUpdate(
    @Body()
    body: {
      task_ids: string[];
      updates: { status?: TaskStatus; priority?: TaskPriority };
    },
  ) {
    return this.bulkUpdateTasks.handle(body.task_ids, body.updates);
  }
}
