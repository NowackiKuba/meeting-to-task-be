import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { CREATE_USER_SCHEMA } from './schema';

export class CreateUserDto extends createZodDto(
  extendApi(CREATE_USER_SCHEMA),
) {}
