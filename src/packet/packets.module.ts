import { Module } from '@nestjs/common';
import { PacketsController } from './infrastructure/adapters/inbound/http/packets.controller';
import { Token } from 'src/constant';
import { PacketRepository } from './infrastructure/adapters/outbound/persistence/packet.repository';
import { GetPacketsUseCase, SeedPacketsUseCase } from './application/use-cases';
import { PacketMapper } from './infrastructure/mappers/packet.mapper';

@Module({
  controllers: [PacketsController],
  providers: [
    { provide: Token.PacketRepository, useClass: PacketRepository },
    SeedPacketsUseCase,
    GetPacketsUseCase,
    PacketMapper,
  ],
})
export class PacketsModule {}
