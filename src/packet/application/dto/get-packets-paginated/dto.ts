import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { GET_PACKETS_PAGINATED_SCHEMA } from './schema';

export class GetPacketsPaginatedDto extends createZodDto(
  extendApi(GET_PACKETS_PAGINATED_SCHEMA),
) {}

