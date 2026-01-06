import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { GET_MEETINGS_PAGINATED_SCHEMA } from './schema';

export class GetMeetingsPaginatedDto extends createZodDto(
  extendApi(GET_MEETINGS_PAGINATED_SCHEMA),
) {}
