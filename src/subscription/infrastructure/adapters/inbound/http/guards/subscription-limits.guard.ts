import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Token } from 'src/constant';
import { ISubscriptionRepository } from 'src/subscription/domain/ports/subscription.repository.port';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';

@Injectable()
export class SubscriptionLimitsGuard implements CanActivate {
  constructor(
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      console.log('NO USER');
      return false;
    }
    const dbUser = await this.userRepository.findById(user.id);

    if (!dbUser) {
      console.log(' NO DB USER ');
      return false;
    }
    const baseLimits = dbUser.meetingsLimit;
    const currentUsage = dbUser.meetingsProcessedThisMonth;

    if (currentUsage + 1 > baseLimits) {
      throw new Error(
        'You have reached your meetings limit for this month. Please upgrade your plan or wait until your limits reset.',
      );
    }

    return true;
  }
}
