import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';
import { ISubscriptionRepository } from 'src/subscription/domain/ports/subscription.repository.port';
import { SubscriptionTier } from 'src/subscription/domain/entities/subscription.entity';

export type UsageStats = {
  usedMeetings: number;
  limit: number;
  resetsInDays: number;
};

@Injectable()
export class GetUsageUseCase {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async handle(userId: string): Promise<UsageStats> {
    const user = await this.userRepository.findById(userId);
    const subscription = await this.subscriptionRepository.getByUserId(userId);

    const tier =
      subscription?.tier ?? user?.currentTier ?? SubscriptionTier.FREE;
    const limitFromTier =
      tier === SubscriptionTier.PRO
        ? 999999
        : tier === SubscriptionTier.BASIC
          ? 50
          : 5;
    const limit = user?.meetingsLimit ?? limitFromTier;

    const usedMeetings = user?.meetingsProcessedThisMonth ?? 0;
    const billingStart = user?.billingCycleStart ?? new Date();
    const cycleDays = 30;
    const elapsedMs = Date.now() - billingStart.getTime();
    const elapsedDays = Math.max(
      0,
      Math.floor(elapsedMs / (1000 * 60 * 60 * 24)),
    );
    const resetsInDays = Math.max(0, cycleDays - elapsedDays);

    return { usedMeetings, limit, resetsInDays };
  }
}
