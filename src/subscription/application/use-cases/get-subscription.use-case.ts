import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ISubscriptionRepository } from 'src/subscription/domain/ports/subscription.repository.port';
import { Subscription } from 'src/subscription/domain/entities/subscription.entity';

@Injectable()
export class GetSubscriptionUseCase {
  constructor(
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async handle(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.getByUserId(userId);
  }
}

