import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_CHECKOUT_SESSION_SCHEMA } from './schema';

export class CreateCheckoutSessionDto extends createZodDto(
  extendApi(CREATE_CHECKOUT_SESSION_SCHEMA),
) {}
