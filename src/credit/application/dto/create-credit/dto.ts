import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_CREDIT_HISTORY_SCHEMA } from './schema';

export class CreateCreditHistoryDto extends createZodDto(
  extendApi(CREATE_CREDIT_HISTORY_SCHEMA),
) {}
