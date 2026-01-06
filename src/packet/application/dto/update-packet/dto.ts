import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { UPDATE_PACKET_SCHEMA } from './schema';

export class UpdatePacketDto extends createZodDto(
  extendApi(UPDATE_PACKET_SCHEMA),
) {}

