import { Module } from '@nestjs/common';
import { IntegrationsController } from './infrastructure/adapters/inbound/http/integrations.controller';
import { IntegrationService } from './integration.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationsModule {}

