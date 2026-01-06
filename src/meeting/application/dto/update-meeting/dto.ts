import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { UPDATE_MEETING_SCHEMA } from './schema';

export class UpdateMeetingDto extends createZodDto(
  extendApi(UPDATE_MEETING_SCHEMA),
) {}

