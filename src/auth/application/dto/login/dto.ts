import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { LOGIN_SCHEMA } from './schema';

export class LoginDto extends createZodDto(extendApi(LOGIN_SCHEMA)) {}

