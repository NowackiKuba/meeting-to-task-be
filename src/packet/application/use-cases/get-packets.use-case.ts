import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { IPacketRepository } from 'src/packet/domain/ports/packet.repository.port';
import { GetPacketsPaginatedTransformed } from '../dto';

@Injectable()
export class GetPacketsUseCase {
  constructor(
    @Inject(Token.PacketRepository)
    private readonly packetRepository: IPacketRepository,
  ) {}

  async handle(payload: GetPacketsPaginatedTransformed) {
    const packets = await this.packetRepository.getAll(payload);

    return packets;
  }
}
