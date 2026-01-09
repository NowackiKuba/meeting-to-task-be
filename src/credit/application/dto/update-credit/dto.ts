import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { UPDATE_CREDIT_SCHEMA } from './schema';

export class UpdateCreditDto extends createZodDto(
  extendApi(UPDATE_CREDIT_SCHEMA),
) {}
