import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);

