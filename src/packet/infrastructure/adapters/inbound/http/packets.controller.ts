import { Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/auth/infrastructure/decorators/public.decorator';
import { GetPacketsPaginatedDto } from 'src/packet/application/dto';
import {
  GetPacketsUseCase,
  SeedPacketsUseCase,
} from 'src/packet/application/use-cases';

@Controller('packets')
export class PacketsController {
  constructor(
    private readonly seedPacketsUseCase: SeedPacketsUseCase,
    private readonly getPacketsUseCase: GetPacketsUseCase,
  ) {}

  @Post('/seed')
  @Public()
  async seed() {
    return await this.seedPacketsUseCase.handle();
  }

  @Get('')
  async getAllPackets(@Query() opts: GetPacketsPaginatedDto) {
    return await this.getPacketsUseCase.handle(opts);
  }
}
