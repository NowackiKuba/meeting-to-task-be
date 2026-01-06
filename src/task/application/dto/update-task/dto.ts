import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { UPDATE_TASK_SCHEMA } from './schema';

export class UpdateTaskDto extends createZodDto(
  extendApi(UPDATE_TASK_SCHEMA),
) {}

