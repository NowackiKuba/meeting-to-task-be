import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { GET_CREDIT_HISTORY_PAGINATED_SCHEMA } from './schema';

export class GetCreditHistoryPaginatedDto extends createZodDto(
  extendApi(GET_CREDIT_HISTORY_PAGINATED_SCHEMA),
) {}
