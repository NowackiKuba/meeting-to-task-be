import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { GET_FEEDBACKS_PAGINATED_SCHEMA } from './schema';

export class GetFeedbacksPaginatedDto extends createZodDto(
  extendApi(GET_FEEDBACKS_PAGINATED_SCHEMA),
) {}

