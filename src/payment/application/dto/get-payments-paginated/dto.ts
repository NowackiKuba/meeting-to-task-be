import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { GET_PAYMENTS_PAGINATED_SCHEMA } from './schema';

export class GetPaymentsPaginatedDto extends createZodDto(
  extendApi(GET_PAYMENTS_PAGINATED_SCHEMA),
) {}

