import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { UPDATE_PAYMENT_SCHEMA } from './schema';

export class UpdatePaymentDto extends createZodDto(
  extendApi(UPDATE_PAYMENT_SCHEMA),
) {}

