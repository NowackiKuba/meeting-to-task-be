import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { GET_TASKS_PAGINATED_SCHEMA } from './schema';

export class GetTasksPaginatedDto extends createZodDto(
  extendApi(GET_TASKS_PAGINATED_SCHEMA),
) {}

