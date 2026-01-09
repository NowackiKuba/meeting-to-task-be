import z from 'zod';
import { EMAIL_SCHEMA, PASSWORD_SCHEMA } from 'src/utils/schemas/zod';

export const CREATE_USER_SCHEMA = z.strictObject({
  email: EMAIL_SCHEMA,
  password: PASSWORD_SCHEMA,
  confirmPassword: PASSWORD_SCHEMA,
  name: z.string().min(1).max(255).optional(),
  stripeCustomerId: z.string().optional(),
});

export type CreateUserInput = z.input<typeof CREATE_USER_SCHEMA>;
export type CreateUserTransformed = z.output<typeof CREATE_USER_SCHEMA>;
