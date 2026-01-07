import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  CreateFeedbackDto,
  GetFeedbacksPaginatedDto,
} from '@feedback/application/dto';
import {
  CreateFeedbackUseCase,
  GetFeedbackByIdUseCase,
  GetFeedbacksPaginatedUseCase,
} from '@feedback/application/use-cases';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly createFeedbackUseCase: CreateFeedbackUseCase,
    private readonly getFeedbackByIdUseCase: GetFeedbackByIdUseCase,
    private readonly getFeedbacksPaginatedUseCase: GetFeedbacksPaginatedUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateFeedbackDto, @User() user: AuthUser) {
    return this.createFeedbackUseCase.handle(body, user.id);
  }

  @Get()
  async getAll(@Query() query: GetFeedbacksPaginatedDto) {
    return this.getFeedbacksPaginatedUseCase.handle(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getFeedbackByIdUseCase.handle(id);
  }
}
