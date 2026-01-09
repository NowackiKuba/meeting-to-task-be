import { Controller, Get, Query } from '@nestjs/common';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';
import {
  GetCreditByUserIdUseCase,
  GetCreditHistoryPaginatedUseCase,
} from 'src/credit/application/use-cases';
import { GetCreditHistoryPaginatedDto } from 'src/credit/application/dto';

@Controller('credits')
export class CreditsController {
  constructor(
    private readonly getCreditByUserIdUseCase: GetCreditByUserIdUseCase,
    private readonly getCreditHistoryPaginatedUseCase: GetCreditHistoryPaginatedUseCase,
  ) {}

  /**
   * GET /credits
   * Get current user's credit balance and information
   */
  @Get()
  async getCurrentUserCredit(@User() user: AuthUser) {
    try {
      const credit = await this.getCreditByUserIdUseCase.handle(user.id);
      return credit.toJSON();
    } catch (error: any) {
      // If credit account doesn't exist, return null or empty balance
      // This allows frontend to handle gracefully
      return {
        id: null,
        userId: user.id,
        balance: 0,
        baseBalance: 0,
        totalUsed: 0,
        lastUsedAt: null,
        lastResetAt: null,
        resetReason: null,
        metadata: null,
        createdAt: null,
        updatedAt: null,
      };
    }
  }

  /**
   * GET /credits/history
   * Get paginated credit transaction history for current user
   */
  @Get('history')
  async getCreditHistory(
    @Query() query: GetCreditHistoryPaginatedDto,
    @User() user: AuthUser,
  ) {
    return this.getCreditHistoryPaginatedUseCase.handle(user.id, query);
  }
}
