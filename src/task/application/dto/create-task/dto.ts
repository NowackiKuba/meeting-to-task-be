import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_TASK_SCHEMA } from './schema';

export class CreateTaskDto extends createZodDto(
  extendApi(CREATE_TASK_SCHEMA),
) {}

