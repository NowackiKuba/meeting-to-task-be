import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { differenceInMonths } from 'date-fns';
import { Token } from 'src/constant';
import { ISubscriptionRepository } from 'src/subscription/domain/ports/subscription.repository.port';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';

@Injectable()
export class ResetLimitsSchedule {
  private readonly logger = new Logger(ResetLimitsSchedule.name);

  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processUsers() {
    this.logger.debug('Starting ResetLimitsSchedule.processUsers ...');
    const users = await this.userRepository.getAll();
    this.logger.debug(
      `Fetched ${users.length} users to check for limit resets.`,
    );

    await Promise.all(
      users.map(async (user) => {
        this.logger.debug(
          `Checking user ${user.id ?? '[no-id]'} (${user.email}) | Last reset at: ${user.lastLimitsResetAt}`,
        );

        const diff = differenceInMonths(new Date(), user.lastLimitsResetAt);
        this.logger.debug(
          `Months since last reset for user ${user.id ?? '[no-id]'}: ${diff}`,
        );

        if (diff >= 1) {
          this.logger.debug(
            `User ${user.id ?? '[no-id]'} eligible for usage reset. Fetching subscription...`,
          );
          const subscription = await this.subscriptionRepository.getByUserId(
            user.id,
          );

          let usageLimit: number;
          if (subscription) {
            const tasksPerMonth = Number(
              subscription.packet.features.get('tasks_per_month'),
            );
            usageLimit = isNaN(tasksPerMonth) ? 5 : tasksPerMonth;
            this.logger.debug(
              `Found subscription for user ${user.id ?? '[no-id]'}: resetting usage with subscribed tasks_per_month = ${usageLimit}`,
            );
            user.resetUsage(usageLimit);
          } else {
            usageLimit = 5;
            this.logger.debug(
              `No subscription found for user ${user.id ?? '[no-id]'}: resetting usage with default = 5`,
            );
            user.resetUsage(usageLimit);
          }

          await this.userRepository.update(user);
          this.logger.log(
            `Reset usage limits for user ${user.id ?? '[no-id]'} (${user.email}) to ${usageLimit}`,
          );
        } else {
          this.logger.debug(
            `User ${user.id ?? '[no-id]'} not eligible for reset (diff = ${diff}). Skipping.`,
          );
        }
      }),
    );
    this.logger.debug('Finished ResetLimitsSchedule.processUsers run.');
  }
}
