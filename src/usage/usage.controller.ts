import { Controller, Get } from '@nestjs/common';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';

@Controller('usage')
export class UsageController {
  @Get()
  async get(@User() user: AuthUser) {
    return {
      meetings_processed: 0,
      meetings_limit: user?.tier === 'pro' ? 999999 : user?.tier === 'basic' ? 50 : 5,
      resets_at: new Date(),
      current_tier: user?.tier ?? 'free',
    };
  }
}

