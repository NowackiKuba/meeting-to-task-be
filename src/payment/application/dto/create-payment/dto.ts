import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_PAYMENT_SCHEMA } from './schema';

export class CreatePaymentDto extends createZodDto(
  extendApi(CREATE_PAYMENT_SCHEMA),
) {}

