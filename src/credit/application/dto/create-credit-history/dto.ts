import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_CREDIT_SCHEMA } from './schema';

export class CreateCreditDto extends createZodDto(
  extendApi(CREATE_CREDIT_SCHEMA),
) {}
