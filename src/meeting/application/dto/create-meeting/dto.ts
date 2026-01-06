import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_MEETING_SCHEMA } from './schema';

export class CreateMeetingDto extends createZodDto(
  extendApi(CREATE_MEETING_SCHEMA),
) {}
