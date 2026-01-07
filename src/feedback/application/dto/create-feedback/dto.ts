import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_FEEDBACK_SCHEMA } from './schema';

export class CreateFeedbackDto extends createZodDto(
  extendApi(CREATE_FEEDBACK_SCHEMA),
) {}

