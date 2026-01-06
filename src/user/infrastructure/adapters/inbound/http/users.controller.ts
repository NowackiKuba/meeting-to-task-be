import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  @Get('me')
  async me(@Req() req: Request) {
    return { user: req['user'] ?? null };
  }
}

