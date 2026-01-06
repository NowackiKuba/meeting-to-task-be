import { Controller, Get } from '@nestjs/common';
import { AuthUser } from 'src/auth/domain/interfaces/auth-user.interface';
import { User } from 'src/auth/infrastructure/decorators/user.decorator';
import { GetUserByIdUseCase } from 'src/user/application/use-cases';

@Controller('users')
export class UsersController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}
  @Get('me')
  async me(@User() user: AuthUser) {
    return await this.getUserByIdUseCase.handle(user.id);
  }
}
