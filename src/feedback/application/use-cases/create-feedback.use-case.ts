import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { Feedback } from 'src/feedback/domain/entities/feedback.entity';
import { IFeedbackRepository } from 'src/feedback/domain/ports/feedback.repository.port';
import { CreateFeedbackTransformed } from '../dto/create-feedback';

@Injectable()
export class CreateFeedbackUseCase {
  constructor(
    @Inject(Token.FeedbackRepository)
    private readonly feedbackRepository: IFeedbackRepository,
  ) {}

  async handle(
    payload: CreateFeedbackTransformed,
    userId: string,
  ): Promise<Feedback> {
    const feedback = new Feedback({
      userId,
      rate: payload.rate,
      area: payload.area,
      body: payload.body,
    });

    return this.feedbackRepository.create(feedback);
  }
}
