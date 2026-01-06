import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { IntegrationService } from '@integration/integration.service';
import { User } from '@auth/infrastructure/decorators/user.decorator';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';
import { v4 as uuid } from 'uuid';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  async list(@User() user: AuthUser) {
    return this.integrationService.list(user.id);
  }

  @Post('asana/connect')
  async connectAsana(@User() user: AuthUser) {
    return { auth_url: 'https://app.asana.com/-/oauth_authorize' };
  }

  @Post('asana/callback')
  async callback(@User() user: AuthUser) {
    const record = this.integrationService.add({
      id: uuid(),
      userId: user.id,
      provider: 'asana',
    });
    return record;
  }

  @Post('asana/push')
  async push(@Body() body: { task_ids: string[]; project_id: string }) {
    return { pushed: body.task_ids.length, project_id: body.project_id };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    this.integrationService.remove(id);
    return { success: true };
  }
}

