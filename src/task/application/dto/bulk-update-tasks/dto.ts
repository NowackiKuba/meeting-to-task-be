import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { BULK_UPDATE_TASKS_SCHEMA } from './schema';

export class BulkUpdateTasksDto extends createZodDto(
  extendApi(BULK_UPDATE_TASKS_SCHEMA),
) {}

