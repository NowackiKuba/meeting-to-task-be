import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_PACKET_SCHEMA } from './schema';

export class CreatePacketDto extends createZodDto(
  extendApi(CREATE_PACKET_SCHEMA),
) {}

