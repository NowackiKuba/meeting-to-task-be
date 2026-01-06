import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';
import { v4 as uuid } from 'uuid';
import {
  GetUsageUseCase,
  GetUserPaymentsUseCase,
  GetSubscriptionUseCase,
} from '@subscription/application/use-cases';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly getUserPaymentsUseCase: GetUserPaymentsUseCase,
    private readonly getUsageUseCase: GetUsageUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
  ) {}

  @Get()
  async get(@User() user: AuthUser) {
    return await this.getSubscriptionUseCase.handle(user.id);
  }

  @Post('checkout')
  async checkout(
    @User() user: AuthUser,
    @Body() body: { tier: 'basic' | 'pro' },
  ) {
    const sub = {
      id: uuid(),
      userId: user.id,
      tier: body.tier,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    return { checkout_url: 'https://stripe.test/checkout', session_id: sub.id };
  }

  @Post('portal')
  async portal() {
    return { portal_url: 'https://stripe.test/portal' };
  }

  @Post('webhook')
  async webhook() {
    return { received: true };
  }

  @Post('cancel')
  async cancel() {
    // TODO: replace stub with real cancel use-case
    return { success: true };
  }

  @Post('resume')
  async resume() {
    // TODO: replace stub with real resume use-case
    return { success: true };
  }

  @Get('payments')
  async payments(@User() user: AuthUser) {
    return this.getUserPaymentsUseCase.handle(user.id);
  }

  @Get('usage')
  async usage(@User() user: AuthUser) {
    return this.getUsageUseCase.handle(user.id);
  }
}
