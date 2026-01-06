import z from 'zod';
import { EMAIL_SCHEMA, PASSWORD_SCHEMA } from 'src/utils/schemas/zod';

export const LOGIN_SCHEMA = z.strictObject({
  email: EMAIL_SCHEMA,
  password: PASSWORD_SCHEMA,
});

export type LoginInput = z.input<typeof LOGIN_SCHEMA>;
export type LoginTransformed = z.output<typeof LOGIN_SCHEMA>;
