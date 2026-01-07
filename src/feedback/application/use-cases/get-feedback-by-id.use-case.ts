import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Token } from 'src/constant';
import { Feedback } from 'src/feedback/domain/entities/feedback.entity';
import { IFeedbackRepository } from 'src/feedback/domain/ports/feedback.repository.port';

@Injectable()
export class GetFeedbackByIdUseCase {
  constructor(
    @Inject(Token.FeedbackRepository)
    private readonly feedbackRepository: IFeedbackRepository,
  ) {}

  async handle(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.getById(id);

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }
}

