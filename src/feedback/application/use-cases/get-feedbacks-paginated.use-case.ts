import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { Page } from 'src/utils/pagination';
import { Feedback } from 'src/feedback/domain/entities/feedback.entity';
import { IFeedbackRepository } from 'src/feedback/domain/ports/feedback.repository.port';
import { GetFeedbacksPaginatedTransformed } from '../dto/get-feedbacks-paginated';

@Injectable()
export class GetFeedbacksPaginatedUseCase {
  constructor(
    @Inject(Token.FeedbackRepository)
    private readonly feedbackRepository: IFeedbackRepository,
  ) {}

  async handle(
    filters: GetFeedbacksPaginatedTransformed,
  ): Promise<Page<Feedback>> {
    return this.feedbackRepository.getAll({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      orderBy: filters.orderBy ?? 'desc',
      orderByField: filters.orderByField ?? 'createdAt',
      area: filters.area,
      rate: filters.rate,
      search: filters.search,
    });
  }
}

