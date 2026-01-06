import { z } from 'zod';

export const MAILER_CONFIG_SCHEMA = z.object({
  EMAIL_FROM: z.string().default('spotboost'),
  EMAIL_USER: z.string(),
});

export type MailerConfig = z.infer<typeof MAILER_CONFIG_SCHEMA>;
